/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CDK_TABLE_TEMPLATE, CdkTable } from '@angular/cdk/table';

@Component({
  selector: 'apls-table, table[apls-table]',
  exportAs: 'aplsTable',
  template: CDK_TABLE_TEMPLATE,
  styleUrls: ['./table.scss'],
  host: {
    class: 'apls-table'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AplsTable<T> extends CdkTable<T> {
  // constructor(
  //   protected _differs: IterableDiffers,
  //   protected _changeDetectorRef: ChangeDetectorRef,
  //   protected _elementRef: ElementRef,
  //   @Attribute('role') role: string
  // ) {
  //   super(_differs, _changeDetectorRef, _elementRef, role, null);
  // }

  protected stickyCssClass = 'apls-table-sticky';
}
