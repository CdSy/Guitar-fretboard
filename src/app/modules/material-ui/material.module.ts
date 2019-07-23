import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatSelectModule, MatIconModule, MatInputModule],
  exports: [MatButtonModule, MatCheckboxModule, MatSelectModule, MatIconModule, MatInputModule],
})
export class MaterialModule { }
