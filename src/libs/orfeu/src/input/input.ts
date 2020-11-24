/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { Directive, ElementRef, InjectionToken, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

export const APLS_INPUT_VALUE_ACCESSOR =
    new InjectionToken<{value: any}>('APLS_INPUT_VALUE_ACCESSOR');

@Directive({
  selector: '[aplsInput]',
  host: {
    class: 'form-control apls-input',
    autocomplete: 'off',
    resize: 'none'
  },
  inputs: ['disabled']
})
export class AplsInput {
  nativeElement: any;

  constructor(
    public elementRef: ElementRef,
    @Optional()
    @Self()
    public control: NgControl
  ) {
    this.nativeElement = elementRef.nativeElement;
  }
}