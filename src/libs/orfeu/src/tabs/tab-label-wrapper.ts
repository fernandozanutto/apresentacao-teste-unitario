/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[aplsTabLabelWrapper]',
  inputs: ['disabled'],
  host: {
    '[class.apls-tab-disabled]': 'disabled'
  }
})
export class AplsTabLabelWrapper {
  disabled: boolean;

  constructor(public elementRef: ElementRef) {}

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
