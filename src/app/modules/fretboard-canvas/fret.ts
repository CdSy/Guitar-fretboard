import { ColorPalette } from './fretboard-drawer.service';

export class Fret {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private context: CanvasRenderingContext2D;
  private numberOfStrings: number;
  private gapBetweenStrings: number;
  private dot: boolean;
  private theme: ColorPalette;

  constructor({
    context,
    x,
    y,
    width,
    height,
    numberOfStrings,
    gapBetweenStrings,
    dot,
    theme
  }) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gapBetweenStrings = gapBetweenStrings;
    this.numberOfStrings = numberOfStrings;
    this.dot = dot;
    this.theme = theme;
  }

  public draw(index: number): void {
    // the dot
    if (this.dot === true) {
      this.context.beginPath();
      this.context.fillStyle = this.theme.dot;
      this.context.arc(this.x + this.width / 2, this.height + (this.y * 1.5), 3, 0, 2 * Math.PI);
      this.context.fill();
    }

    // the neck
    this.context.beginPath();
    this.context.fillStyle = this.theme.neck;
    this.context.fillRect(this.x, this.y, this.width, this.height);

    if (index === 0 ) {
      // Draw zero nut
      this.context.fillStyle = this.theme.fret;
      this.context.fillRect(0, this.y, 5, this.height);
    }

    // the nut
    this.context.fillStyle = this.theme.fret;
    this.context.fillRect(this.x + this.width - 3, this.y, 3, this.height);

    // the strings
    this.context.fillStyle = this.theme.string;

    for (let string = 0; string < this.numberOfStrings; string++) {
      this.context.fillRect(this.x, this.findY(string), this.width, 2);
    }

    this.context.fill();
  }

  public findY(number: number): number {
    return (5 + this.gapBetweenStrings * number) + this.y;
  }
}
