/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, forwardRef, Provider } from '@angular/core';
import { CheckboxRequiredValidator, NG_VALIDATORS } from '@angular/forms';

export const MAT_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => AplsCheckboxRequiredValidator),
  multi: true
};

@Directive({
  selector: `apls-checkbox[required][formControlName],
             apls-checkbox[required][formControl], apls-checkbox[required][ngModel]`,
  providers: [MAT_CHECKBOX_REQUIRED_VALIDATOR],
  host: { '[attr.required]': 'required ? "" : null' }
})
export class AplsCheckboxRequiredValidator extends CheckboxRequiredValidator {}
