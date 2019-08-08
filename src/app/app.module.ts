import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { SearchSelectComponent } from './pages/main-page/components/search-select/search-select.component';
import { FretboardSettingsComponent } from './pages/main-page/components/settings/fretboard-settings.component';
import { AdvertisementComponent } from './pages/main-page/components/ads/advertisement.component';
import { MaterialModule, FretboardCanvasModule, SideMenuModule, PaletteModule, IntroductionModule } from './modules';
import { StorageService } from './services/storage.service';
import { OutZoneEventManager } from './services/out-zone-event-manager.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    FretboardSettingsComponent,
    SearchSelectComponent,
    AdvertisementComponent,
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
    IntroductionModule.forRoot(),
    SideMenuModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    StorageService,
    {provide: EventManager, useClass: OutZoneEventManager},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
