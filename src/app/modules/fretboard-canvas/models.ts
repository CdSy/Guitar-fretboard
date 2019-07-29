export enum NoteTypes {
  base,
  sharp
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
  isFundamental: boolean;
  inScale: boolean;
  isActive?: boolean;
}

export interface ILayerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColorPalette {
  neck?: string;
  dot?: string;
  fret?: string;
  string?: string;
  fundamental?: string;
  scale?: string;
}
