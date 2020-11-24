/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AplsSort } from './sort';
import { AplsSortHeader } from './sort-header';
import { APLS_SORT_HEADER_INTL_PROVIDER } from './sort-header-intl';

@NgModule({
  imports: [CommonModule],
  exports: [AplsSort, AplsSortHeader],
  declarations: [AplsSort, AplsSortHeader],
  providers: [APLS_SORT_HEADER_INTL_PROVIDER]
})
export class AplsSortModule {}
