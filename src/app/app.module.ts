import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { FretboardSettingsComponent } from './pages/main-page/components/settings/fretboard-settings.component';
import { MaterialModule, FretboardCanvasModule, SideMenuModule, PaletteModule } from './modules';
import { StorageService } from './services/storage.service';
import { OutZoneEventManager } from './services/out-zone-event-manager.service';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    FretboardSettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    MaterialModule,
    FretboardCanvasModule,
    PaletteModule,
    SideMenuModule,
  ],
  providers: [
    StorageService,
    {provide: EventManager, useClass: OutZoneEventManager},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
