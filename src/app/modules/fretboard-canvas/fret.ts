import { ColorPalette } from './fretboard-drawer.service';

export class Fret {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private context: CanvasRenderingContext2D;
  private numberOfStrings: number;
  private gapBetweenStrings: number;
  private edgeDistance: number;
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
    edgeDistance,
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
    this.edgeDistance = edgeDistance;
    this.dot = dot;
    this.theme = theme;
  }

  public draw(index: number): void {
    // the neck
    this.context.beginPath();
    this.context.fillStyle = this.theme.neck;
    this.context.fillRect(this.x, this.y, this.width, this.height);

    // the fret
    this.context.fillStyle = this.theme.fret;
    this.context.fillRect(this.x + this.width - 3, this.y, 3, this.height);

    // the strings
    this.context.fillStyle = this.theme.string;

    for (let string = 0; string < this.numberOfStrings; string++) {
      this.context.fillRect(this.x - 1, this.findY(string), this.width + 1, 2);
    }

    this.context.fill();

    // the dot
    if (this.dot === true) {
      this.context.font = '8px Helvetica';
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';

      this.context.beginPath();
      this.context.fillStyle = this.theme.dot;
      this.context.arc(this.x + this.width / 2, this.height + (this.y * 1.8), 8, 0, 2 * Math.PI);
      this.context.fill();

      this.context.fillStyle = '#fff';
      this.context.fillText(String(index + 1), this.x + this.width / 2, this.height + (this.y * 1.8));
    }
  }

  public findY(number: number): number {
    return (this.edgeDistance + this.gapBetweenStrings * number) + this.y;
  }

  public get center() {
    return (this.x - 1.5) + (this.width / 2); // 1.5px == half of nut width
  }
}
