/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AplsMenuBox } from './menu-box';
import { AplsProgressBarModule } from '../progress-bar/progress-bar-module';

@NgModule({
  imports: [CommonModule, AplsProgressBarModule],
  exports: [AplsMenuBox],
  declarations: [AplsMenuBox]
})
export class AplsMenuBoxModule {}
