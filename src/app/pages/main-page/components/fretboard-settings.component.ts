import { Component, Input, OnInit } from '@angular/core';
import { FretboardDrawerService, HandTypes } from '../../../modules/fretboard-canvas';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-fretboard-settings',
  templateUrl: 'fretboard-settings.component.html',
  styleUrls: ['./fretboard-settings.component.scss']
})
export class FretboardSettingsComponent implements OnInit {
  public numberOfStrings: number;
  public numberOfFrets: number;
  public handType: number;
  public showFlatNotes: boolean;
  public showSharpNotes: boolean;
  public showGhostNotes: boolean;

  @Input('settings')
  set settings(settings: any) {
    Object.keys(settings).forEach(key => this[key] = settings[key]);
  }

  constructor(private drawer: FretboardDrawerService, private storage: StorageService) { }

  ngOnInit() { }

  onChangeShowNotes(value: boolean, type: string) {
    this.drawer.changeShowNotes(value, type);
    this.storage.set('settings.' + type, value);
  }

  onChangeStrings(value: number) {
    this.numberOfStrings = value;
    this.drawer.changeStringAmount(value);
    this.storage.set('settings.numberOfStrings', value);
  }

  onChangeFret(value: number) {
    this.numberOfFrets = value;
    this.drawer.changeFret(this.numberOfFrets);
    this.storage.set('settings.numberOfFrets', this.numberOfFrets);
  }

  onChangeHandType(checked: boolean) {
    const type = checked ? HandTypes.R : HandTypes.L;

    this.handType = type;
    this.storage.set('settings.handType', type);
    this.drawer.changeHandType(type);
  }
}
