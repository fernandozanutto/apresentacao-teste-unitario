  /**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { Directive, Self, Optional, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[aplsInputFile]',
  host: {
    class: 'fake-input',
    readonly: 'readonly'
  },
  inputs: ['disabled']
})
export class AplsInputFileDirective {
  // Guarda o nativeElemente do ElementRef para manipulações no input-file.component
  nativeElement: any;

  /**
   * Retorna se o input esta desabilitado testando se ele faz parte de um formControl
   */
  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = !!value;
  }
  protected _disabled = false;

  /**
   * Essa função é chamada quando todos outros processos foram finalizados e o valor do input já foi tratado.
   * @param value Este valor será exibido dentro de um input text.
   */
  @Input()
  get value(): string {
    if (this.ngControl && this.ngControl.value !== null) {
      return this.ngControl.value;
    }
    return this.nativeElement.value;
  }
  set value(value: string) {
    if (!!this.ngControl) {
      this.ngControl.control.setValue(value);
    } else {
      this.nativeElement.value = value;
    }
  }
  
  @Input() accept: string;

  constructor(
    public elementRef: ElementRef,
    @Optional()
    @Self()
    public ngControl: NgControl
  ) {
    this.nativeElement = elementRef.nativeElement;
  }
}
