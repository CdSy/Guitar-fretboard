import { IViewNote } from './models';

export class NoteElement implements IViewNote {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  radius: number;
  fontSize: number;
  fret: number;
  string: number;
  name: string;
  type: number;
  display: boolean;
  isFundamental: boolean;
  inScale: boolean;
  isActive?: boolean;
  bgColor: string;
  color: string;

  constructor({
    context,
    x,
    y,
    fret,
    string,
    name,
    type,
    display,
    isFundamental,
    inScale,
    isActive = false,
    bgColor,
    color,
  }) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.radius = isActive ? 14 : 10;
    this.fontSize = isActive ? 14 : 10;
    this.fret = fret;
    this.string = string;
    this.name = name;
    this.type = type;
    this.display = display;
    this.isFundamental = isFundamental;
    this.inScale = inScale;
    this.isActive = isActive;
    this.bgColor = bgColor;
    this.color = color;
  }

  draw() {
    if (this.isFundamental || this.inScale || this.display) {
      this.context.font = `${this.fontSize}px Helvetica`;
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';

      this.context.beginPath();
      this.context.fillStyle = this.bgColor;
      this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.context.fill();


      // if (this.isFundamental) {
      //   this.context.strokeStyle = '#b33027';
      //   this.context.lineWidth = 2;
      //   this.context.stroke();
      // }

      this.context.fillStyle = this.color;
      this.context.fillText(this.name, this.x, this.y);
    }
  }
}
