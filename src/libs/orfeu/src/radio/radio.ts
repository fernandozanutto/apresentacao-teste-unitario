/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  Inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;

export const APLS_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AplsRadioGroup),
  multi: true
};

export class AplsRadioChange {
  constructor(public source: AplsRadioButton, public value: any) {}
}

@Directive({
  selector: 'apls-radio-group',
  exportAs: 'aplsRadioGroup',
  providers: [APLS_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
  host: {
    role: 'radiogroup',
    class: 'apls-radio-group'
  },
  inputs: ['disabled']
})
export class AplsRadioGroup implements AfterContentInit, ControlValueAccessor {
  private _value: any = null;

  private _name: string = `apls-radio-group-${nextUniqueId++}`;

  private _selected: AplsRadioButton | null = null;

  private _isInitialized: boolean = false;

  private _labelPosition: 'before' | 'after' = 'after';

  private _disabled: boolean = false;

  private _required: boolean = false;

  _controlValueAccessorChangeFn: (value: any) => void = () => {};

  onTouched: () => any = () => {};

  @Output()
  readonly change: EventEmitter<AplsRadioChange> = new EventEmitter<
    AplsRadioChange
  >();

  @ContentChildren(forwardRef(() => AplsRadioButton), { descendants: true })
  _radios: QueryList<AplsRadioButton>;

  @Input()
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
    this._updateRadioButtonNames();
  }

  @Input()
  get value(): any {
    return this._value;
  }
  set value(newValue: any) {
    if (this._value !== newValue) {
      this._value = newValue;

      this._updateSelectedRadioFromValue();
      this._checkSelectedRadioButton();
    }
  }

  _checkSelectedRadioButton() {
    if (this._selected && !this._selected.checked) {
      this._selected.checked = true;
    }
  }

  @Input()
  get selected() {
    return this._selected;
  }
  set selected(selected: AplsRadioButton | null) {
    this._selected = selected;
    this.value = selected ? selected.value : null;
    this._checkSelectedRadioButton();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  constructor(private _changeDetector: ChangeDetectorRef) {}

  ngAfterContentInit() {
    this._isInitialized = true;
  }

  _touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private _updateRadioButtonNames(): void {
    if (this._radios) {
      this._radios.forEach(radio => {
        radio.name = this.name;
      });
    }
  }

  private _updateSelectedRadioFromValue(): void {
    const isAlreadySelected =
      this._selected !== null && this._selected.value === this._value;

    if (this._radios && !isAlreadySelected) {
      this._selected = null;
      this._radios.forEach(radio => {
        radio.checked = this.value === radio.value;
        if (radio.checked) {
          this._selected = radio;
        }
      });
    }
  }

  _emitChangeEvent(): void {
    if (this._isInitialized) {
      this.change.emit(new AplsRadioChange(this._selected!, this._value));
    }
  }

  _markRadiosForCheck() {
    if (this._radios) {
      this._radios.forEach(radio => radio._markForCheck());
    }
  }

  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._changeDetector.markForCheck();
  }
}

@Component({
  selector: 'apls-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['./radio.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'aplsRadioButton',
  host: {
    class: 'apls-radio-button',
    '[class.apls-radio-checked]': 'checked',
    '[class.apls-radio-disabled]': 'disabled',
    '[attr.id]': 'id',
    '(focus)': '_inputElement.nativeElement.focus()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AplsRadioButton implements OnInit, OnDestroy {
  private _uniqueId: string = `apls-radio-${++nextUniqueId}`;

  @Input() id: string = this._uniqueId;

  @Input() name: string;

  @Input('aria-label') ariaLabel: string;

  @Input('aria-labelledby') ariaLabelledby: string;

  @Input('aria-describedby') ariaDescribedby: string;

  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: boolean) {
    const newCheckedState = coerceBooleanProperty(value);
    if (this._checked !== newCheckedState) {
      this._checked = newCheckedState;
      if (
        newCheckedState &&
        this.radioGroup &&
        this.radioGroup.value !== this.value
      ) {
        this.radioGroup.selected = this;
      } else if (
        !newCheckedState &&
        this.radioGroup &&
        this.radioGroup.value === this.value
      ) {
        this.radioGroup.selected = null;
      }

      if (newCheckedState) {
        this._radioDispatcher.notify(this.id, this.name);
      }
      this._changeDetector.markForCheck();
    }
  }

  @Input()
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      if (this.radioGroup !== null) {
        if (!this.checked) {
          this.checked = this.radioGroup.value === value;
        }
        if (this.checked) {
          this.radioGroup.selected = this;
        }
      }
    }
  }

  @Input()
  get disabled(): boolean {
    return (
      this._disabled || (this.radioGroup !== null && this.radioGroup.disabled)
    );
  }
  set disabled(value: boolean) {
    const newDisabledState = coerceBooleanProperty(value);
    if (this._disabled !== newDisabledState) {
      this._disabled = newDisabledState;
      this._changeDetector.markForCheck();
    }
  }

  @Input()
  get required(): boolean {
    return this._required || (this.radioGroup && this.radioGroup.required);
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }

  @Output()
  readonly change: EventEmitter<AplsRadioChange> = new EventEmitter<
    AplsRadioChange
  >();

  radioGroup: AplsRadioGroup;

  get inputId(): string {
    return `${this.id || this._uniqueId}-input`;
  }

  private _checked: boolean = false;

  private _disabled: boolean;

  private _required: boolean;

  private _value: any = null;

  private _removeUniqueSelectionListener: () => void = () => {};

  @ViewChild('input') _inputElement: ElementRef;

  constructor(
    @Optional() radioGroup: AplsRadioGroup,
    public elementRef: ElementRef,
    private _changeDetector: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _radioDispatcher: UniqueSelectionDispatcher
  ) {
    this.radioGroup = radioGroup;

    this._removeUniqueSelectionListener = _radioDispatcher.listen(
      (id: string, name: string) => {
        if (id !== this.id && name === this.name) {
          this.checked = false;
        }
      }
    );
  }

  focus(): void {
    this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
  }

  _markForCheck() {
    this._changeDetector.markForCheck();
  }

  ngOnInit() {
    if (this.radioGroup) {
      // If the radio is inside a radio group, determine if it should be checked
      this.checked = this.radioGroup.value === this._value;
      // Copy name from parent radio group
      this.name = this.radioGroup.name;
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
    this._removeUniqueSelectionListener();
  }

  private _emitChangeEvent(): void {
    this.change.emit(new AplsRadioChange(this, this._value));
  }

  _onInputClick(event: Event) {
    event.stopPropagation();
  }

  _onInputChange(event: Event) {
    event.stopPropagation();

    const groupValueChanged =
      this.radioGroup && this.value !== this.radioGroup.value;
    this.checked = true;
    this._emitChangeEvent();

    if (this.radioGroup) {
      this.radioGroup._controlValueAccessorChangeFn(this.value);
      this.radioGroup._touch();
      if (groupValueChanged) {
        this.radioGroup._emitChangeEvent();
      }
    }
  }
}
