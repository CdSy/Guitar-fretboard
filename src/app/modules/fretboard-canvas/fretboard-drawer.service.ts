import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { filter, repeat, take, takeUntil, switchMap } from 'rxjs/operators';
import { EventManager, SyntheticEvent } from './event-manager';
import { Fret } from './fret';
import { NoteElement } from './note';
import { CanvasLayer } from './layer';

export enum NoteTypes {
  base,
  sharp
}

interface Note {
  name: string;
  bgColor: string;
  color: string;
  type: number;
}

const NOTES: Array<Note> = [
  {name: 'C', bgColor: '#01e70b', color: '#fff', type: NoteTypes.base},
  {name: 'C#', bgColor: '#02fea9', color: '#000', type: NoteTypes.sharp},
  {name: 'D', bgColor: '#006cfd', color: '#fff', type: NoteTypes.base},
  {name: 'D#', bgColor: '#3003f2', color: '#fff', type: NoteTypes.sharp},
  {name: 'E', bgColor: '#8001ce', color: '#fff', type: NoteTypes.base},
  {name: 'F', bgColor: '#3f0250', color: '#fff', type: NoteTypes.base},
  {name: 'F#', bgColor: '#6c0056', color: '#fff', type: NoteTypes.sharp},
  {name: 'G', bgColor: '#db0000', color: '#fff', type: NoteTypes.base},
  {name: 'G#', bgColor: '#db411b', color: '#fff', type: NoteTypes.sharp},
  {name: 'A', bgColor: '#ff8800', color: '#fff', type: NoteTypes.base},
  {name: 'A#', bgColor: '#ecfe08', color: '#000', type: NoteTypes.sharp},
  {name: 'B', bgColor: '#9af301', color: '#000', type: NoteTypes.base},
];

const DEFAULT_TUNING = [4, 11, 7, 2, 9, 4, 11, 6, 1, 8];

export interface InitializeParams {
  fretLayer: HTMLCanvasElement;
  noteLayer: HTMLCanvasElement;
  theme?: ColorPalette;
  showFlatNotes?: boolean;
  showSharpNotes?: boolean;
  numberOfStrings?: number;
}

@Injectable()
export class FretboardDrawerService {
  frets: Array<Fret>;
  notes: Array<Array<NoteElement>>;

  theme: ColorPalette;
  ratio: number;
  numberOfFrets: number;
  numberOfStrings: number;
  gapBetweenStrings: number;
  width: number;
  height: number;
  paddingLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  fretLayer: CanvasLayer;
  noteLayer: CanvasLayer;
  fretLayerCtx: CanvasRenderingContext2D;
  noteLayerCtx: CanvasRenderingContext2D;

  resize$ = fromEvent(window, 'resize');
  pointerDown$: Observable<SyntheticEvent>;
  pointerMove$: Observable<SyntheticEvent>;
  pointerUp$: Observable<SyntheticEvent>;


  // State
  tuning$ = new BehaviorSubject<Array<number>>(DEFAULT_TUNING);
  tuning: Array<number> = DEFAULT_TUNING;
  currentScale: Array<number>;
  scaleFromFret: number;
  showFlatNotes: boolean;
  showSharpNotes: boolean;

  constructor(private eventManager: EventManager) {
    // this is an approxumation of the tempered scale
    // geometric progression ratio 2^(1/12)
    this.ratio = 0.94;
    this.frets = new Array();
    this.notes = new Array();

    this.resize$.subscribe(_ => this.redraw());
  }

  public initialize({fretLayer, noteLayer, theme, showFlatNotes = true, showSharpNotes = true, numberOfStrings = 6}: InitializeParams) {
    this.numberOfFrets = 24;
    this.gapBetweenStrings = 28;
    this.paddingLeft = 0;
    this.paddingTop = 20;
    this.paddingRight = 20;
    this.paddingBottom = 20;
    this.numberOfStrings = numberOfStrings;
    this.showFlatNotes = showFlatNotes;
    this.showSharpNotes = showSharpNotes;

    const width = Number(getComputedStyle(fretLayer).getPropertyValue('width').slice(0, -2));
    const height = 12 + (this.paddingTop * 2) + (this.gapBetweenStrings * (this.numberOfStrings - 1));
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

    this.pointerDown$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'pointerdown');
    this.pointerMove$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'pointermove');
    this.pointerUp$ = this.eventManager.addEventListener(this.noteLayer.canvas, 'pointerup');

    this.subscribeToEvents();
    this.drawFretboard();
    this.drawNotes();
  }

  private subscribeToEvents() {
    this.pointerDown$.pipe(
      filter((event: SyntheticEvent) => event.target !== undefined)
    ).subscribe((event: SyntheticEvent) => {
      console.log(event, 'CLICK');
    });

    this.pointerDown$.pipe(
      filter((event: SyntheticEvent) => event.target !== undefined),
      switchMap(() => this.pointerMove$),
      takeUntil(this.pointerUp$),
      repeat()
    ).subscribe((event: SyntheticEvent) => {
      console.log(event, 'MOVE');
    });

    this.pointerDown$.pipe(
      filter((event: SyntheticEvent) => event.target !== undefined),
      switchMap(() => this.pointerUp$),
      take(1),
      repeat()
    ).subscribe((event: SyntheticEvent) => {
      console.log(event, 'UP');
    });
  }

  private redraw() {
    this.eventManager.clearElements();
    this.fretLayer.update();
    this.noteLayer.update();
    this.drawFretboard();
    this.drawNotes();
  }

  private drawNotes() {
    const stringsLength = this.numberOfStrings;
    const fretsLength = this.frets.length;
    const allNotesLength = NOTES.length - 1;
    const strings = new Array(stringsLength);

    for (let string = 0; string < stringsLength; string++) {
      const baseNote = this.tuning[string] + 1;
      const notes = new Array(fretsLength);

      for (let fret = 0; fret < fretsLength; fret++) {
        const { x, width } = this.frets[fret];
        const y = this.frets[fret].findY(string);
        const center = x + width / 2;
        const fretNumber = fret > 11 ? fret - 12 : fret;
        let indexOfNextNote = baseNote + fretNumber;

        if (indexOfNextNote > allNotesLength) {
          indexOfNextNote = (indexOfNextNote - allNotesLength) - 1;
        }

        const note = NOTES[indexOfNextNote];
        const { name, type, bgColor, color } = note;

        const showNote = type === NoteTypes.base && this.showFlatNotes ||
          type === NoteTypes.sharp && this.showSharpNotes;

        notes[fret] = new NoteElement({
          context: this.noteLayer.context,
          x: center,
          y,
          fret,
          name,
          type,
          display: showNote,
          isFundamental: false,
          inScale: false,
          bgColor,
          color,
        });

        if (showNote) {
          this.eventManager.registerElement(notes[fret]);
        }
      }

      strings[string] = notes;
    }

    this.notes = strings;
    this.notes.forEach(string => string.forEach(note => note.draw()));
  }

  // public drawScale(scalePattern: Array<number>, fromFret: number = 3, span: number = 8) {
  //   let pos = fromFret;
  //   let string = this.numberOfStrings - 1;
  //   let step = 0;

  //   do {
  //     if (step === 0) {
  //       this.frets[pos].mark(string, this.theme.fundamental);
  //     } else {
  //       this.frets[pos].mark(string);
  //     }

  //     pos += scalePattern[step];
  //     step++;

  //     if (step >= scalePattern.length) {
  //       step = 0;
  //     }

  //     if (pos > fromFret + 3) {
  //       pos -= (string === 2 ? 4 : 5);
  //       string--;
  //     }
  //   } while (string >= 0 && --span > 0);
  // }

  private drawFretboard() {
    const {x , y, width, height } = this.fretLayer.getRect();
    let from = width + (width * 0.3);
    const originWidth = x + width + (width * 0.3);

    for (let i = 0; i < this.numberOfFrets; i++) {
      const fretWidth = from * (1 - this.ratio);
      const dot = [3, 5, 7, 9, 12, 15, 17, 19, 21, 23].indexOf(i + 1) >= 0;

      this.frets[i] = new Fret({
        context: this.fretLayer.context,
        x: originWidth - from,
        y: y,
        width: fretWidth,
        height: height,
        numberOfStrings: this.numberOfStrings,
        gapBetweenStrings: this.gapBetweenStrings,
        dot: dot,
        theme: this.theme
      });

      from -= fretWidth;
    }

    this.frets.forEach((entry, index) => entry.draw(index));
  }

  public changeStringAmount(value: number) {
    this.numberOfStrings = value;

    // Recalculate height. const 12 is gaps on the sides of the neck (10px) + height of last string (2px)
    const height = 12 + (this.paddingTop + this.paddingBottom) + (this.gapBetweenStrings * (this.numberOfStrings - 1));

    this.fretLayer.height = height;
    this.noteLayer.height = height;

    this.redraw();
  }

  public changeTheme(value) {
    this.theme = value;

    this.drawFretboard();
  }

  public changeNotes(value: Array<number>) {
    this.tuning = value;

    this.tuning$.next(value);
    this.drawNotes();
  }

  public changeShowNotes(value, type) {
    this[type] = value;

    this.noteLayer.clear();
    this.eventManager.clearElements();
    this.drawNotes();
  }

  public changeScale(sequence: Array<number>) {
    this.currentScale = sequence;
  }

  private getCurrentTuning(): Observable<Array<number>> {
    return this.tuning$.asObservable();
  }
}

export interface ColorPalette {
  neck?: string;
  dot?: string;
  fret?: string;
  string?: string;
  fundamental?: string;
  scale?: string;
}

const defaultTheme: ColorPalette = {
  neck: '#221709',
  dot: '#808080',
  fret: '#e2c196',
  string: '#fcf8f3',
  fundamental: '#87deb8',
  scale: '#87adde'
};

export const scaleSequences = {
  major: [2, 2, 1, 2, 2, 2, 1],
  jonian: [2, 2, 1, 2, 2, 2, 1],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  phrygian: [1, 2, 2, 2, 1, 2, 2],
  lydian: [2, 2, 2, 1, 2, 2, 1],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
  eolian: [2, 1, 2, 2, 1, 2, 2],
  locrian: [1, 2, 2, 1, 2, 2, 2],
  hexatonic: [2, 2, 2, 2, 2, 2],
  minor: [2, 1, 2, 2, 1, 2, 2],
  jazz_minor: [2, 1, 2, 2, 2, 2, 1],
};
