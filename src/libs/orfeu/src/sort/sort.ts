/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directive, EventEmitter, Input, isDevMode, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SortDirection } from './sort-direction';
import { getSortDuplicateSortableIdError, getSortHeaderMissingIdError, getSortInvalidDirectionError } from './sort-errors';
import { Subject, Subscriber, Observable } from 'rxjs';
import { environment } from '@apollus/environments';

/** Interface for a directive that holds sorting state consumed by `AplsSortHeader`. */
export interface AplsSortable {
  /** The id of the column being sorted. */
  id: string;

  /** Starting sort direction. */
  start: 'asc' | 'desc';

  /** Whether to disable clearing the sorting state. */
  disableClear: boolean;
}

/** The current sort state. */
export interface Sort {
  /** The id of the column being sorted. */
  active: string;

  /** The sort direction. */
  direction: SortDirection;
}

/** Container for AplsSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[aplsSort]',
  exportAs: 'aplsSort',
  inputs: ['disabled: aplsSortDisabled']
})
export class AplsSort implements OnChanges, OnDestroy, OnInit {
  /** Whether this directive has been marked as initialized. */
  _isInitialized = false;

  /**
   * List of subscribers that subscribed before the directive was initialized. Should be notified
   * during _markInitialized. Set to null after pending subscribers are notified, and should
   * not expect to be populated after.
   */
  _pendingSubscribers: Subscriber<void>[] | null = [];

  /**
   * Observable stream that emits when the directive initializes. If already initialized, the
   * subscriber is stored to be notified once _markInitialized is called.
   */
  initialized = new Observable<void>(subscriber => {
    // If initialized, immediately notify the subscriber. Otherwise store the subscriber to notify
    // when _markInitialized is called.
    if (this._isInitialized) {
      this._notifySubscriber(subscriber);
    } else {
      this._pendingSubscribers!.push(subscriber);
    }
  });

  /** Emits and completes the subscriber stream (should only emit once). */
  _notifySubscriber(subscriber: Subscriber<void>): void {
    subscriber.next();
    subscriber.complete();
  }

  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, AplsSortable>();

  /** Used to notify any child components listening to state changes. */
  readonly _stateChanges = new Subject<void>();

  /** The id of the most recently sorted AplsSortable. */
  @Input('aplsSortActive') active: string;

  private _disabled: boolean = false;

  get disabled() {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  /**
   * The direction to set when an AplsSortable is initially sorted.
   * May be overriden by the AplsSortable's sort start.
   */
  @Input('aplsSortStart') start: 'asc' | 'desc' = 'asc';

  /** The sort direction of the currently active AplsSortable. */
  @Input('aplsSortDirection')
  get direction(): SortDirection {
    return this._direction;
  }
  set direction(direction: SortDirection) {
    if (!environment.production && direction && direction !== 'asc' && direction !== 'desc') {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  private _direction: SortDirection = '';

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the AplsSortable's disable clear input.
   */
  @Input('aplsSortDisableClear')
  get disableClear(): boolean {
    return this._disableClear;
  }
  set disableClear(v: boolean) {
    this._disableClear = coerceBooleanProperty(v);
  }
  private _disableClear = true;

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('aplsSortChange') readonly sortChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('aplsSortInit') readonly sortInit = new EventEmitter();

  /**
   * Register function to be used by the contained AplsSortables. Adds the AplsSortable to the
   * collection of AplsSortables.
   */
  register(sortable: AplsSortable): void {
    if (!sortable.id) {
      throw getSortHeaderMissingIdError();
    }

    if (this.sortables.has(sortable.id)) {
      throw getSortDuplicateSortableIdError(sortable.id);
    }
    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Unregister function to be used by the contained AplsSortables. Removes the AplsSortable from the
   * collection of contained AplsSortables.
   */
  deregister(sortable: AplsSortable): void {
    this.sortables.delete(sortable.id);
  }

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: AplsSortable): void {
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = sortable.start ? sortable.start : this.start;
    } else {
      this.direction = this.getNextSortDirection(sortable);
    }

    this.sortChange.emit({ active: this.active, direction: this.direction });
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: AplsSortable): SortDirection {
    if (!sortable) {
      return '';
    }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) {
      nextDirectionIndex = 0;
    }
    return sortDirectionCycle[nextDirectionIndex];
  }

  ngOnInit() {
    if (this._isInitialized) {
      throw Error('This directive has already been marked as initialized and ' + 'should not be called twice.');
    }

    this._isInitialized = true;

    this._pendingSubscribers!.forEach(this._notifySubscriber);
    this._pendingSubscribers = null;

    this.sortInit.emit(this);
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc' | 'desc', disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') {
    sortOrder.reverse();
  }
  if (!disableClear) {
    sortOrder.push('');
  }

  return sortOrder;
}
