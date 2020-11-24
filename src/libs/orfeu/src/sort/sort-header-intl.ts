/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Injectable, SkipSelf, Optional } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * To modify the labels and text displayed, create a new instance of AplsSortHeaderIntl and
 * include it in a custom provider.
 */
@Injectable({ providedIn: 'root' })
export class AplsSortHeaderIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** ARIA label for the sorting button. */
  sortButtonLabel = (id: string) => {
    return `Change sorting for ${id}`;
  };
}
/** @docs-private */
export function APLS_SORT_HEADER_INTL_PROVIDER_FACTORY(
  parentIntl: AplsSortHeaderIntl
) {
  return parentIntl || new AplsSortHeaderIntl();
}

/** @docs-private */
export const APLS_SORT_HEADER_INTL_PROVIDER = {
  // If there is already an AplsSortHeaderIntl available, use that. Otherwise, provide a new one.
  provide: AplsSortHeaderIntl,
  deps: [[new Optional(), new SkipSelf(), AplsSortHeaderIntl]],
  useFactory: APLS_SORT_HEADER_INTL_PROVIDER_FACTORY
};
