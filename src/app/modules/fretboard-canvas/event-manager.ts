import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { INote } from './note';

export class SyntheticEvent {
  target: INote | undefined;
  srcEvent: Event;

  constructor({target, srcEvent}) {
    this.target = target;
    this.srcEvent = srcEvent;
  }
}

export class EventManager {
  elements: Array<INote>;

  constructor() {
    this.elements = new Array();
  }

  addEventListener(target: HTMLElement, type: string): Observable<SyntheticEvent> {
    return fromEvent(target, type).pipe(
      map((event: PointerEvent) => {
        const targetElement = this.findElement(event.layerX, event.layerY);

        return new SyntheticEvent({target: targetElement, srcEvent: event});
      })
    );
  }

  findElement(x: number, y: number): INote | undefined {
    const element = this.elements.find(el => {
      return this.isIntersect({x, y}, el);
    });

    return element;
  }

  isIntersect(point, circle): boolean {
    return Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
  }

  registerElement(element: any) {
    this.elements.push(element);
  }

  clearElements() {
    this.elements = new Array();
  }
}
