import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessor } from '@angular/forms';

/**
 * A basic content container component that adds the styles of a Aplserial design card.
 *
 * While this component can be used alone, it also provides a number
 * of preset styles for common card sections, including:
 */
@Component({
  selector: 'apls-switch',
  exportAs: 'aplsSwitch',
  templateUrl: 'switch.html',
  styleUrls: ['switch.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'apls-switch' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AplsSwitch),
      multi: true
    }
  ]
})
export class AplsSwitch implements ControlValueAccessor {
  @Input() label = 'switch';
  @Input('value') _value;
  onChange: any = () => {};
  onTouched: any = () => {};

  initValue = null;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  writeValue(value) {
    if (this.initValue === null) {
      this.initValue = value;
    }

    this.value = value;
    this._changeDetectorRef.markForCheck();
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  switch() {
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
