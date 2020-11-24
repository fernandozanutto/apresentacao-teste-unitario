/**
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AplsCheckbox} from './checkbox';
import {AplsCheckboxRequiredValidator} from './checkbox-required-validator';

@NgModule({
  imports: [CommonModule, ObserversModule],
  exports: [AplsCheckbox, AplsCheckboxRequiredValidator],
  declarations: [AplsCheckbox, AplsCheckboxRequiredValidator],
})
export class AplsCheckboxModule {}
