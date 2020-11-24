/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AplsRadioButton, AplsRadioGroup } from './radio';

@NgModule({
  imports: [CommonModule],
  exports: [AplsRadioGroup, AplsRadioButton],
  declarations: [AplsRadioGroup, AplsRadioButton]
})
export class AplsRadioModule {}
