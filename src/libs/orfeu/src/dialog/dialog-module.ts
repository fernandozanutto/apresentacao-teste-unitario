/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { APLS_DIALOG_SCROLL_STRATEGY_PROVIDER, AplsDialog } from './dialog';
import { AplsDialogContainer } from './dialog-container';
import {
  AplsDialogActions,
  AplsDialogClose,
  AplsDialogContent,
  AplsDialogTitle
} from './dialog-content-directives';

@NgModule({
  imports: [CommonModule, OverlayModule, PortalModule],
  exports: [
    AplsDialogContainer,
    AplsDialogClose,
    AplsDialogTitle,
    AplsDialogContent,
    AplsDialogActions,
  ],
  declarations: [
    AplsDialogContainer,
    AplsDialogClose,
    AplsDialogTitle,
    AplsDialogActions,
    AplsDialogContent
  ],
  providers: [AplsDialog, APLS_DIALOG_SCROLL_STRATEGY_PROVIDER],
  entryComponents: [AplsDialogContainer]
})
export class AplsDialogModule {}
