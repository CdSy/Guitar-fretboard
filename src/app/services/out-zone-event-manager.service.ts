import { Injectable, Inject, NgZone } from '@angular/core';
import { EVENT_MANAGER_PLUGINS, EventManager } from '@angular/platform-browser';

@Injectable()
export class OutZoneEventManager extends EventManager {
  constructor(
    @Inject(EVENT_MANAGER_PLUGINS) plugins: any[],
    private zone: NgZone
  ) {
    super(plugins, zone);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    if (eventName.endsWith('out-zone')) {
      eventName = eventName.split('.')[0];
      return this.zone.runOutsideAngular(() => {
        return super.addGlobalEventListener(target, eventName, handler);
      });
    }

    return super.addGlobalEventListener(target, eventName, handler);
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    if (eventName.endsWith('out-zone')) {
      eventName = eventName.split('.')[0];
      return this.zone.runOutsideAngular(() => {
        return super.addEventListener(element, eventName, handler);
      });
    }

    return super.addEventListener(element, eventName, handler);
  }
}
