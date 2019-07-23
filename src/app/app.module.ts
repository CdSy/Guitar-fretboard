import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PaletteComponent } from './components/palette/palette.component';
import { MaterialModule, FretboardCanvasModule } from './modules';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    PaletteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ColorPickerModule,
    AppRoutingModule,
    MaterialModule,
    FretboardCanvasModule
  ],
  providers: [StorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
