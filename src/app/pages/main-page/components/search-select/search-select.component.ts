import { AfterViewInit, Component, OnDestroy, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { SelectOption } from '../../main-page.component';

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class SearchSelectComponent implements OnInit, AfterViewInit, OnDestroy {

  protected onDestroy = new Subject<void>();
  protected allOptions: Array<SelectOption>;
  public currentValue: string;
  public filteredOptions$: ReplaySubject<Array<SelectOption>> = new ReplaySubject<Array<SelectOption>>(1);

  @Input('value')
  set value(value) {
    this.currentValue = value;
  }

  @Input('options')
  set options(value) {
    this.allOptions = value;
  }

  @Input() name: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Output() selectionChange = new EventEmitter();
  @ViewChild('singleSelect', {static: true}) singleSelect: MatSelect;

  constructor() { }

  ngOnInit() {
    this.filteredOptions$.next(this.allOptions.slice());
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  onChange(event: any) {
    this.selectionChange.emit(event);
  }

  // protected setInitialValue() {
  //   this.filteredOptions$
  //     .pipe(take(1), takeUntil(this.onDestroy))
  //     .subscribe(() => {
  //       // setting the compareWith property to a comparison function
  //       // triggers initializing the selection according to the initial value
  //       // this needs to be done after the filteredOptions are loaded initially
  //       // and after the mat-option elements are available
  //       this.singleSelect.compareWith = (a: SelectOption, b: SelectOption) => a && b && a.value === b.value;
  //     });
  // }

  protected filterOptions(value: string) {
    if (!this.allOptions) {
      return;
    }

    let search = value;

    if (!search) {
      this.filteredOptions$.next(this.allOptions.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.filteredOptions$.next(
      this.allOptions.filter(option => option.label.toLowerCase().indexOf(search) > -1)
    );
  }
}
