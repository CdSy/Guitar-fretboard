
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
  private storage: any;
  private STORAGE_APP_PREFIX = 'fretboardapp';

  constructor() {
    this.storage = localStorage;
  }

  public set(key: string, value: any) {
    switch (typeof value) {
      case 'function':
        throw new Error('Yeah, so, functions cannot be saved into localStorage.');
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
        this.storage.setItem(this.STORAGE_APP_PREFIX + key, value || '');
        break;
      default:
        this.storage.setItem(this.STORAGE_APP_PREFIX + key, JSON.stringify(value));
        break;
    }
  }

  public get(key: string, defaultValue?: any) {
    let item = this.storage.getItem(this.STORAGE_APP_PREFIX + key) || defaultValue;

    if (item !== defaultValue) {
      try {
        item = JSON.parse(item || '{}');
      } catch (e) {
        console.log('Couldn\'t parse item from local storage');
      }
    }

    return item;
  }

  public remove(key: string) {
    this.storage.removeItem(this.STORAGE_APP_PREFIX + key);
  }
}
