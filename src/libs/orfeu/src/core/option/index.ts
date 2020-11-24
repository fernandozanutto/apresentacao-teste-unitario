/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AplsPseudoCheckboxModule} from '../selection';
import {AplsOption} from './option';
import {AplsOptgroup} from './optgroup';


@NgModule({
  imports: [CommonModule, AplsPseudoCheckboxModule],
  exports: [AplsOption, AplsOptgroup],
  declarations: [AplsOption, AplsOptgroup]
})
export class AplsOptionModule {}


export * from './option';
export * from './optgroup';
