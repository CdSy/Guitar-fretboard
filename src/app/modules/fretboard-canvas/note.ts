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
  isRoot: boolean;
  inScale: boolean;
  isActive?: boolean;
  ghostMode?: boolean;
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
    isRoot,
    inScale,
    isActive = false,
    ghostMode = false,
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
    this.isRoot = isRoot;
    this.inScale = inScale;
    this.isActive = isActive;
    this.ghostMode = ghostMode;
    this.bgColor = bgColor;
    this.color = color;
  }

  draw() {
    if (this.isRoot || this.inScale || this.display) {
      this.drawCircle();
      this.drawText();
    }

    if (this.ghostMode && !this.isRoot && !this.inScale) {
      this.drawText('rgba(162, 162, 162, 0.5)', 14);
    }
  }

  drawCircle() {
    this.context.beginPath();
    this.context.fillStyle = this.bgColor;
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.context.fill();
  }

  drawText(color?: string, fontSize?: number) {
    this.context.font = `${fontSize || this.fontSize}px Helvetica`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = color || this.color;
    this.context.fillText(this.name, this.x, this.y);
  }
}
