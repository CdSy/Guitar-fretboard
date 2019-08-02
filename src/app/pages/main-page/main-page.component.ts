import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FretboardDrawerService, ColorPalette, SCALES, HandTypes } from '../../modules/fretboard-canvas';
import { CustomTheme } from '../../modules/palette/palette.component';
import { StorageService } from '../../services/storage.service';

class SelectOption {
  value: any;
  label: string;

  constructor({value, label}) {
    this.value = value;
    this.label = label;
  }
}

const theme: ColorPalette = {
  neck: '#394049', // #394049
  dot: '#000',
  fret: '#c5cacd', // #c5cacd
  string: '#76f58c', // #c5cacd
  fundamental: '#1e9ee0',
  scale: '#80e488'
};

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public showFlatNotes = true;
  public showSharpNotes = true;
  public numberOfStrings = 6;
  public numberOfFrets = 24;
  public currentTheme = 'dark';
  public handMode = HandTypes.R;
  public isOpenPalette = false;
  public scaleSequence: string;
  public scaleMode = 0;

  public scaleModes: Array<any> = [
    {value: 0, name: 'Full'},
    {value: 4, name: 'Vertical'},
    {value: 5, name: 'Shifted'},
    {value: 6, name: 'Horizontal'},
  ];

  public stringOptions: Array<SelectOption> = [
    {value: 6, label: '6 strings'},
    {value: 7, label: '7 strings'},
    {value: 8, label: '8 strings'},
    {value: 9, label: '9 strings'},
    {value: 10, label: '10 strings'},
  ];

  public themeOptions: Array<SelectOption> = [
    {value: 'dark', label: 'Dark'},
    {value: 'light', label: 'Light'},
    {value: 'violet', label: 'Violet'},
  ];

  public sequenceOptions: Array<SelectOption> = Object.keys(SCALES)
    .map((key) => new SelectOption({value: key, label: key[0].toUpperCase() + key.slice(1)}));

  public themes = {
    'dark': {
      neck: '#394049', // #394049
      dot: '#000',
      fret: '#c5cacd', // #c5cacd
      string: '#76f58c', // #c5cacd
      fundamental: '#1e9ee0',
      scale: '#80e488'
    },
    'light': {
      neck: '#fff', // #394049
      dot: '#000',
      fret: '#000', // #c5cacd
      string: '#000', // #c5cacd
      fundamental: '#1e9ee0',
      scale: '#80e488'
    },
    'violet': {
      dot: '#f01414',
      fret: '#fcfcfc',
      fundamental: '#1e9ee0',
      neck: '#1e3e80',
      scale: '#80e488',
      string: '#b5b5b5'
    },
  };

  @ViewChild('fretLayer', { static: true }) fretLayer: ElementRef<HTMLCanvasElement>;
  @ViewChild('noteLayer', { static: true }) noteLayer: ElementRef<HTMLCanvasElement>;

  constructor(private drawer: FretboardDrawerService, private storage: StorageService) {
    // Get from local storage
    const themesFromStorage = this.storage.get('themes');
    const themeOptionsFromStorage = this.storage.get('themeOptions');
    const themeNameFromStorage = this.storage.get('themeName');
    const numberOfStringsFromStorage = this.storage.get('numberOfStrings');
    const numberOfFretsFromStorage = this.storage.get('numberOfFrets');
    const handModeFromStorage = this.storage.get('handType');

    this.numberOfStrings = numberOfStringsFromStorage || this.numberOfStrings;
    this.numberOfFrets = numberOfFretsFromStorage || this.numberOfFrets;
    this.currentTheme = themeNameFromStorage || this.currentTheme;
    this.themes = themesFromStorage ? {...themesFromStorage} : this.themes;
    this.themeOptions = themeOptionsFromStorage ? [...themeOptionsFromStorage] : this.themeOptions;
    this.handMode = handModeFromStorage || this.handMode;
  }

  ngOnInit() {
    const fretLayer = this.fretLayer.nativeElement;
    const noteLayer = this.noteLayer.nativeElement;
    const tuningFromStorage = this.storage.get('tuning');

    this.drawer.initialize({
      fretLayer,
      noteLayer,
      theme: this.themes[this.currentTheme],
      showFlatNotes: this.showFlatNotes,
      showSharpNotes: this.showSharpNotes,
      numberOfStrings: this.numberOfStrings,
      numberOfFrets: this.numberOfFrets,
      tuning: tuningFromStorage,
      handType: this.handMode,
      scaleMode: this.scaleMode
    });

    this.drawer.getCurrentTuning().pipe(takeUntil(this.onDestroy$))
      .subscribe(tuning => this.storage.set('tuning', tuning));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onChangeHandType(checked: boolean) {
    const type = checked ? HandTypes.R : HandTypes.L;

    this.handMode = type;
    this.storage.set('handType', type);
    this.drawer.changeHandType(type);
  }

  onChangeStrings(value: number) {
    this.drawer.changeStringAmount(value);
    this.storage.set('numberOfStrings', value);
  }

  onChangeScale(value: string) {
    this.drawer.changeScale(SCALES[value]);
  }

  onChangeFret(event: any) {
    const value = Number(event.target.value);
    event.target.value = Math.max(0, Math.min(24, value));
    this.numberOfFrets = event.target.value;
    event.preventDefault();

    if (this.numberOfFrets > 0) {
      this.drawer.changeFret(this.numberOfFrets);
      this.storage.set('numberOfFrets', this.numberOfFrets);
    }
  }

  onChangeShowNotes(value: boolean, type: string) {
    this.drawer.changeShowNotes(value, type);
  }

  onChangeTheme(value: string) {
    this.drawer.changeTheme(this.themes[value]);
    this.storage.set('themeName', value);
  }

  onChangeColor(newTheme: ColorPalette) {
    this.drawer.changeTheme(newTheme);
  }

  onChangeScaleMode() {
    this.drawer.changeScaleMode(this.scaleMode);
  }

  onCancel() {
    this.drawer.changeTheme(this.themes[this.currentTheme]);
  }

  createCustomTheme(newTheme: CustomTheme) {
    if (!newTheme.name.length) {
      newTheme.name = this.createDefaultName();
    }

    const { name, ...colors } = newTheme;
    const selectOption = new SelectOption({value: name.toLowerCase(), label: name});
    this.themeOptions = [...this.themeOptions, selectOption];
    this.themes[selectOption.value] = colors;
    this.currentTheme = selectOption.value;

    // Save to local storage
    this.storage.set('themes', this.themes);
    this.storage.set('themeOptions', this.themeOptions);
  }

  openPalette() {
    this.isOpenPalette = true;
  }

  createDefaultName(): string {
    let version = 1;
    const defaultName = 'Custom';
    const existingNames = this.themeOptions.map(option => option.label)
      .filter(name => name.match(/^Custom\d{0,}$/));

    if (existingNames.length > 0) {
      const highestNumber = Math.max(1, ...existingNames.map(name => {
        const result = name.match(/\d{0,}$/);

        if (result) {
          return Number(result[0]);
        } else {
          return 0;
        }
      }));

      version = highestNumber + 1;
    }

    return String(defaultName + version);
  }
}
