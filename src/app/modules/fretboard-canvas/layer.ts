interface ILayerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CanvasLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;

  constructor({canvas, width, height, paddingLeft = 0, paddingRight = 0, paddingTop = 0, paddingBottom = 0}) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.paddingLeft = paddingLeft;
    this.paddingRight = paddingRight;
    this.paddingTop = paddingTop;
    this.paddingBottom = paddingBottom;
    this.width = width;
    this.height = height;
    this.fixDPI();
  }

  getRect(): ILayerRect {
    const x = this.paddingLeft;
    const y = this.paddingTop;
    const width = this.width - this.paddingLeft - this.paddingRight;
    const height = this.height - this.paddingTop - this.paddingBottom;

    return {x, y, width, height};
  }

  update() {
    this.width = Number(getComputedStyle(this.canvas.parentElement).getPropertyValue('width').slice(0, -2));
    this.clear();
    this.fixDPI();
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private fixDPI() {
    const context = this.context as any;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
      const originWidth = this.width;
      const originHeight = this.height;

      this.canvas.width = originWidth * ratio;
      this.canvas.height = originHeight * ratio;

      this.canvas.style.width = originWidth + 'px';
      this.canvas.style.height = originHeight + 'px';

      context.scale(ratio, ratio);
    }
  }
}
