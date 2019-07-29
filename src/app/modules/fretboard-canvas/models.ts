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
}

export interface ILayerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
