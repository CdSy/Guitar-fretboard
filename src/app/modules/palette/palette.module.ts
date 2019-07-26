import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';

import { MaterialModule } from '../material-ui/material.module';
import { PaletteComponent } from './palette.component';

@NgModule({
  imports: [CommonModule, ColorPickerModule, MaterialModule],
  exports: [PaletteComponent],
  declarations: [PaletteComponent],
  providers: [],
})
export class PaletteModule { }
