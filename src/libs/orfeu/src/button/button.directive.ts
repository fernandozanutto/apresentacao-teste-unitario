/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import {
  Directive,
  Input,
  Attribute,
  ElementRef
} from '@angular/core';

@Directive({
  selector: 'button[aplsButton]',
  host: {
    class: 'btn apls-button',
    '[disabled]': 'disabled || null',
    '[attr.color]': 'theme',
    '(keydown.enter)': '_handlerKeydown($event)'
  }
})
export class AplsButton {
  @Input() disabled = false;

  @Input('color') theme = 'primary';

  tabIndex = 0;

  constructor(
    public elementRef: ElementRef,
    @Attribute('tabindex') tabIndex: string,
  ) {
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  _handlerKeydown(event: KeyboardEvent) {
    this.elementRef.nativeElement.click();
  }

}
