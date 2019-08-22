import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PolicyPageComponent } from './pages/policy/policy.component';
import { TermsPageComponent } from './pages/terms/terms.component';
import { ContactsPageComponent } from './pages/contacts/contacts.component';
import { FretboardSettingsComponent } from './pages/main-page/components/settings/fretboard-settings.component';
import { AdvertisementComponent } from './pages/main-page/components/ads/advertisement.component';
import { MaterialModule, FretboardCanvasModule, SideMenuModule, PaletteModule, IntroductionModule } from './modules';
import { StorageService } from './services/storage.service';
import { EmailService } from './services/email.service';
import { OutZoneEventManager } from './services/out-zone-event-manager.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    PolicyPageComponent,
    TermsPageComponent,
    ContactsPageComponent,
    FretboardSettingsComponent,
    AdvertisementComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
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
    EmailService,
    {provide: EventManager, useClass: OutZoneEventManager},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
