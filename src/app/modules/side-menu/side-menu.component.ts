import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: 'side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {
  public isVisible: boolean;
  public isAnimatable: boolean;

  @Input('opened')
  set opened(value) {
    this.isVisible = value;
  }

  @Input() side: 'left' | 'right | top | bottom' = 'left';
  @Output() positionChanged = new EventEmitter<void>();

  constructor() { }

  ngOnInit() { }

  public open() {
    this.isAnimatable = true;
    this.isVisible = true;
  }

  public close() {
    this.isAnimatable = true;
    this.isVisible = false;
  }

  public toggle() {
    this.isAnimatable = true;

    if (!this.isVisible) {
      this.isVisible = true;
    } else {
      this.isVisible = false;
    }
  }

  public transitionEnd() {
    this.isAnimatable = false;
    this.positionChanged.emit();
  }
}
