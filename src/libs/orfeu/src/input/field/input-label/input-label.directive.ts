/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { Directive, HostBinding, ElementRef, Attribute, DoCheck } from '@angular/core';

@Directive({
  selector: '[aplsInputLabel]',
  host: {
    class: 'apls-input-label input-label'
  }
})
export class AplsInputLabel implements DoCheck {

  @HostBinding('style.margin.px') margin = 0;

  @HostBinding('style.height.px') height = 16;

  constructor(
    private elementRef: ElementRef,
  ) {}

  ngDoCheck() {
    let el = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue('font-size');
    el = el.replace('px', '');
    this.height = Number(el) + 6;
  }
}
