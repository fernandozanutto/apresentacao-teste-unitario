/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 *
 * Para compreenção desse arquivo é necessario ler os comentarios no cdk do angular.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  ElementRef,
  Output,
  EventEmitter,
  ViewContainerRef
} from '@angular/core';
import { CDK_ROW_TEMPLATE, CdkFooterRow, CdkFooterRowDef, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef } from '@angular/cdk/table';

@Directive({
  selector: '[aplsHeaderRowDef]',
  providers: [{ provide: CdkHeaderRowDef, useExisting: AplsHeaderRowDef }],
  inputs: ['columns: aplsHeaderRowDef', 'sticky: aplsHeaderRowDefSticky']
})
export class AplsHeaderRowDef extends CdkHeaderRowDef {}

@Directive({
  selector: '[aplsFooterRowDef]',
  providers: [{ provide: CdkFooterRowDef, useExisting: AplsFooterRowDef }],
  inputs: ['columns: aplsFooterRowDef', 'sticky: aplsFooterRowDefSticky']
})
export class AplsFooterRowDef extends CdkFooterRowDef {}

@Directive({
  selector: '[aplsRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: AplsRowDef }],
  inputs: ['columns: aplsRowDefColumns', 'when: aplsRowDefWhen']
})
export class AplsRowDef<T> extends CdkRowDef<T> {}

@Component({
  selector: 'apls-header-row, tr[apls-header-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'apls-header-row',
    role: 'row'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'aplsHeaderRow'
})
export class AplsHeaderRow extends CdkHeaderRow {}

@Component({
  selector: 'apls-footer-row, tr[apls-footer-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'apls-footer-row',
    role: 'row'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'aplsFooterRow'
})
export class AplsFooterRow extends CdkFooterRow {}

@Component({
  selector: 'apls-row, tr[apls-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'apls-row',
    role: 'row',
    '(mouseover)': '_mouseover($event)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'aplsRow'
})
export class AplsRow extends CdkRow {
  @Output('hover') evtOver = new EventEmitter();

  constructor(public _elementRef: ElementRef, public _viewContainerRef: ViewContainerRef) {
    super();
  }

  _mouseover($event) {
    this.evtOver.emit(this);
  }
}
