import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './route-animation';
import { SCALES } from './modules/fretboard-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ slideInAnimation ]
})
export class AppComponent {
  title = 'Guitar-Scales';

  public themeOptions: Array<any> = [
    {value: 'dark', label: 'Dark'},
    {value: 'light', label: 'Light'},
    {value: 'violet', label: 'Violet'},
    {value: 'black', label: 'Black'},
  ];

  public sequenceOptions: Array<any> = Object.keys(SCALES)
    .map((key) => ({value: key, label: key[0].toUpperCase() + key.slice(1)}));

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
