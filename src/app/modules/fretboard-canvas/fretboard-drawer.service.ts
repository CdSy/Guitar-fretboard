import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, fromEvent, timer, empty } from 'rxjs';
import { filter, repeat, take, takeUntil, switchMap } from 'rxjs/operators';
import { EventManager, SyntheticEvent } from './event-manager.service';
import { NoteTypes, HandTypes, ColorPalette, ScaleModes } from './models';
import { Fret } from './fret';
import { NoteElement } from './note';
import { Notes } from './notes';
import { CanvasLayer } from './layer';

const NOTES: Notes = new Notes();

const DEFAULT_TUNING = [4, 11, 7, 2, 9, 4, 11, 6, 1, 8];

export interface InitializeParams {
  fretLayer: HTMLCanvasElement;
  noteLayer: HTMLCanvasElement;
  theme?: ColorPalette;
  showFlatNotes?: boolean;
  showSharpNotes?: boolean;
  showGhostNotes?: boolean;
  numberOfStrings?: number;
  numberOfFrets?: number;
  handType?: number;
  scaleMode?: number;
  tuning?: Array<number>;
}

@Injectable()
export class FretboardDrawerService implements OnDestroy {
  frets: Array<Fret>;
  notes: Array<Array<NoteElement>>;

  ratio: number;
  edgeDistance: number;
  gapBetweenStrings: number;
  paddingLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  fretLayer: CanvasLayer;
  noteLayer: CanvasLayer;

  // Event streams
  canvasHeight$ = new BehaviorSubject<number>(300);
  onDestroy$ = new Subject<void>();
  resize$ = window ? fromEvent(window, 'resize') : empty();
  clickOnElement$: Observable<SyntheticEvent>;
  longClick$: Observable<SyntheticEvent>;
  pointerDown$: Observable<SyntheticEvent>;
  pointerMove$: Observable<SyntheticEvent>;
  pointerUp$: Observable<SyntheticEvent>;

  // User settings
  handType: number;
  numberOfFrets: number;
  numberOfStrings: number;
  theme: ColorPalette;

  // State
  tuning$ = new Subject<Array<number>>();
  tuning: Array<number>;
  scalePattern: Array<number>;
  scaleMode: number;
  showFlatNotes: boolean;
  showSharpNotes: boolean;
  showGhostNotes: boolean;
  tonic: string;
  notesInGamma: Array<string> = [];
  buildFromFret: number;
  buildFromString: number;
  scaleNotesOnStrings: Array<Array<string>>;


  // Animate state
  noteOffset: number;
  currentString: number;
  currentStringTuning: number;
  fretWidth: number;
  shiftX: number;
  shiftY: number;
  startPointX: number;
  startPointY: number;

  constructor(private eventManager: EventManager) {
    // this is an approxumation of the tempered scale
    // geometric progression ratio 2^(1/12)
    this.ratio = 0.94;
    this.frets = new Array();
    this.notes = new Array();
    this.scaleNotesOnStrings = new Array();

    this.resize$.subscribe(_ => this.redraw());
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public initialize({
    fretLayer,
    noteLayer,
    showFlatNotes = true,
    showSharpNotes = true,
    showGhostNotes = false,
    numberOfStrings = 6,
    numberOfFrets = 24,
    handType = HandTypes.R,
    tuning = DEFAULT_TUNING,
    scaleMode = 0,
    theme
  }: InitializeParams) {
    this.edgeDistance = 10;
    this.gapBetweenStrings = 28;
    this.numberOfFrets = Number(numberOfFrets);
    this.numberOfStrings = Number(numberOfStrings);
    this.handType = handType;
    this.showFlatNotes = showFlatNotes;
    this.showSharpNotes = showSharpNotes;
    this.showGhostNotes = showGhostNotes;
    this.scaleMode = scaleMode;
    this.tuning = tuning;
    this.paddingLeft = this.handType === HandTypes.R ? 26 : 0;
    this.paddingTop = 20;
    this.paddingRight = this.handType === HandTypes.R ? 0 : 26;
    this.paddingBottom = 25;

    const width = Number(getComputedStyle(fretLayer).getPropertyValue('width').slice(0, -2));
    const height = this.calculateHeight();
    const commonParams = {
      width,
      height,
      paddingLeft: this.paddingLeft,
      paddingRight: this.paddingRight,
      paddingTop: this.paddingTop,
      paddingBottom: this.paddingBottom
    };

    this.fretLayer = new CanvasLayer({canvas: fretLayer, ...commonParams});
    this.noteLayer = new CanvasLayer({canvas: noteLayer, ...commonParams});
    this.theme = {...this.theme, ...theme};

    this.pointerDown$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'mousedown')
      .pipe(takeUntil(this.onDestroy$));

    this.pointerMove$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'mousemove');
    this.pointerUp$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'mouseup');

    this.subscribeToEvents();
    this.drawFretboard();
    this.drawNotes();
  }

  private subscribeToEvents() {
    this.clickOnElement$ = this.pointerDown$.pipe(
      switchMap(() => this.pointerUp$.pipe(takeUntil(timer(200))))
    );

    this.clickOnElement$
      .pipe(filter(_ => Boolean(this.scalePattern)))
      .subscribe((event: SyntheticEvent) => this.drawScale(event));

    this.longClick$ = this.pointerDown$.pipe(
      filter((event: SyntheticEvent) => event.target !== undefined),
      switchMap(
        () => timer(300).pipe(takeUntil(this.pointerUp$)),
        (outerValue) => outerValue
      )
    );

    this.longClick$.subscribe((event: SyntheticEvent) => {
      const target = event.target;
      const x = target.x;
      const y = target.y;

      this.shiftX =  x - event.srcEvent.layerX;
      this.shiftY = y - event.srcEvent.layerY;
      this.startPointX = x;
      this.startPointY = y;
      this.currentStringTuning = this.tuning[target.string];
      this.currentString = target.string;

      this.moveNotes(event);
    });

    this.longClick$.pipe(
      switchMap(() => this.pointerMove$),
      takeUntil(this.pointerUp$),
      repeat()
    ).subscribe((event: SyntheticEvent) => this.moveNotes(event));

    this.longClick$.pipe(
      switchMap(() => this.pointerUp$),
      take(1),
      repeat()
    ).subscribe((event: SyntheticEvent) => {
      this.shiftX =  0;
      this.shiftY = 0;
      this.startPointX = 0;
      this.startPointY = 0;
      this.tuning[this.currentString] = this.currentStringTuning;
      this.tuning$.next(this.tuning);

      this.alignAnimate(200).subscribe(_ => {
        this.eventManager.clearElements();
        this.eventManager.registerElements(this.notes);
      });
    });
  }

  private moveNotes(event: SyntheticEvent) {
    const { width, pr, pl } = this.noteLayer.getRect();
    const isRightHand = this.handType === HandTypes.R;
    const padding = isRightHand ? pl : pr;
    const pointerX = isRightHand ?
      event.srcEvent.layerX + this.shiftX - padding :
      (width - event.srcEvent.layerX) - this.shiftX; // Cursor position with shift related on note position

    const stringNumber = this.currentString;

    const startFret = isRightHand ?
      Math.ceil((this.startPointX - padding) / this.fretWidth) :
      Math.ceil((width - this.startPointX) / this.fretWidth);

    const currenFret = Math.ceil(pointerX / this.fretWidth);

    const fretDifference = startFret - currenFret; // How many frets passed from start
    const newStringTuning = NOTES.findNextIndex(this.tuning[stringNumber], fretDifference); // Set new start note

    const noteOffset = isRightHand ?
      pointerX - ((currenFret * this.fretWidth) - (this.fretWidth / 2)) :
      ((currenFret * this.fretWidth) - (this.fretWidth / 2)) - pointerX; // Offset from X point of center of fret

    const fretsLength = this.frets.length;

    this.noteOffset = noteOffset;
    this.currentStringTuning = newStringTuning;
    this.notes[stringNumber] = new Array(fretsLength + 2); // +2 for left and right notes

    for (let fret = 0; fret < fretsLength; fret++) {
      const isActive = currenFret - 1 === fret;

      this.notes[stringNumber][fret] = this.createNoteForFret(this.currentStringTuning + 1, fret, stringNumber, noteOffset, isActive);
    }

    // Draw notes outside fretboard on left and right
    this.notes[stringNumber].push(this.createNoteForFret(this.currentStringTuning, -1, stringNumber, noteOffset));
    this.notes[stringNumber].push(this.createNoteForFret(this.currentStringTuning, this.numberOfFrets + 1, stringNumber, noteOffset));

    this.redrawNotes();
  }

  private alignAnimate(duration): Observable<void> {
    return new Observable((observer) => {
      const startTime = performance.now();
      const from = this.noteOffset;
      const tuning = this.currentStringTuning;
      const string = this.currentString;
      let passedTime = 0;

      const animate = (now) => {
        passedTime = now - startTime;
        const stepSize = passedTime / duration; // 0-1
        let transition = from * stepSize;

        if (passedTime > duration) {
          passedTime = duration;
          transition = from * 1;
        }

        const offset = from - transition;

        this.notes[string] = new Array(this.numberOfFrets + 2); // +2 for left and right notes

        for (let fret = 0; fret < this.numberOfFrets; fret++) {
          this.notes[string][fret] = this.createNoteForFret(tuning + 1, fret, string, offset);
        }

        // Draw notes outside fretboard on left and right
        this.notes[string].push(this.createNoteForFret(tuning, -1, string, offset));
        this.notes[string].push(this.createNoteForFret(tuning, this.numberOfFrets + 1, string, offset));

        this.redrawNotes();

        if (passedTime !== duration) {
          requestAnimationFrame(animate);
        } else {
          observer.next();
          observer.complete();
        }
      };

      animate(startTime);
    });
  }

  private redrawNotes() {
    this.noteLayer.clear();
    this.notes.forEach(string => string.forEach(note => note.draw()));
    this.drawNut();
  }

  private redraw() {
    this.fretLayer.update();
    this.noteLayer.update();
    this.drawFretboard();
    this.drawNotes();
  }

  private createNoteForFret(
    baseNote: number, fretNumber: number, string: number, offset: number = 0, isActive: boolean = false
  ): NoteElement {
    const isRightHand = this.handType === HandTypes.R;
    const fret = Math.max(0, Math.min(this.numberOfFrets - 1, fretNumber));
    const { center } = this.frets[fret];
    const y = this.frets[fret].findY(string) + 1; // 1px == half of string height
    const note = NOTES.findNext(baseNote, fretNumber < 0 ? 0 : fretNumber);
    const { name, type, bgColor, color } = note;
    const { isRoot, inScale } = this.recognizeNote(fret, string, name);
    const backgroundColor = isRoot ? this.theme.root : inScale ? this.theme.scale : bgColor;
    const textColor = isRoot || inScale ? '#fff' : color;

    let shift = 0;

    if (fretNumber < 0) {
      shift = isRightHand ? fretNumber * this.fretWidth : Math.abs(fretNumber * this.fretWidth);
    }

    if (fretNumber >= this.numberOfFrets) {
      shift = (fretNumber - this.numberOfFrets) * this.fretWidth;

      if (!isRightHand) {
        shift = -shift;
      }
    }

    const showNote = !this.tonic && (type === NoteTypes.base && this.showFlatNotes ||
      type === NoteTypes.sharp && this.showSharpNotes);

    const noteElement = new NoteElement({
      context: this.noteLayer.context,
      x: center + shift + offset,
      y,
      fret: fretNumber,
      string: string,
      name,
      type,
      display: showNote,
      isRoot: isRoot,
      inScale: inScale,
      ghostMode: this.tonic && this.showGhostNotes,
      isActive: isActive,
      bgColor: backgroundColor,
      color: textColor,
    });

    return noteElement;
  }

  private drawNotes() {
    const stringsLength = this.numberOfStrings;
    const fretsLength = this.numberOfFrets;
    const strings = new Array(stringsLength);

    for (let string = 0; string < stringsLength; string++) {
      const baseNote = this.tuning[string] + 1;
      const notes = new Array(fretsLength);

      for (let fret = 0; fret < fretsLength; fret++) {
        notes[fret] = this.createNoteForFret(baseNote, fret, string);
      }

      strings[string] = notes;
    }

    this.notes = strings;
    this.eventManager.clearElements();
    this.eventManager.registerElements(this.notes);
    this.notes.forEach(string => string.forEach(note => note.draw()));
    this.drawNut();
  }

  public drawScale(event: SyntheticEvent) {
    if (!event.target && this.tonic) {
      this.tonic = null;
      this.notesInGamma = [];

      this.noteLayer.clear();
      this.drawNotes();
      return;
    }

    if (!event.target) {
      return;
    }

    const { name, fret, string } = event.target;

    this.tonic = name;
    this.buildFromFret = Number(fret);
    this.buildFromString = string;

    this.generateNotesForScale();
    this.noteLayer.clear();
    this.drawNotes();
  }

  public generateNotesForScale() {
    this.notesInGamma = this.scalePattern.reduce((data, stepSize) => {
      const nextNote = NOTES.findNext(data.prevNote, stepSize);

      data.notes.push(nextNote.name);
      data.prevNote = nextNote.name;

      return data;
    }, {prevNote: this.tonic, notes: [this.tonic]}).notes;
  }

  roundRect(ctx: CanvasRenderingContext2D, options) {
    const { x, y, width, height, radius = [4, 4, 4, 4], color, fill = true, stroke = false } = options;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.moveTo(x + radius[0], y);
    ctx.lineTo(x + width - radius[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
    ctx.lineTo(x + width, y + height - radius[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
    ctx.lineTo(x + radius[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
    ctx.lineTo(x, y + radius[0]);
    ctx.quadraticCurveTo(x, y, x + radius[0], y);
    ctx.closePath();

    if (fill) {
      ctx.fill();
    }

    if (stroke) {
      ctx.stroke();
    }
  }

  private drawNut() {
    const { x, pl, pr, y, width, height } = this.noteLayer.getRect();
    const isRightHand = this.handType === HandTypes.R;
    const radius = isRightHand ? [8, 0 , 0, 8] : [0, 8 , 8, 0];
    const start = isRightHand ? 0 : width;

    this.roundRect(this.noteLayer.context, {
      x: start,
      y: y,
      width: isRightHand ? pl : pr,
      height: height,
      radius: radius,
      color: '#565656'
    });

    for (let string = 0; string < this.numberOfStrings; string++) {
      const pointY = (this.edgeDistance + this.gapBetweenStrings * string) + y + 1;
      const baseNote = NOTES[this.tuning[string]];
      const centerX = isRightHand ? x / 2 : width + (pr / 2);
      const { name, type } = baseNote;

      const note = new NoteElement({
        context: this.noteLayer.context,
        x: centerX,
        y: pointY,
        fret: 0,
        string: string,
        name,
        type,
        display: true,
        isRoot: false,
        inScale: false,
        bgColor: '#fff',
        color: '#000',
      });

      note.draw();
    }
  }

  private drawFretboard() {
    const { x , y, width, height } = this.fretLayer.getRect();
    const isRightHand = this.handType === HandTypes.R;
    const originWidth = x + width;
    const fretWidth = width / this.numberOfFrets;
    let from = isRightHand ? width : fretWidth;

    this.frets = new Array(this.numberOfFrets);
    this.fretWidth = fretWidth;

    for (let i = 0; i < this.numberOfFrets; i++) {
      const dot = [3, 5, 7, 9, 12, 15, 17, 19, 21, 23].indexOf(i + 1) >= 0;

      this.frets[i] = new Fret({
        context: this.fretLayer.context,
        x: originWidth - from,
        y: y,
        width: fretWidth,
        height: height,
        numberOfStrings: this.numberOfStrings,
        gapBetweenStrings: this.gapBetweenStrings,
        edgeDistance: this.edgeDistance,
        handType: this.handType,
        dot: dot,
        theme: this.theme
      });

      if (isRightHand) {
        from -= fretWidth;
      } else {
        from += fretWidth;
      }
    }

    this.frets.forEach((entry, index) => entry.draw(index));
  }

  private calculateHeight() {
    const height = (this.edgeDistance * 2 + 2) +
      (this.paddingTop + this.paddingBottom) +
      (this.gapBetweenStrings * (this.numberOfStrings - 1));

    this.canvasHeight$.next(height);

    return height;
  }

  public changeStringAmount(value: number) {
    this.numberOfStrings = Number(value);

    // Recalculate height. const 12 is gaps on the sides of the neck (10px) + height of last string (2px)
    const height = this.calculateHeight();

    this.fretLayer.height = height;
    this.noteLayer.height = height;

    this.redraw();
  }

  public changeFret(value: number) {
    this.numberOfFrets = Number(value);
    this.redraw();
  }

  public changeTheme(value) {
    this.theme = value;

    this.drawFretboard();
    this.noteLayer.clear();
    this.drawNotes();
  }

  public changeShowNotes(value, type) {
    this[type] = value;

    this.noteLayer.clear();
    this.drawNotes();
  }

  public changeScale(sequence: Array<number>) {
    this.scalePattern = sequence;

    if (this.tonic) {
      this.generateNotesForScale();
      this.noteLayer.clear();
      this.drawNotes();
    }
  }

  public changeScaleMode(mode: number) {
    this.scaleMode = mode;

    if (this.tonic) {
      this.noteLayer.clear();
      this.drawNotes();
    }
  }

  public changeHandType(value: number) {
    this.handType = value;

    this.fretLayer.invertAxis();
    this.noteLayer.invertAxis();
    this.redraw();
  }

  public getCurrentTuning(): Observable<Array<number>> {
    return this.tuning$.asObservable();
  }

  public getCanvasHeight(): Observable<number> {
    return this.canvasHeight$.asObservable();
  }

  private recognizeNote(fret: number, string: number, noteName: string): {isRoot: boolean, inScale: boolean} {
    if (!this.tonic) {
      return { isRoot: false, inScale: false };
    }

    if (this.scaleMode === ScaleModes.Full) {
      const isRoot = this.tonic === noteName;
      const inScale = this.notesInGamma.includes(noteName);

      return { isRoot, inScale };
    } else if (fret === 0) {
      this.scaleNotesOnStrings[string] = [];
    }

    if (this.scaleMode === ScaleModes.Vertical) {
      return this.calculateVerticalMode(fret, string, noteName);
    }

    if (this.scaleMode === ScaleModes.Shifted) {
      return this.calculateShiftedMode(fret, string, noteName);
    }
  }

  private calculateVerticalMode(fret: number, string: number, noteName: string): {isRoot: boolean, inScale: boolean} {
    const range = [this.buildFromFret - 1, this.buildFromFret + 4];
    const inRange = fret >= range[0] && fret <= range[1];
    const prevString = Math.max(0, string - 1);
    const alreadyDrawed = this.scaleNotesOnStrings[prevString].includes(noteName);
    let isRoot = false;
    let inScale = false;

    if (!inRange) {
      return { isRoot, inScale };
    }

    if (!alreadyDrawed) {
      isRoot = this.tonic === noteName;
      inScale = this.notesInGamma.includes(noteName);
    }

    if (isRoot || inScale) {
      this.scaleNotesOnStrings[string].push(noteName);
    }

    return { isRoot, inScale };
  }

  private calculateShiftedMode(fret: number, string: number, noteName: string): {isRoot: boolean, inScale: boolean} {
    if (this.scaleNotesOnStrings[string].length === 4) {
      return { isRoot: false, inScale: false };
    }

    const from = string < 2 ? this.buildFromFret + 1 : this.buildFromFret;
    const to = from + 5;
    const range = [from, to];
    const inRange = fret >= range[0] && fret <= range[1];
    const prevString = Math.max(0, string - 1);
    const alreadyDrawed = this.scaleNotesOnStrings[prevString].includes(noteName);
    let isRoot = false;
    let inScale = false;


    if (!inRange) {
      return { isRoot, inScale };
    }

    if (!alreadyDrawed) {
      isRoot = this.tonic === noteName;
      inScale = this.notesInGamma.includes(noteName);
    }

    if (isRoot || inScale) {
      this.scaleNotesOnStrings[string].push(noteName);
    }

    return { isRoot, inScale };
  }
}
