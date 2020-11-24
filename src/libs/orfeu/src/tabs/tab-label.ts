/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';

@Directive({
  selector: '[apls-tab-label], [aplsTabLabel]'
})
export class AplsTabLabel extends CdkPortal {
  constructor(
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef
  ) {
    super(templateRef, viewContainerRef);
  }
}
