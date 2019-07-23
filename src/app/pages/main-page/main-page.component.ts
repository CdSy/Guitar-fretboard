import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FretboardDrawerService, ColorPalette, scaleSequences } from '../../modules/fretboard-canvas/fretboard-drawer.service';
import { CustomTheme } from '../../components/palette/palette.component';
import { StorageService } from '../../services/storage.service';

class SelectOption {
  value: any;
  label: string;

  constructor({value, label}) {
    this.value = value.toLowerCase();
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
export class MainPageComponent implements OnInit {
  public showBaseNotes = true;
  public showMediumNotes = false;
  public amountOfStrings = 6;
  public currentTheme = 'dark';
  public isOpenPalette = false;

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
  ];

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
  };

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private drawer: FretboardDrawerService, private storage: StorageService) {
    // Get from local storage
    const themesFromStorage = this.storage.get('themes');
    const themeOptionsFromStorage = this.storage.get('themeOptions');

    this.themes = themesFromStorage ? {...themesFromStorage} : this.themes;
    this.themeOptions = themeOptionsFromStorage ? [...themeOptionsFromStorage] : this.themeOptions;
  }

  ngOnInit() {
    const canvas = this.canvas.nativeElement;

    this.drawer.initialize({
      canvas,
      theme: this.themes[this.currentTheme],
      showBaseNotes: this.showBaseNotes,
      showMediumNotes: this.showMediumNotes
    });
    // this.drawer.drawScale(scaleSequences.minor);
  }

  onChangeStrings(value: number) {
    this.drawer.changeStringAmount(value);
  }

  onChangeShowNotes(value: boolean, type: string) {
    this.drawer.changeShowNotes(value, type);
  }

  onChangeTheme(value: string) {
    this.drawer.changeTheme(this.themes[value]);
  }

  onChangeColor(newTheme: ColorPalette) {
    this.drawer.changeTheme(newTheme);
  }

  onCancel() {
    this.drawer.changeTheme(this.themes[this.currentTheme]);
  }

  createCustomTheme(newTheme: CustomTheme) {
    if (!newTheme.name.length) {
      newTheme.name = this.createDefaultName();
    }

    const { name, ...colors } = newTheme;
    const selectOption = new SelectOption({value: name, label: name});
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
