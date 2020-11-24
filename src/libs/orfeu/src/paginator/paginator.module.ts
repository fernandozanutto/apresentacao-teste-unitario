/**
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AplsSelectModule } from '../select';
import { AplsPaginatorComponent } from './paginator.component';

const EXPORTED_DECLARATIONS = [AplsPaginatorComponent];

@NgModule({
  imports: [CommonModule, AplsSelectModule, ReactiveFormsModule],
  declarations: EXPORTED_DECLARATIONS,
  exports: EXPORTED_DECLARATIONS
})
export class AplsPaginatorModule {}
