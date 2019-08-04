
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class StorageService implements OnDestroy {
  private onDestroy$ = new Subject<void>();
  private saved$ = new Subject<string>();
  private storage: any;
  private STORAGE_APP_PREFIX = 'fretboardapp';

  constructor(private snackBar: MatSnackBar) {
    this.storage = localStorage;

    this.saved$.pipe(
      takeUntil(this.onDestroy$),
      debounceTime(2000)
    ).subscribe((message: string) => {
      this.snackBar.open(message, '', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public set(key: string, value: any) {
    const path = key.split('.');
    let newValue = value;

    if (path.length > 1) {
      const root = this.get(path[0]);
      newValue = this.setNested(root, path.slice(1), value);
    }

    switch (typeof newValue) {
      case 'function':
        throw new Error('Yeah, so, functions cannot be saved into localStorage.');
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
        this.storage.setItem(this.STORAGE_APP_PREFIX + path[0], newValue || '');
        break;
      default:
        this.storage.setItem(this.STORAGE_APP_PREFIX + path[0], JSON.stringify(newValue));
        break;
    }

    this.saved$.next(`${path[0]} have been saved`);
  }

  public get(key: string, defaultValue?: any) {
    const path = key.split('.');
    let item = this.storage.getItem(this.STORAGE_APP_PREFIX + path[0]) || defaultValue;

    if (item !== defaultValue) {
      try {
        item = JSON.parse(item || '{}');
      } catch (e) {
        console.log('Couldn\'t parse item from local storage');
      }
    }

    if (path.length > 1) {
      item = this.resolvePath(item, path.slice(1));
    }

    return item;
  }

  public remove(key: string) {
    this.storage.removeItem(this.STORAGE_APP_PREFIX + key);
  }

  private setNested(obj: Object, path: Array<string>, value: any) {
    let schema = {...obj};  // a moving reference to internal objects within obj
    const len = path.length;

    for (let i = 0; i < len - 1; i++) {
      const elem = path[i];

      if (!schema[elem]) {
        schema[elem] = {};
      }

      schema = schema[elem];
    }

    schema[path[len - 1]] = value;

    return schema;
  }

  private resolvePath(object: Object, path: Array<string> | Function, defaultValue: any = null): any {
    if (typeof path === 'function') {
      return path(object);
    } else {
      return path.reduce((o, p) => o ? o[p] : defaultValue, object);
    }
  }
}
