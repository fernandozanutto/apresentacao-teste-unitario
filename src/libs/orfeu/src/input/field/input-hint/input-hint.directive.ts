/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { Directive } from '@angular/core';

@Directive({
  selector: '[aplsInputHint]',
  host: {
    class: 'form-text text-muted apls-input-hint'
  }
})
export class AplsInputHint {
  constructor() {}
}
