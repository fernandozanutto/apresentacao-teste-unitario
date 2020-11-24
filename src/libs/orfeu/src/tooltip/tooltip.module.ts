/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  AplsTooltip,
  TooltipComponent,
  APLS_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './tooltip';

export {
  AplsTooltip,
} from './tooltip';

@NgModule({
  imports: [CommonModule, OverlayModule],
  exports: [AplsTooltip],
  declarations: [AplsTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
  providers: [APLS_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class AplsTooltipModule {}
