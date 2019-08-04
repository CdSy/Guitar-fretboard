export enum NoteTypes {
  base,
  sharp
}

export enum HandTypes {
  R,
  L
}

export enum ScaleModes {
  Full,
  Vertical,
  Shifted
}

export interface INote {
  name: string;
  bgColor: string;
  color: string;
  type: number;
}

export interface IViewNote extends INote {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  radius: number;
  fret: number;
  string: number;
  isRoot: boolean;
  inScale: boolean;
  isActive?: boolean;
  ghostMode?: boolean;
}

export interface ILayerRect {
  x: number;
  y: number;
  x2: number;
  y2: number;
  pl: number;
  pt: number;
  pr: number;
  pb: number;
  width: number;
  height: number;
}

export interface ColorPalette {
  neck?: string;
  dot?: string;
  fret?: string;
  string?: string;
  root?: string;
  scale?: string;
}
