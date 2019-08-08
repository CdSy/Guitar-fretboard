import { NgModule, ModuleWithProviders} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material-ui/material.module';
import { InteractionWithFretboardComponent } from './components/interaction-with-fretboard/interaction-with-fretboard.component';
import { IntroductionWizardService } from './introducation-wizard.service';

@NgModule({
  imports: [MaterialModule, CommonModule],
  exports: [InteractionWithFretboardComponent],
  declarations: [InteractionWithFretboardComponent],
  entryComponents: [InteractionWithFretboardComponent],
  providers: [],
})
export class IntroductionModule {
  static forChild(): ModuleWithProviders {
    return {
      ngModule: IntroductionModule
    };
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IntroductionModule,
      providers: [IntroductionWizardService],
    };
  }
}
