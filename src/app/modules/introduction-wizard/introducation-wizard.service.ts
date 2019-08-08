import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { InteractionWithFretboardComponent } from './components/interaction-with-fretboard/interaction-with-fretboard.component';

@Injectable()
export class IntroductionWizardService {

  constructor(public dialog: MatDialog) {}

  openInteractionDialog() {
    return new Observable<void>(subscriber => {
      const dialogRef = this.dialog.open(InteractionWithFretboardComponent, {
        width: '648px',
        hasBackdrop: true,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        subscriber.next();
        subscriber.complete();
      });
    });
  }
}
