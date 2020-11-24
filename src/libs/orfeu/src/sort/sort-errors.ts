/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

/** @docs-private */
export function getSortDuplicateSortableIdError(id: string): Error {
  return Error(`Cannot have two AplsSortables with the same id (${id}).`);
}

/** @docs-private */
export function getSortHeaderNotContainedWithinSortError(): Error {
  return Error(
    `AplsSortHeader must be placed within a parent element with the AplsSort directive.`
  );
}

/** @docs-private */
export function getSortHeaderMissingIdError(): Error {
  return Error(`AplsSortHeader must be provided with a unique id.`);
}

/** @docs-private */
export function getSortInvalidDirectionError(direction: string): Error {
  return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
}
