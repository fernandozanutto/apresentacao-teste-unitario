import {
  NgModule,
  Directive,
  ElementRef,
  QueryList,
} from '@angular/core';


@Directive({
  selector: '[apls-line], [aplsLine]',
  host: {'class': 'apls-line'}
})
export class AplsLine {}

export class AplsLineSetter {
  constructor(private _lines: QueryList<AplsLine>, private _element: ElementRef) {
    this._setLineClass(this._lines.length);

    this._lines.changes.subscribe(() => {
      this._setLineClass(this._lines.length);
    });
  }

  private _setLineClass(count: number): void {
    this._resetClasses();
    if (count === 2 || count === 3) {
      this._setClass(`apls-${count}-line`, true);
    } else if (count > 3) {
      this._setClass(`apls-multi-line`, true);
    }
  }

  private _resetClasses(): void {
    this._setClass('apls-2-line', false);
    this._setClass('apls-3-line', false);
    this._setClass('apls-multi-line', false);
  }

  private _setClass(className: string, isAdd: boolean): void {
    if (isAdd) {
      this._element.nativeElement.classList.add(className);
    } else {
      this._element.nativeElement.classList.remove(className);
    }
  }

}

@NgModule({
  exports: [AplsLine],
  declarations: [AplsLine],
})
export class AplsLineModule { }
