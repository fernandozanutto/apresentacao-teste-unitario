/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { ViewContainerRef } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { ScrollStrategy } from '@angular/cdk/overlay';

export type DialogRole = 'dialog' | 'alertdialog';

export interface DialogPosition {
  top?: string;

  bottom?: string;

  left?: string;

  right?: string;
}

export class AplsDialogConfig<D = any> {
  viewContainerRef?: ViewContainerRef;

  id?: string;

  role?: DialogRole = 'dialog';

  panelClass?: string | string[] = '';

  hasBackdrop?: boolean = true;

  backdropClass?: string = '';

  disableClose?: boolean = false;

  width?: string = '';

  height?: string = '';

  minWidth?: number | string;

  minHeight?: number | string;

  maxWidth?: number | string = '80vw';

  maxHeight?: number | string;

  position?: DialogPosition;

  data?: D | null = null;

  direction?: Direction;

  ariaDescribedBy?: string | null = null;

  ariaLabel?: string | null = null;

  autoFocus?: boolean = true;

  scrollStrategy?: ScrollStrategy;

  closeOnNavigation?: boolean = true;
}
