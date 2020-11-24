/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AplsButton } from './button.directive';

export { AplsButton } from './button.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [AplsButton],
  exports: [AplsButton]
})
export class AplsButtonModule {}
