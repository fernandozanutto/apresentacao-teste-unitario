/**
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AplsInputModule } from '../input';

import {AplsInputFileComponent} from './file.component';
import {AplsInputFileDirective} from './file.directive';

const EXPORTED_DECLARATIONS = [
  AplsInputFileComponent,
  AplsInputFileDirective
];

@NgModule({
  imports: [CommonModule, AplsInputModule],
  declarations: EXPORTED_DECLARATIONS,
  exports: EXPORTED_DECLARATIONS
})
export class AplsInputFileModule {}
