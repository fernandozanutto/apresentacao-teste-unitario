/**
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AplsInput } from './input';
import { AplsInputLabel } from './field/input-label/input-label.directive';
import { AplsInputHint } from './field/input-hint/input-hint.directive';
import { AplsInputGroup } from './field/input-group/input-group.component';
import { AplsInputForm } from './field/input-form/input-form.component';
import { AplsInputGroupPrepend } from './field/input-group-prepend/input-group-prepend.component';
import { AplsInputGroupPrependText } from './field/input-group-prepend-text/input-group-prepend-text.component';

const EXPORTED_DECLARATIONS = [
  AplsInputGroup,
  AplsInputForm,
  AplsInputGroupPrepend,
  AplsInput,
  AplsInputLabel,
  AplsInputHint,
  AplsInputGroupPrependText,
];

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: EXPORTED_DECLARATIONS,
  exports: EXPORTED_DECLARATIONS
})
export class AplsInputModule {}
