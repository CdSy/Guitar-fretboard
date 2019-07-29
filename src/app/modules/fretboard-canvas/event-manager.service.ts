import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { IViewNote } from './models';

export class SyntheticEvent {
  target: IViewNote | undefined;
  srcEvent: PointerEvent;

  constructor({target, srcEvent}) {
    this.target = target;
    this.srcEvent = srcEvent;
  }
}

@Injectable()
export class EventManager {
  elements: Array<IViewNote>;

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

  findElement(x: number, y: number): IViewNote | undefined {
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

  registerElements(elements: Array<any>) {
    const registeredElements = elements.reduce((notes, string) => {
      notes.push(...string.filter(note => note.display));
      return notes;
    }, []);

    this.elements.push(...registeredElements);
  }

  clearElements() {
    this.elements = new Array();
  }
}
