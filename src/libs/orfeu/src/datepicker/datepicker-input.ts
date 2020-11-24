import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { AfterContentInit, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, OnDestroy, Optional, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter } from '../core/datetime/date-adapter';
import { APLS_DATE_FORMATS, AplsDateFormats } from '../core/datetime/date-formats';
import { APLS_INPUT_VALUE_ACCESSOR, AplsInputForm } from '../input';
import { Subscription } from 'rxjs';
import { AplsDatepicker } from './datepicker';
import { createMissingDateImplError } from './datepicker-errors';
import { AplsModal } from '../modal';
import { TranslateService } from '@ngx-translate/core';

export const APLS_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AplsDatepickerInput),
  multi: true
};

export const APLS_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => AplsDatepickerInput),
  multi: true
};

/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use AplsDatepickerInputEvent instead.
 */
export class AplsDatepickerInputEvent<D> {
  /** The new value for the target datepicker input. */
  value: D | null;

  constructor(
    /** Reference to the datepicker input component that emitted the event. */
    public target: AplsDatepickerInput<D>,
    /** Reference to the native input element associated with the datepicker input. */
    public targetElement: HTMLElement
  ) {
    this.value = this.target.value;
  }
}

export interface dateFormat {
  test: string;
  pos: string;
}

/** Directive used to connect an input to a AplsDatepicker. */
@Directive({
  selector: 'input[aplsDatepicker]',
  providers: [APLS_DATEPICKER_VALUE_ACCESSOR, APLS_DATEPICKER_VALIDATORS, { provide: APLS_INPUT_VALUE_ACCESSOR, useExisting: AplsDatepickerInput }],
  host: {
    '[attr.aria-haspopup]': 'true',
    '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(click)': '_onClick()',
    '(keydown)': '_onKeydown($event)'
  },
  exportAs: 'aplsDatepickerInput'
})
export class AplsDatepickerInput<D> implements AfterContentInit, ControlValueAccessor, OnDestroy, Validator {
  /** The datepicker that this input is associated with. */
  @Input()
  set aplsDatepicker(value: AplsDatepicker<D>) {
    this.registerDatepicker(value);
  }
  _datepicker: AplsDatepicker<D>;

  private registerDatepicker(value: AplsDatepicker<D>) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }

  /** Function that can be used to filter out dates within the datepicker. */
  @Input()
  set aplsDatepickerFilter(value: (date: D | null) => boolean) {
    this._dateFilter = value;
    this._validatorOnChange();
  }
  _dateFilter: (date: D | null) => boolean;

  /** The value of the input. */
  @Input()
  get value(): D | null {
    return this._value;
  }
  set value(value: D | null) {
    value = this._dateAdapter.deserialize(value);
    this._lastValueValid = !value || this._dateAdapter.isValid(value);
    value = this._getValidDateOrNull(value);
    const oldDate = this.value;
    this._value = value;
    this._formatValue(value);

    if (!this._dateAdapter.sameDate(oldDate, value)) {
      this._valueChange.emit(value);
    }
  }
  private _value: D | null;

  /** The minimum valid date. */
  @Input()
  get min(): D | null {
    return this._min;
  }
  set min(value: D | null) {
    this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null {
    return this._max;
  }
  set max(value: D | null) {
    this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _max: D | null;

  /** The maximum valid date. */
  @Input()
  get format(): dateFormat {
    return this._format;
  }
  set format(format: dateFormat) {
    this._format = format;
  }
  private _format: dateFormat = { test: '([^*]+)/([^*]+)/([^*]+)', pos: '$2/$1/$3' };

  /** Whether the datepicker-input is disabled. */
  @Input()
  get disabled(): boolean {
    return !!this._disabled;
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    const element = this._elementRef.nativeElement;

    if (this._disabled !== newValue) {
      this._disabled = newValue;
      this._disabledChange.emit(newValue);
    }

    // We need to null check the `blur` method, because it's undefined during SSR.
    if (newValue && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur();
    }
  }
  private _disabled: boolean;

  // Mensagens informativas de acordo com o tipo
  @Input() msgDataInvalida = this._translate.instant('mensagem.informe_data_valida');
  @Input() msgDataInicioMaior = this._translate.instant('mensagem.data_inicio_maior');
  @Input() msgDataFimMenor = this._translate.instant('mensagem.data_fim_menor');

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly dateChange: EventEmitter<AplsDatepickerInputEvent<D>> = new EventEmitter<AplsDatepickerInputEvent<D>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly dateInput: EventEmitter<AplsDatepickerInputEvent<D>> = new EventEmitter<AplsDatepickerInputEvent<D>>();

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<D | null>();

  /** Emits when the disabled state has changed */
  _disabledChange = new EventEmitter<boolean>();

  _onTouched = () => {};

  private _cvaOnChange: (value: any) => void = () => {};

  private _validatorOnChange = () => {};

  private _datepickerSubscription = Subscription.EMPTY;

  private _localeSubscription = Subscription.EMPTY;

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ? null : { aplsDatepickerParse: { text: this._elementRef.nativeElement.value } };
  };

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this.min || !controlValue || this._dateAdapter.compareDate(this.min, controlValue) <= 0
      ? null
      : { aplsDatepickerMin: { min: this.min, actual: controlValue } };
  };

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this.max || !controlValue || this._dateAdapter.compareDate(this.max, controlValue) >= 0
      ? null
      : { aplsDatepickerMax: { max: this.max, actual: controlValue } };
  };

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this._dateFilter || !controlValue || this._dateFilter(controlValue) ? null : { aplsDatepickerFilter: true };
  };

  /** The combined form control validator for this input. */
  private _validator: ValidatorFn | null = Validators.compose([this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator]);

  /** Whether the last value set on the input was valid. */
  private _lastValueValid = false;

  private dateInvalidShowed = false; // Controle para apresentar a mensagem de data inválida apenas 1x
  private dateTouched = false; // Controle para verificar se a data já foi tocada

  constructor(
    private _elementRef: ElementRef,
    @Optional() public _dateAdapter: DateAdapter<D>,
    @Optional()
    @Inject(APLS_DATE_FORMATS)
    private _dateFormats: AplsDateFormats,
    @Optional() private _formField: AplsInputForm,
    @Optional() private _aplsModal: AplsModal,
    @Optional() private _translate: TranslateService
  ) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('APLS_DATE_FORMATS');
    }

    // Update the displayed date when the locale changes.
    this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
      this.value = this.value;
    });
  }

  ngAfterContentInit() {
    if (this._datepicker) {
      this._datepickerSubscription = this._datepicker._selectedChanged.subscribe((selected: D) => {
        this.value = selected;
        this._cvaOnChange(selected);
        this._onTouched();
        this.dateInput.emit(new AplsDatepickerInputEvent(this, this._elementRef.nativeElement));
        this.dateChange.emit(new AplsDatepickerInputEvent(this, this._elementRef.nativeElement));
      });
    }
  }

  ngOnDestroy() {
    this._datepickerSubscription.unsubscribe();
    this._localeSubscription.unsubscribe();
    this._valueChange.complete();
    this._disabledChange.complete();
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  /**
   * Gets the element that the datepicker popup should be connected to.
   * @return The element to connect the popup to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: D): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn;
    // removido pois após o create do form esse cara dispava change do form.
    // setTimeout(() => {
    this._validatorOnChange();
    // }, 100);
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _onKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.keyCode === DOWN_ARROW) {
      this._datepicker.open();
      event.preventDefault();
    }
  }

  _onInput(value: string) {
    this.dateTouched = true;

    let date;

    if (this._dateAdapter.hasOwnProperty('locale') && (this._dateAdapter as any).locale != 'en-US') {
      date = new Date(value.replace(new RegExp(this.format.test), this.format.pos));
    } else {
      date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    }

    this._lastValueValid = !date || this._dateAdapter.isValid(date);
    date = this._getValidDateOrNull(date);

    if (!this._dateAdapter.sameDate(date, this._value)) {
      this._value = date;
      this._cvaOnChange(date);
      this._valueChange.emit(date);
      this.dateInput.emit(new AplsDatepickerInputEvent(this, this._elementRef.nativeElement));
    }
  }

  _onChange() {
    this.dateChange.emit(new AplsDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  /** Handles blur events on the input. */
  _onBlur() {
    if (this.value) {
      this.dateInvalidShowed = false;
      let dateValue = this.value;
      let mensagem = null;

      if (!!this.min) {
        let valueCompareDateMin = this._dateAdapter.compareDateMillisecond(this.value, this.min);

        if (valueCompareDateMin == -1) {
          dateValue = null;
          mensagem = this.msgDataFimMenor;
        }
      }

      if (!!this.max) {
        let valueCompareDateMax = this._dateAdapter.compareDateMillisecond(this.value, this.max);

        if (valueCompareDateMax == 1) {
          dateValue = null;
          mensagem = this.msgDataInicioMaior;
        }
      }

      if (!!mensagem) {
        this._aplsModal.toast(mensagem, 'A');
      }

      this._formatValue(dateValue);
    } else {
      if (!this.dateInvalidShowed && this.dateTouched) {
        this.dateInvalidShowed = true;
        this._aplsModal.toast(this.msgDataInvalida, 'A');
      }

      this._formatValue(null);
      this._validatorOnChange();
    }

    this._onTouched();
  }

  _onClick() {
    this._datepicker.open();
    const element = this._elementRef.nativeElement;

    setTimeout(() => {
      element.focus();
    }, 0);
  }

  /** Formats a value and sets it on the input element. */
  private _formatValue(value: D | null) {
    this._elementRef.nativeElement.value = value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj) ? obj : null;
  }
}
