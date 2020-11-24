/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, Input, OnChanges, OnInit, Optional, SimpleChanges, ElementRef } from '@angular/core';
import { AplsDialog } from './dialog';
import { AplsDialogRef } from './dialog-ref';

let dialogElementUid = 0;

@Directive({
  selector: `button[apls-dialog-close], button[aplsDialogClose]`,
  exportAs: 'aplsDialogClose',
  host: {
    '(click)': 'dialogRef.close(dialogResult)',
    '[attr.aria-label]': 'ariaLabel',
    type: 'button'
  }
})
export class AplsDialogClose implements OnInit, OnChanges {
  @Input('aria-label') ariaLabel: string = 'Close dialog';

  @Input('apls-dialog-close') dialogResult: any;

  @Input('aplsDialogClose') _aplsDialogClose: any;

  constructor(@Optional() public dialogRef: AplsDialogRef<any>, private _elementRef: ElementRef, private _dialog: AplsDialog) {}

  ngOnInit() {
    if (!this.dialogRef) {
      this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes._aplsDialogClose || changes._aplsDialogCloseResult;

    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }
}

@Directive({
  selector: `[apls-dialog-title], apls-dialog-title, [aplsDialogTitle]`,
  host: { class: 'apls-dialog-title' }
})
export class AplsDialogTitle implements OnInit {
  @Input() id = `apls-dialog-title-${dialogElementUid++}`;

  constructor(@Optional() private _dialogRef: AplsDialogRef<any>, private _elementRef: ElementRef, private _dialog: AplsDialog) {}

  ngOnInit() {
    if (!this._dialogRef) {
      this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }

    if (this._dialogRef) {
      Promise.resolve().then(() => {
        const container = this._dialogRef._containerInstance;

        if (container && !container._ariaLabelledBy) {
          container._ariaLabelledBy = this.id;
        }
      });
    }
  }
}

@Directive({
  selector: `[apls-dialog-content], apls-dialog-content, [aplsDialogContent]`,
  host: { class: 'apls-dialog-content' }
})
export class AplsDialogContent {}

@Directive({
  selector: `[apls-dialog-actions], apls-dialog-actions, [aplsDialogActions]`,
  host: { class: 'apls-dialog-actions' }
})
export class AplsDialogActions {}

function getClosestDialog(element: ElementRef, openDialogs: AplsDialogRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement;

  while (parent && !parent.classList.contains('apls-dialog-container')) {
    parent = parent.parentElement;
  }

  return parent ? openDialogs.find(dialog => dialog.id === parent!.id) : null;
}
