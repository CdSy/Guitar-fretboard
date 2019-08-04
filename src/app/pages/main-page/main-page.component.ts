import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FretboardDrawerService, ColorPalette, ScaleModes, SCALES, HandTypes } from '../../modules/fretboard-canvas';
import { CustomTheme } from '../../modules/palette/palette.component';
import { StorageService } from '../../services/storage.service';

export class SelectOption {
  value: any;
  label: string;

  constructor({value, label}) {
    this.value = value;
    this.label = label;
  }
}

interface FretboardSettings {
  themes: {[key: string]: ColorPalette};
  themeOptions: Array<SelectOption>;
  themeName: string;
  numberOfStrings: number;
  numberOfFrets: number;
  handType: number;
  showFlatNotes: boolean;
  showSharpNotes: boolean;
  showGhostNotes: boolean;
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public canvasHeight$: Observable<number>;
  public showFlatNotes = true;
  public showSharpNotes = true;
  public showGhostNotes = false;
  public numberOfStrings = 6;
  public numberOfFrets = 24;
  public themeName = 'black';
  public handType = HandTypes.R;
  public isOpenPalette = false;
  public scaleSequence: string;
  public scaleMode = 0;

  public scaleModes: Array<any> = [
    {value: ScaleModes.Full, name: 'Full'},
    {value: ScaleModes.Vertical, name: 'Vertical'},
    {value: ScaleModes.Shifted, name: 'Shifted'},
  ];

  public themeOptions: Array<SelectOption> = [
    {value: 'dark', label: 'Dark'},
    {value: 'light', label: 'Light'},
    {value: 'violet', label: 'Violet'},
    {value: 'black', label: 'Black'},
  ];

  public sequenceOptions: Array<SelectOption> = Object.keys(SCALES)
    .map((key) => new SelectOption({value: key, label: key[0].toUpperCase() + key.slice(1)}));

  public themes: {[key: string]: ColorPalette} = {
    'dark': {
      neck: '#394049', // #394049
      dot: '#000',
      fret: '#c5cacd', // #c5cacd
      string: '#76f58c', // #c5cacd
      root: '#c004f0',
      scale: '#19175f'
    },
    'light': {
      neck: '#fff', // #394049
      dot: '#000',
      fret: '#000', // #c5cacd
      string: '#000', // #c5cacd
      root: '#aaa91e',
      scale: '#000'
    },
    'violet': {
      dot: '#f01414',
      fret: '#fcfcfc',
      root: '#000',
      neck: '#1e3e80',
      scale: '#aa5300',
      string: '#b5b5b5'
    },
    'black': {
      dot: '#000',
      fret: '#565656',
      root: '#a83505',
      neck: '#363636',
      scale: '#6c7b6e',
      string: '#acacac',
    }
  };

  settings: FretboardSettings;

  defaultSettings = {
    themes: this.themes,
    themeOptions: this.themeOptions,
    themeName: this.themeName,
    numberOfStrings: this.numberOfStrings,
    numberOfFrets: this.numberOfFrets,
    handType: this.handType,
    showFlatNotes: this.showFlatNotes,
    showSharpNotes: this.showSharpNotes,
    showGhostNotes: this.showGhostNotes,
  };

  @ViewChild('fretLayer', { static: true }) fretLayer: ElementRef<HTMLCanvasElement>;
  @ViewChild('noteLayer', { static: true }) noteLayer: ElementRef<HTMLCanvasElement>;

  constructor(private drawer: FretboardDrawerService, private storage: StorageService) {
    this.settings = this.storage.get('settings');

    if (!this.settings) {
      this.storage.set('settings', this.defaultSettings);
      this.settings = this.defaultSettings;
    }

    // Get from local storage
    const {
      numberOfStrings,
      numberOfFrets,
      themeName,
      themes,
      themeOptions,
      handType,
      showFlatNotes,
      showSharpNotes,
      showGhostNotes,
    } = this.settings;

    this.numberOfStrings = numberOfStrings;
    this.numberOfFrets = numberOfFrets;
    this.themeName = themeName;
    this.themes = themes;
    this.themeOptions = themeOptions;
    this.handType = handType;
    this.showFlatNotes = showFlatNotes;
    this.showSharpNotes = showSharpNotes;
    this.showGhostNotes = showGhostNotes;
  }

  ngOnInit() {
    const fretLayer = this.fretLayer.nativeElement;
    const noteLayer = this.noteLayer.nativeElement;
    const tuningFromStorage = this.storage.get('settings.tuning');

    this.drawer.initialize({
      fretLayer,
      noteLayer,
      theme: this.themes[this.themeName],
      showFlatNotes: this.showFlatNotes,
      showSharpNotes: this.showSharpNotes,
      showGhostNotes: this.showGhostNotes,
      numberOfStrings: this.numberOfStrings,
      numberOfFrets: this.numberOfFrets,
      tuning: tuningFromStorage,
      handType: this.handType,
      scaleMode: this.scaleMode
    });

    this.canvasHeight$ = this.drawer.getCanvasHeight();

    this.drawer.getCurrentTuning().pipe(takeUntil(this.onDestroy$))
      .subscribe(tuning => this.storage.set('settings.tuning', tuning));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onChangeScale(value: string) {
    this.scaleSequence = value;
    this.drawer.changeScale(SCALES[value]);
  }

  // onChangeFret(event: any) {
  //   const value = Number(event.target.value);
  //   event.target.value = Math.max(0, Math.min(24, value));
  //   this.numberOfFrets = event.target.value;
  //   event.preventDefault();

  //   if (this.numberOfFrets > 0) {
  //     this.drawer.changeFret(this.numberOfFrets);
  //     this.storage.set('numberOfFrets', this.numberOfFrets);
  //   }
  // }

  onChangeTheme(value: string) {
    this.drawer.changeTheme(this.themes[value]);
    this.storage.set('settings.themeName', value);
  }

  onChangeColor(newTheme: ColorPalette) {
    this.drawer.changeTheme(newTheme);
  }

  onChangeScaleMode() {
    this.drawer.changeScaleMode(this.scaleMode);
  }

  onCancel() {
    this.drawer.changeTheme(this.themes[this.themeName]);
  }

  createCustomTheme(newTheme: CustomTheme) {
    if (!newTheme.name.length) {
      newTheme.name = this.createDefaultName();
    }

    const { name, ...colors } = newTheme;
    const selectOption = new SelectOption({value: name.toLowerCase(), label: name});

    this.themeOptions = [
      ...this.themeOptions.filter(option => option.value !== selectOption.value),
      selectOption
    ];

    this.themes[selectOption.value] = colors;
    this.themeName = selectOption.value;

    // Save to local storage
    this.storage.set('settings.themes', this.themes);
    this.storage.set('settings.themeOptions', this.themeOptions);
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
