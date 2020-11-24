/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 *
 * Para compreenção desse arquivo é necessario ler os comentarios no cdk do angular.
 */

import { Directive, ElementRef, Input, TemplateRef, ContentChild } from '@angular/core';
import { CdkCellDef, CdkColumnDef, CdkFooterCellDef, CdkHeaderCellDef } from '@angular/cdk/table';
import { MatColumnDef } from '@angular/material/table';

@Directive({
  selector: '[aplsCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: AplsCellDef }]
})
export class AplsCellDef extends CdkCellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) {
    super(template);
  }
}

@Directive({
  selector: '[aplsHeaderCellDef]',
  providers: [{ provide: CdkHeaderCellDef, useExisting: AplsHeaderCellDef }]
})
export class AplsHeaderCellDef extends CdkHeaderCellDef {
  @Input('aplsHeaderCellDef') name: string;
  constructor(/** @docs-private */ public template: TemplateRef<any>) {
    super(template);
  }
}

@Directive({
  selector: '[aplsFooterCellDef]',
  providers: [{ provide: CdkFooterCellDef, useExisting: AplsFooterCellDef }]
})
export class AplsFooterCellDef extends CdkFooterCellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) {
    super(template);
  }
}

@Directive({
  selector: '[aplsColumnDef]',
  providers: [{ provide: CdkColumnDef, useExisting: AplsColumnDef }]
})
export class AplsColumnDef extends MatColumnDef {
  @Input('aplsColumnDef')
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    if (!name) {
      return;
    }

    this._name = name;
    this.cssClassFriendlyName = name.replace(/[^a-z0-9_-]/gi, '-');
  }
  _name: string;

  @ContentChild(AplsCellDef) cell: AplsCellDef;

  @ContentChild(AplsHeaderCellDef) headerCell: AplsHeaderCellDef;

  @ContentChild(AplsFooterCellDef) footerCell: AplsFooterCellDef;

  cssClassFriendlyName: string;

  /** Whether this column should be sticky positioned at the start of the row */
  @Input() sticky: boolean;

  /** Whether this column should be sticky positioned on the end of the row */
  @Input() stickyEnd: boolean;
}

export class BaseAplsCell {
  @Input('aplsColumnWidth')
  get width() {
    return this._width;
  }
  set width(width) {
    this.elementRef.nativeElement.classList.remove('col-p-' + this._width);

    this._width = width;
    this.elementRef.nativeElement.classList.add('col-p-' + this._width);
  }
  _width;

  @Input('aplsColumnAlign')
  public set align(align: 'left' | 'center' | 'right') {
    this.elementRef.nativeElement.classList.add(`apls-column-align-${align || 'left'}`);
  }

  constructor(columnDef: AplsColumnDef, public elementRef: ElementRef) {
    const columnClassName = `cdk-column-${columnDef.cssClassFriendlyName}`;
    elementRef.nativeElement.classList.add(columnClassName);
  }
}

@Directive({
  selector: 'apls-header-cell, th[apls-header-cell]',
  host: {
    class: 'apls-header-cell',
    role: 'columnheader'
  }
})
export class AplsHeaderCell extends BaseAplsCell {
  constructor(columnDef: AplsColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}

@Directive({
  selector: 'apls-footer-cell, td[apls-footer-cell]',
  host: {
    class: 'apls-footer-cell',
    role: 'gridcell'
  }
})
export class AplsFooterCell extends BaseAplsCell {
  constructor(columnDef: AplsColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}

@Directive({
  selector: 'apls-cell, td[apls-cell]',
  host: {
    class: 'apls-cell',
    role: 'gridcell'
  }
})
export class AplsCell extends BaseAplsCell {
  constructor(columnDef: AplsColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}
