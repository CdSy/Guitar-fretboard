import { Component, OnInit } from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-interaction-with-fretboard',
  templateUrl: 'interaction-with-fretboard.component.html',
  styleUrls: ['./interaction-with-fretboard.component.scss']
})

export class InteractionWithFretboardComponent implements OnInit {
  readonly numberOfSteps = 3;
  public isEnd = false;

  constructor(public dialogRef: MatDialogRef<InteractionWithFretboardComponent>) {}

  ngOnInit() {}

  onChangeStep(event: StepperSelectionEvent) {
    this.isEnd = event.selectedIndex === this.numberOfSteps - 1;
  }
}
