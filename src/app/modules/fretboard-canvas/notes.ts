import { INote, NoteTypes } from './models';

export class Notes {
  static ALL_NOTES_LENGTH = 12;
  static value: Array<INote> = [
    {name: 'C', bgColor: '#01e70b', color: '#fff', type: NoteTypes.base},
    {name: 'C#', bgColor: '#02fea9', color: '#000', type: NoteTypes.sharp},
    {name: 'D', bgColor: '#006cfd', color: '#fff', type: NoteTypes.base},
    {name: 'D#', bgColor: '#3003f2', color: '#fff', type: NoteTypes.sharp},
    {name: 'E', bgColor: '#8001ce', color: '#fff', type: NoteTypes.base},
    {name: 'F', bgColor: '#3f0250', color: '#fff', type: NoteTypes.base},
    {name: 'F#', bgColor: '#6c0056', color: '#fff', type: NoteTypes.sharp},
    {name: 'G', bgColor: '#db0000', color: '#fff', type: NoteTypes.base},
    {name: 'G#', bgColor: '#db411b', color: '#fff', type: NoteTypes.sharp},
    {name: 'A', bgColor: '#ff8800', color: '#fff', type: NoteTypes.base},
    {name: 'A#', bgColor: '#ecfe08', color: '#000', type: NoteTypes.sharp},
    {name: 'B', bgColor: '#9af301', color: '#000', type: NoteTypes.base},
  ];

  constructor() {
    const obj = new Proxy(this, {
      get: function(target, propKey: any) {
        if (!isNaN(Number(propKey))) {
          if (Number(propKey) > 11 || Number(propKey) < 0) {
            throw new Error('You should pass argument like Number in range 0-11');
          }

          return target.getNote(propKey);
        }

        const origMethod = target[propKey];

        if (origMethod) {
          return function (...args) {
            return origMethod.apply(this, args);
          };
        } else {
          return undefined;
        }
      },
      set: function(target, name, value) {
        console.log('You can not set value to the Notes object');
        return false;
      }
    });

    return obj;
  }

  getNote(index: number): INote {
    return Notes.value[index];
  }

  findNext(from: any, shift: number): INote {
    let fromIndex = from;

    if (typeof from === 'string') {
      fromIndex = Notes.value.findIndex(note => note.name === from);
    }

    if (fromIndex < 0) {
      fromIndex = this.findNextIndex(0, fromIndex);
    }

    const index = this.findNextIndex(fromIndex, shift);

    return Notes.value[index];
  }

  findNextIndex(from: number, shift: number): number {
    const offset = shift < 0 ? Notes.ALL_NOTES_LENGTH : 0;
    const index = (offset + from + shift) % Notes.ALL_NOTES_LENGTH;

    return index;
  }
}
