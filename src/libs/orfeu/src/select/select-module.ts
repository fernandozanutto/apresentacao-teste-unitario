import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { AplsOptionModule } from '../core/option';
import { AplsPseudoCheckboxModule } from '../core/selection';
import { AplsTooltipModule } from '../tooltip';
import { APLS_SELECT_SCROLL_STRATEGY_PROVIDER, AplsSelect, AplsSelectTrigger, ASplsSelectDisplayValue } from './select';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, OverlayModule, AplsOptionModule, AplsTooltipModule, AplsPseudoCheckboxModule, TranslateModule],
  exports: [AplsSelect, AplsSelectTrigger, AplsOptionModule, ASplsSelectDisplayValue],
  declarations: [AplsSelect, AplsSelectTrigger, ASplsSelectDisplayValue],
  providers: [APLS_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class AplsSelectModule {}
