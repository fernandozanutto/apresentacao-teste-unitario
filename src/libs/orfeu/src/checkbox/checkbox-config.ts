/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { InjectionToken } from '@angular/core';

export type AplsCheckboxClickAction =
  | 'noop'
  | 'check'
  | 'check-indeterminate'
  | undefined;

export const APLS_CHECKBOX_CLICK_ACTION = new InjectionToken<
  AplsCheckboxClickAction
>('apls-checkbox-click-action');
