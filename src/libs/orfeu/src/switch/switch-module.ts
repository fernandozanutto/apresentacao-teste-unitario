/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AplsSwitch,
} from './switch';


@NgModule({
  imports: [CommonModule],
  exports: [
    AplsSwitch,
    CommonModule,
  ],
  declarations: [
    AplsSwitch
  ]
})
export class AplsSwitchModule {}
