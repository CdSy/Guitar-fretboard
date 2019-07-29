import { NgModule } from '@angular/core';
import { FretboardDrawerService } from './fretboard-drawer.service';
import { EventManager } from './event-manager.service';

@NgModule({
  providers: [FretboardDrawerService, EventManager]
})
export class FretboardCanvasModule { }
