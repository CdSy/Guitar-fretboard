import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

enum NoteTypes {
  base,
  sharp
}

interface Note {
  value: string;
  bgColor: string;
  color: string;
  type: number;
}

const NOTES: Array<Note> = [
  {value: 'C', bgColor: '#01e70b', color: '#fff', type: NoteTypes.base},
  {value: 'C#', bgColor: '#02fea9', color: '#000', type: NoteTypes.sharp},
  {value: 'D', bgColor: '#006cfd', color: '#fff', type: NoteTypes.base},
  {value: 'D#', bgColor: '#3003f2', color: '#fff', type: NoteTypes.sharp},
  {value: 'E', bgColor: '#8001ce', color: '#fff', type: NoteTypes.base},
  {value: 'F', bgColor: '#3f0250', color: '#fff', type: NoteTypes.base},
  {value: 'F#', bgColor: '#6c0056', color: '#fff', type: NoteTypes.sharp},
  {value: 'G', bgColor: '#db0000', color: '#fff', type: NoteTypes.base},
  {value: 'G#', bgColor: '#db411b', color: '#fff', type: NoteTypes.sharp},
  {value: 'A', bgColor: '#ff8800', color: '#fff', type: NoteTypes.base},
  {value: 'A#', bgColor: '#ecfe08', color: '#000', type: NoteTypes.sharp},
  {value: 'B', bgColor: '#9af301', color: '#000', type: NoteTypes.base},
];

const DEFAULT_TUNING = {
  0: {value: 4},
  1: {value: 11},
  2: {value: 7},
  3: {value: 2},
  4: {value: 9},
  5: {value: 4},
  6: {value: 11},
  7: {value: 6},
  8: {value: 1},
  9: {value: 8},
};

interface InitializeParams {
  canvas: HTMLCanvasElement;
  theme?: ColorPalette;
  strings?: number;
  showBaseNotes?: boolean;
  showMediumNotes?: boolean;
}

@Injectable()
export class FretboardDrawerService {
  ratio: number;
  frets: Array<Fret>;
  theme: ColorPalette;
  numberOfFrets: number;
  amountOfStrings: number;
  gapBetweenStrings: number;
  paddingTop: number;
  paddingRight: number;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // State
  tuning$ = new BehaviorSubject<{[key: string]: {value: number}}>(DEFAULT_TUNING);
  tuning: {[key: string]: {value: number}} = DEFAULT_TUNING;
  currentScale: Array<number>;
  scaleFromFret: number;
  showBaseNotes: boolean;
  showMediumNotes: boolean;

  constructor() {
    // this is an approxumation of the tempered scale
    // geometric progression ratio 2^(1/12)
    this.ratio = 0.94;
    this.frets = new Array();
  }

  public initialize({canvas, theme, strings = 6, showBaseNotes = true, showMediumNotes = true}) {
    this.numberOfFrets = 24;
    this.gapBetweenStrings = 28;
    this.paddingTop = 20;
    this.paddingRight = 20;
    this.amountOfStrings = strings;
    this.showBaseNotes = showBaseNotes;
    this.showMediumNotes = showMediumNotes;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.fixDPI(this.canvas);
    this.width = Number(getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2));
    this.height = Number(getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2));
    this.theme = {...this.theme, ...theme};

    this.drawFretboard();
  }

  private fixDPI(canvas) {
    const context = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = Number(getComputedStyle(canvas).getPropertyValue('width').slice(0, -2));
      const oldHeight = 12 + (this.paddingTop * 2) + (this.gapBetweenStrings * (this.amountOfStrings - 1));

      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;

      canvas.style.width = oldWidth + 'px';
      canvas.style.height = oldHeight + 'px';

      context.scale(ratio, ratio);
    }
  }

  public redraw() {
    this.clear();
    this.fixDPI(this.canvas);
    this.height = Number(getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2));
    this.drawFretboard();
  }

  private generateNotesForFret(fretNumber: number): Array<Note> {
    const notes = Object.keys(this.tuning).slice(0, this.amountOfStrings).map(string => {
      const baseNote = this.tuning[string].value;
      const allNotesLength = NOTES.length - 1;
      fretNumber = fretNumber > 12 ? fretNumber - 12 : fretNumber;
      let indexOfNextNote = baseNote + fretNumber;

      if (indexOfNextNote > allNotesLength) {
        indexOfNextNote = (indexOfNextNote - allNotesLength) - 1;
      }

      return NOTES[indexOfNextNote];
    });

    return notes;
  }

  private drawFret(entry, index) {
    const notes = this.generateNotesForFret(index + 1);
    entry.draw(notes);
  }

  public drawScale(scalePattern: Array<number>, fromFret: number = 3, span: number = 8) {
    let pos = fromFret;
    let string = this.amountOfStrings - 1;
    let step = 0;

    do {
      if (step === 0) {
        this.frets[pos].mark(string, this.theme.fundamental);
      } else {
        this.frets[pos].mark(string);
      }

      pos += scalePattern[step];
      step++;

      if (step >= scalePattern.length) {
        step = 0;
      }

      if (pos > fromFret + 3) {
        pos -= (string === 2 ? 4 : 5);
        string--;
      }
    } while (string >= 0 && --span > 0);
  }

  public changeStringAmount(value: number) {
    this.amountOfStrings = value;

    this.redraw();
  }

  public changeNotes(value: {[key: string]: {value: number}}) {
    this.tuning = value;

    this.tuning$.next(value);
    this.redraw();
  }

  public changeShowNotes(value, type) {
    this[type] = value;

    this.redraw();
  }

  public changeTheme(value) {
    this.theme = value;

    this.redraw();
  }

  private clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawFretboard() {
    // inizializza i Frets
    const fullWidth = this.width - this.paddingRight;
    let from = fullWidth + (fullWidth * 0.3);
    const originWidth = fullWidth + (fullWidth * 0.3);

    for (let i = 0; i < this.numberOfFrets; i++) {
      const width = from * (1 - this.ratio);
      const dot = [3, 5, 7, 9, 12, 15, 17, 19, 21, 23].indexOf(i + 1) >= 0;

      this.frets[i] = new Fret({
        start: originWidth - from,
        width: width,
        height: this.height,
        amountOfStrings: this.amountOfStrings,
        gapBetweenStrings: this.gapBetweenStrings,
        paddingTop: this.paddingTop,
        showBaseNotes: this.showBaseNotes,
        showMediumNotes: this.showMediumNotes,
        canvas: this.canvas,
        dot: dot,
        theme: this.theme
      });

      from -= width;
    }

    this.frets.forEach((entry, index) => this.drawFret(entry, index));

    // Draw zero nut
    this.ctx.fillStyle = this.theme.fret;
    this.ctx.fillRect(0, this.paddingTop, 5, this.height - (this.paddingTop * 2));
  }

  private getCurrentTuning(): Observable<{[key: string]: {value: number}}> {
    return this.tuning$.asObservable();
  }

}

interface FretParameters {
  start: number;
  width: number;
  height: number;
  amountOfStrings: number;
  gapBetweenStrings: number;
  paddingTop: number;
  showBaseNotes: boolean;
  showMediumNotes: boolean;
  canvas: HTMLCanvasElement;
  dot: boolean;
  theme: ColorPalette;
}

class Fret {
  private dot: boolean;
  private start: number;
  private width: number;
  private height: number;
  private amountOfStrings: number;
  private gapBetweenStrings: number;
  private paddingTop: number;
  private showBaseNotes: boolean;
  private showMediumNotes: boolean;
  private canvas: HTMLCanvasElement;
  private theme: ColorPalette;
  private ctx: CanvasRenderingContext2D;

  constructor({
    start,
    width,
    height,
    amountOfStrings,
    gapBetweenStrings,
    paddingTop,
    showBaseNotes,
    showMediumNotes,
    canvas,
    dot,
    theme
  }: FretParameters) {
    this.gapBetweenStrings = gapBetweenStrings;
    this.paddingTop = paddingTop;
    this.start = start;
    this.width = width;
    this.height = height - (this.paddingTop * 2);
    this.amountOfStrings = amountOfStrings;
    this.showBaseNotes = showBaseNotes;
    this.showMediumNotes = showMediumNotes;
    this.canvas = canvas;
    this.dot = dot;
    this.theme = theme;
    this.ctx = canvas.getContext('2d');
  }

  public draw(notes: Array<Note>): void {
    // the dot
    if (this.dot === true) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.theme.dot;
      this.ctx.arc(this.start + this.width / 2, this.height + (this.paddingTop * 1.5), 3, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    // the neck
    this.ctx.beginPath();
    this.ctx.fillStyle = this.theme.neck;
    this.ctx.fillRect(this.start, this.paddingTop, this.width, this.height);

    // the nut
    this.ctx.fillStyle = this.theme.fret;
    this.ctx.fillRect(this.start + this.width - 3, this.paddingTop, 3, this.height);

    // the strings
    this.ctx.fillStyle = this.theme.string;

    for (let string = 0; string < this.amountOfStrings; string++) {
      this.ctx.fillRect(this.start, this.findString(string), this.width, 2);
    }

    this.ctx.fill();

    // notes
    for (let string = 0; string < this.amountOfStrings; string++) {
      const note = notes[string];
      const noteType = note.type;
      const showNote = noteType === NoteTypes.base && this.showBaseNotes ||
        noteType === NoteTypes.sharp && this.showMediumNotes;

      if (showNote) {
        const x = this.start + this.width / 2;
        const y = this.findString(string);

        this.ctx.font = '10px Helvetica';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.beginPath();
        this.ctx.fillStyle = note.bgColor;
        this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.fillStyle = note.color;
        this.ctx.fillText(note.value, x, y);
      }
    }
  }

  public mark(string: number, color?: string): void {
    this.ctx.beginPath();
    color = (typeof color === 'undefined') ? this.theme.scale : color;
    this.ctx.fillStyle = color;
    this.ctx.arc(this.start + this.width / 2, this.findString(string) , 10, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  private findString(number: number): number {
    return (5 + this.gapBetweenStrings * number) + this.paddingTop;
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
