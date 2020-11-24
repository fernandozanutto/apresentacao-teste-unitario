/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[aplsTabContent]' })
export class AplsTabContent {
  constructor(public template: TemplateRef<any>) {}
}
