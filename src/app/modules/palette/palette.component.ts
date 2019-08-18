import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ColorPalette } from '../../modules/fretboard-canvas';

import {
  trigger,
  animate,
  style,
  group,
  query,
  transition,
} from '@angular/animations';

export interface CustomTheme extends ColorPalette {
  name: string;
}

@Component({
  selector: 'app-palette',
  templateUrl: 'palette.component.html',
  styleUrls: ['./palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'translate(-50%, -150%)' }),
          animate('0.25s ease-in',
          style({ transform: 'translate(-50%, 0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translate(-50%, 0)', transformOrigin: 'top'}),
          animate('0.3s ease-in-out',
          style({ transform: 'translate(-50%, -150%)', transformOrigin: 'top' }))
        ], { optional: true }),
      ]),
    ])
  ]
})
export class PaletteComponent implements OnInit {
  public themeName = '';
  public initialTheme: ColorPalette;
  public themeNames: Array<string>;
  public isActive = false;

  @Input('active')
  set active(value) {
    this.isActive = value;
  }

  @Input('theme')
  set theme(value) {
    this.initialTheme = {...value};
    this.themeNames = Object.keys(value);
  }

  @Output() activeChange = new EventEmitter<boolean>();
  @Output() changeColor = new EventEmitter<ColorPalette>();
  @Output() apply = new EventEmitter<CustomTheme>();
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  ngOnInit() { }

  onChangeName(name: string) {
    this.themeName = name;
  }

  onChangeColor() {
    const newTheme = {...this.initialTheme};

    this.changeColor.emit(newTheme);
  }

  applyTheme() {
    const newTheme = {...this.initialTheme, name: this.themeName};

    this.themeName = '';
    this.activeChange.emit(false);
    this.apply.emit(newTheme);
  }

  cancelTheme() {
    if (this.isActive) {
      this.themeName = '';
      this.activeChange.emit(false);
      this.cancel.emit();
    }
  }
}
