/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {merge, of as observableOf, Subscription} from 'rxjs';
import {AplsDatepicker} from './datepicker';
import {AplsDatepickerIntl} from './datepicker-intl';

@Directive({
  selector: '[aplsDatepickerToggleIcon]'
})
export class AplsDatepickerToggleIcon {}

@Component({
  selector: 'apls-datepicker-toggle',
  templateUrl: 'datepicker-toggle.html',
  styleUrls: ['datepicker-toggle.scss'],
  host: {
    'class': 'apls-datepicker-toggle',
    '[class.apls-datepicker-toggle-active]': 'datepicker && datepicker.opened',
  },
  exportAs: 'aplsDatepickerToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AplsDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
  private _stateChanges = Subscription.EMPTY;

  /** Datepicker instance that the button will toggle. */
  @Input('for') datepicker: AplsDatepicker<D>;

  /** Whether the toggle button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled === undefined ? this.datepicker.disabled : !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  /** Custom icon set by the consumer. */
  @ContentChild(AplsDatepickerToggleIcon) _customIcon: AplsDatepickerToggleIcon;

  constructor(public _intl: AplsDatepickerIntl, private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.datepicker) {
      this._watchStateChanges();
    }
  }

  ngOnDestroy() {
    this._stateChanges.unsubscribe();
  }

  ngAfterContentInit() {
    this._watchStateChanges();
  }

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }

  private _watchStateChanges() {
    const datepickerDisabled = this.datepicker ? this.datepicker._disabledChange : observableOf();
    const inputDisabled = this.datepicker && this.datepicker._datepickerInput ?
        this.datepicker._datepickerInput._disabledChange : observableOf();
    const datepickerToggled = this.datepicker ?
        merge(this.datepicker.openedStream, this.datepicker.closedStream) :
        observableOf();

    this._stateChanges.unsubscribe();
    this._stateChanges = merge(
      this._intl.changes,
      datepickerDisabled,
      inputDisabled,
      datepickerToggled
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
