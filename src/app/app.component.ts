import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { Notes } from './modules/fretboard-canvas';
import { slideInAnimation } from './route-animation';
import { SCALES } from './modules/fretboard-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ slideInAnimation ]
})
export class AppComponent implements OnInit {
  title = 'Guitar-Scales';
  notes = new Notes();

  public themeOptions: Array<any> = [
    {value: 'dark', label: 'Dark'},
    {value: 'light', label: 'Light'},
    {value: 'violet', label: 'Violet'},
    {value: 'black', label: 'Black'},
  ];

  public sequenceOptions: Array<any> = Object.keys(SCALES)
    .map((key) => ({value: key, label: key[0].toUpperCase() + key.slice(1)}));

  constructor(
    private router: Router,
    private titleService: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      const sequence = this.getUrlParameter(this.router.url, 'sequence');

      if (sequence) {
        const title = `${sequence} Scale - Guitar Scales Generator`;
        const description = `Generate ${sequence} scale and many others with help of customizable graphical interface`;

        this.titleService.setTitle(title);
        this.meta.updateTag({name: 'description', content: description});
      }
    });
  }

  getUrlParameter(routePath, sParam) {
    const sPageURL = routePath.split('?').length > 1 ? routePath.split('?')[1] : null;

    if (!sPageURL) {
      return null;
    }

    const sURLVariables = sPageURL.split('&');
    let sParameterName: string;
    let i: number;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  }

  public getNote(index): string {
    return this.notes.findNext(0, index).name;
  }

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
