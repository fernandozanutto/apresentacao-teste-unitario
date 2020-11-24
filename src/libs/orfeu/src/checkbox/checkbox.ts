/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  APLS_CHECKBOX_CLICK_ACTION,
  AplsCheckboxClickAction
} from './checkbox-config';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

let nextUniqueId = 0;

export const APLS_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AplsCheckbox),
  multi: true
};

export enum TransitionCheckState {
  Init,
  Checked,
  Unchecked,
  Indeterminate
}

export class AplsCheckboxChange {
  source: AplsCheckbox;
  checked: boolean;
}

@Component({
  selector: 'apls-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.scss'],
  exportAs: 'aplsCheckbox',
  host: {
    class: 'apls-checkbox',
    '[id]': 'id',
    '[class.apls-checkbox-focus]': 'focused',
    '[class.apls-checkbox-indeterminate]': 'indeterminate',
    '[class.apls-checkbox-checked]': 'checked',
    '[class.apls-checkbox-disabled]': 'disabled',
    '[class.apls-checkbox-label-before]': 'labelPosition == "before"',
    '[class._apls-animation-noopable]': `_animationMode === 'NoopAnimations'`
  },
  providers: [APLS_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  inputs: ['disableRipple', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AplsCheckbox
  implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input('aria-label') ariaLabel: string = '';

  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  private _uniqueId: string = `apls-checkbox-${++nextUniqueId}`;

  @Input() id: string = this._uniqueId;

  get inputId(): string {
    return `${this.id || this._uniqueId}-input`;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  private _required: boolean;

  @Input() labelPosition: 'before' | 'after' = 'after';

  @Input() name: string | null = null;

  @Output()
  readonly change: EventEmitter<AplsCheckboxChange> = new EventEmitter<
    AplsCheckboxChange
  >();

  @Output()
  readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<
    boolean
  >();

  @Input() value: string;

  @ViewChild('input') _inputElement: ElementRef;

  _onTouched: () => any = () => {};

  private _currentAnimationClass: string = '';

  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

  private _controlValueAccessorChangeFn: (value: any) => void = () => {};

  tabIndex = 0;

  focused = false;

  constructor(
    public elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    @Attribute('tabindex') tabIndex: string,
    @Optional()
    @Inject(APLS_CHECKBOX_CLICK_ACTION)
    private _clickAction: AplsCheckboxClickAction,
    @Optional()
    @Inject(ANIMATION_MODULE_TYPE)
    public _animationMode?: string
  ) {
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterViewInit() {
    this._focusMonitor
      .monitor(this._inputElement.nativeElement)
      .subscribe(focusOrigin => {
        this._onInputFocusChange(focusOrigin);
      });
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
  }

  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: boolean) {
    if (value != this.checked) {
      this._checked = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked: boolean = false;

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: any) {
    if (value != this.disabled) {
      this._disabled = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _disabled: boolean = false;

  @Input()
  get indeterminate(): boolean {
    return this._indeterminate;
  }
  set indeterminate(value: boolean) {
    const changed = value != this._indeterminate;
    this._indeterminate = value;

    if (changed) {
      if (this._indeterminate) {
        this._transitionCheckState(TransitionCheckState.Indeterminate);
      } else {
        this._transitionCheckState(
          this.checked
            ? TransitionCheckState.Checked
            : TransitionCheckState.Unchecked
        );
      }
      this.indeterminateChange.emit(this._indeterminate);
    }
  }
  private _indeterminate: boolean = false;

  _onLabelTextChange() {
    this._changeDetectorRef.markForCheck();
  }

  writeValue(value: any) {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  _getAriaChecked(): 'true' | 'false' | 'mixed' {
    return this.checked ? 'true' : this.indeterminate ? 'mixed' : 'false';
  }

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let element: HTMLElement = this.elementRef.nativeElement;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      element.classList.remove(this._currentAnimationClass);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
      oldState,
      newState
    );
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      element.classList.add(this._currentAnimationClass);
    }
  }

  private _emitChangeEvent() {
    let event = new AplsCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this._controlValueAccessorChangeFn(this.checked);
    this.change.emit(event);
  }

  private _onInputFocusChange(focusOrigin: FocusOrigin) {
    if (focusOrigin !== 'keyboard' && !focusOrigin) {
      this._onTouched();
    }
    this.focused = !!focusOrigin;
    
    this._changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.checked = !this.checked;
  }

  _onInputClick(event: Event) {
    event.stopPropagation();

    if (!this.disabled && this._clickAction !== 'noop') {
      if (this.indeterminate && this._clickAction !== 'check') {
        Promise.resolve().then(() => {
          this._indeterminate = false;
          this.indeterminateChange.emit(this._indeterminate);
        });
      }

      this.toggle();
      this._transitionCheckState(
        this._checked
          ? TransitionCheckState.Checked
          : TransitionCheckState.Unchecked
      );

      this._emitChangeEvent();
    } else if (!this.disabled && this._clickAction === 'noop') {
      this._inputElement.nativeElement.checked = this.checked;
      this._inputElement.nativeElement.indeterminate = this.indeterminate;
    }
  }

  focus(): void {
    this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
  }

  _onInteractionEvent(event: Event) {
    event.stopPropagation();
  }

  private _getAnimationClassForCheckStateTransition(
    oldState: TransitionCheckState,
    newState: TransitionCheckState
  ): string {
    if (this._animationMode === 'NoopAnimations') {
      return '';
    }

    let animSuffix: string = '';

    switch (oldState) {
      case TransitionCheckState.Init:
        if (newState === TransitionCheckState.Checked) {
          animSuffix = 'unchecked-checked';
        } else if (newState == TransitionCheckState.Indeterminate) {
          animSuffix = 'unchecked-indeterminate';
        } else {
          return '';
        }
        break;
      case TransitionCheckState.Unchecked:
        animSuffix =
          newState === TransitionCheckState.Checked
            ? 'unchecked-checked'
            : 'unchecked-indeterminate';
        break;
      case TransitionCheckState.Checked:
        animSuffix =
          newState === TransitionCheckState.Unchecked
            ? 'checked-unchecked'
            : 'checked-indeterminate';
        break;
      case TransitionCheckState.Indeterminate:
        animSuffix =
          newState === TransitionCheckState.Checked
            ? 'indeterminate-checked'
            : 'indeterminate-unchecked';
        break;
    }

    return `apls-checkbox-anim-${animSuffix}`;
  }
}
