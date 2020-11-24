import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, SHIFT, A, S, W, R } from '@angular/cdk/keycodes';
import { CdkConnectedOverlay, Overlay, RepositionScrollStrategy, ScrollStrategy, ViewportRuler } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  isDevMode,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  Renderer2,
  TemplateRef
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { defer, merge, Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, take, takeUntil, debounceTime } from 'rxjs/operators';
import {
  _getOptionScrollPosition,
  CanDisable,
  CanUpdateErrorState,
  ErrorStateMatcher,
  HasTabIndex,
  mixinDisabled,
  mixinErrorState,
  mixinTabIndex
} from '@angular/material/core';

import { _countGroupLabelsBeforeOption, AplsOptgroup, AplsOption, AplsOptionSelectionChange, APLS_OPTION_PARENT_COMPONENT } from '../core/option';
import { aplsSelectAnimations } from './select-animations';
import { getAplsSelectNonFunctionValueError } from './select-errors';
import { AplsInput } from '../input';
import { AplsTooltip } from '../tooltip';
import { environment } from '@apollus/environments';
import { TranslateService } from '@ngx-translate/core';

let nextUniqueId = 0;

export const SELECT_PANEL_MAX_HEIGHT = 256;

export const SELECT_PANEL_PADDING_X = 5;

export const SELECT_PANEL_INDENT_PADDING_X = SELECT_PANEL_PADDING_X * 2;

export const SELECT_ITEM_HEIGHT_EM = 3;

export const SELECT_MULTIPLE_PANEL_PADDING_X = SELECT_PANEL_PADDING_X * 1.5 + 10;

export const SELECT_PANEL_VIEWPORT_PADDING = 5;

export const APLS_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('apls-select-scroll-strategy');

export function APLS_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

export const APLS_SELECT_SCROLL_STRATEGY_PROVIDER = {
  provide: APLS_SELECT_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APLS_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY
};

export class AplsSelectChange {
  constructor(public source: AplsSelect, public value: any) {}
}

export class AplsSelectBase {
  constructor(
    public _elementRef: ElementRef,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}
export const _AplsSelectMixinBase = mixinTabIndex(mixinDisabled(mixinErrorState(AplsSelectBase)));

@Directive({ selector: 'apls-select-display-value, aplsSelectDisplayValue, [aplsSelectDisplayValue]' })
export class ASplsSelectDisplayValue {
  constructor(public template: TemplateRef<ElementRef>) {}
}

@Directive({
  selector: 'apls-select-trigger'
})
export class AplsSelectTrigger {}

@Component({
  selector: 'apls-select',
  exportAs: 'aplsSelect',
  templateUrl: 'select.html',
  styleUrls: ['select.scss'],
  inputs: ['disabled', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': '_ariaLabel',
    '[attr.aria-labelledby]': 'ariaLabelledby',
    '[attr.aria-required]': 'required.toString()',
    '[attr.disabled]': 'disabled ? true : null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-owns]': 'panelOpen ? _optionIds : null',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.apls-select-invalid]': 'errorState',
    '[class.apls-select-required]': 'required',
    class: 'form-control apls-select',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()'
  },
  animations: [aplsSelectAnimations.transformPanel, aplsSelectAnimations.fadeInContent],
  providers: [{ provide: APLS_OPTION_PARENT_COMPONENT, useExisting: AplsSelect }]
})
export class AplsSelect extends _AplsSelectMixinBase
  implements AfterContentInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable, HasTabIndex, CanUpdateErrorState {
  private _panelOpen = false;

  private _required: boolean = false;

  private _scrollTop = 0;

  private _placeholder: string = 'Selecione...';

  private _tooltipLimpar: string = '';

  private _tooltipFechar: string = '';

  private _tooltipConfirmar: string = '';

  private _tooltipTodos: string = '';

  private _multiple: boolean = false;

  private _compareWith = (o1: any, o2: any) => o1 === o2;

  private _filterCompareWith = (o1: any, o2: any) => o1.indexOf(o2) !== -1;

  private _uid = `apls-select-${nextUniqueId++}`;

  private readonly _destroy = new Subject<void>();

  _triggerRect: ClientRect;

  _ariaDescribedby: string;

  _triggerFontSize = 0;

  _selectionModel: SelectionModel<AplsOption>;

  _keyManager: ActiveDescendantKeyManager<AplsOption>;

  _onChange: (value: any) => void = () => {};

  _onTouched = () => {};

  _optionIds: string = '';

  _transformOrigin: string = 'top';

  _panelDoneAnimating: boolean = false;

  _scrollStrategy = this._scrollStrategyFactory();

  _offsetY = 0;

  _positions = [
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top'
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom'
    }
  ];

  private _disableOptionCentering: boolean = false;

  focused: boolean = false;

  beforeChange: string;

  controlType = 'apls-select';

  checkallStates = '';

  nShowing = 0;

  nRegistred = 0;

  listTooltip = {
    close: this._tooltipFechar,
    all: this._tooltipTodos,
    reset: this._tooltipLimpar,
    confirm: this._tooltipConfirmar
  };

  @ViewChild('trigger') trigger: ElementRef;

  @ViewChild('panel') panel: ElementRef;

  @ViewChild('all') tooltipAll: AplsTooltip;

  @ViewChild('close') tooltipClose: AplsTooltip;

  @ViewChild('reset') tooltipReset: AplsTooltip;

  @ViewChild('confirm') tooltipConfirm: AplsTooltip;

  @ViewChild(CdkConnectedOverlay) overlayDir: CdkConnectedOverlay;

  @ContentChildren(AplsOption, { descendants: true })
  get options(): QueryList<AplsOption> {
    return this._options;
  }
  set options(options: QueryList<AplsOption>) {
    this._options = options;

    if (!!this._valueWithOption && Array.isArray(this._valueWithOption)) {
      this._clearSelection();
      if (this.multiple && this._valueWithOption) {
        this._valueWithOption.forEach((currentValue: any) => this._sortSelectValue(currentValue));
        this._sortValues();
      } else {
        this._sortSelectValue(this._valueWithOption);
      }

      this._changeDetectorRef.markForCheck();
    } else {
      this.nShowing = this.options.reduce((prev, current) => (coerceBooleanProperty(current.isHidden) ? prev : ++prev), 0);
      this.nRegistred = this._selectionModel.selected.reduce((prev, current) => (coerceBooleanProperty(current.isHidden) ? prev : ++prev), 0);

      let exception = this.nRegistred == 0 ? '' : 'indeterminate';
      this.checkallStates = this.nRegistred == this.nShowing ? 'checked' : exception;

      this._changeDetectorRef.markForCheck();
    }
  }
  _options: QueryList<AplsOption>;

  @ContentChildren(AplsOptgroup) optionGroups: QueryList<AplsOptgroup>;

  @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

  @ContentChild(AplsSelectTrigger) customTrigger: AplsSelectTrigger;

  @ContentChild(AplsInput) inputFilter: AplsInput;

  @ContentChild(ASplsSelectDisplayValue) displaySelected: ASplsSelectDisplayValue;

  get displayerTemplate(): TemplateRef<ElementRef> {
    return this.displaySelected ? this.displaySelected.template : null;
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  @Input()
  get tooltipLimpar(): string {
    return this._tooltipLimpar;
  }
  set tooltipLimpar(value: string) {
    this._tooltipLimpar = value;
    this.stateChanges.next();

    if (this.tooltipReset) this.tooltipReset.hide();
    setTimeout(() => {
      this.listTooltip.reset = this._tooltipLimpar;
    }, 150);
  }

  @Input()
  get tooltipFechar(): string {
    return this._tooltipFechar;
  }
  set tooltipFechar(value: string) {
    this._tooltipFechar = value;
    this.stateChanges.next();

    if (this.tooltipClose) this.tooltipClose.hide();
    setTimeout(() => {
      this.listTooltip.close = this._tooltipFechar;
    }, 150);
  }

  @Input()
  get tooltipConfirmar(): string {
    return this._tooltipConfirmar;
  }
  set tooltipConfirmar(value: string) {
    this._tooltipConfirmar = value;
    this.stateChanges.next();

    if (this.tooltipConfirm) this.tooltipConfirm.hide();
    setTimeout(() => {
      this.listTooltip.confirm = this._tooltipConfirmar;
    }, 150);
  }

  @Input()
  get tooltipTodos(): string {
    return this._tooltipTodos;
  }
  set tooltipTodos(value: string) {
    this._tooltipTodos = value;
    this.stateChanges.next();

    if (this.tooltipAll) this.tooltipAll.hide();
    setTimeout(() => {
      this.listTooltip.all = this._tooltipTodos;
    }, 150);
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    /**
     * Rogério: 11/03/2019
     * Devido a uma solicitação, onde precisava tratar em tempo de execução se o componente
     * deve ser Select Simples ou Multi-Select, removi o lançamento do erro
     */
    // if (this._selectionModel) {
    //   throw getAplsSelectDynamicMultipleError();
    // }

    this._multiple = coerceBooleanProperty(value);

    /**
     * Rogério: 11/03/2019
     * Devido a uma solicitação, onde precisava tratar em tempo de execução se o componente
     * deve ser Select Simples ou Multi-Select
     */
    if (!!this._selectionModel) {
      this._selectionModel['_multiple'] = this._multiple;
    }
  }

  @Input()
  get disableOptionCentering(): boolean {
    return this._disableOptionCentering;
  }
  set disableOptionCentering(value: boolean) {
    this._disableOptionCentering = coerceBooleanProperty(value);
  }

  @Input()
  get compareWith() {
    return this._compareWith;
  }
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      throw getAplsSelectNonFunctionValueError();
    }
    this._compareWith = fn;
    if (this._selectionModel) {
      this._initializeSelection();
    }
  }

  @Input()
  get filterCompareWith() {
    return this._filterCompareWith;
  }
  set filterCompareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      throw getAplsSelectNonFunctionValueError();
    }
    this._filterCompareWith = fn;
  }

  @Input()
  get value(): any {
    return this._value;
  }
  set value(newValue: any) {
    if (newValue !== this._value) {
      this.writeValue(newValue);
      this._value = newValue;
    }
  }
  private _value: any;
  private _valueWithOption: any;

  @Input('aria-label') ariaLabel: string = '';

  @Input('aria-labelledby') ariaLabelledby: string;

  @Input() errorStateMatcher: ErrorStateMatcher;

  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }

  /**
   * Input que permite ocultar o header do select para casos que não seja necessário
   * Ex: headerHidden="true"
   * Autor: Jardel Simão
   */
  @Input() headerHidden = false;

  private _id: string;

  readonly optionSelectionChanges = defer(() => {
    if (this.options) {
      return merge(...this.options.map(option => option.onSelectionChange));
    }

    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this.optionSelectionChanges)
    );
  });

  @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('opened') readonly _openedStream: Observable<void> = this.openedChange.pipe(
    filter(o => o),
    map(() => {})
  );

  @Output('closed') readonly _closedStream: Observable<void> = this.openedChange.pipe(
    filter(o => !o),
    map(() => {})
  );

  @Output() readonly selectionChange: EventEmitter<AplsSelectChange> = new EventEmitter<AplsSelectChange>();

  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  isMultiplo;

  constructor(
    private _viewportRuler: ViewportRuler,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone,
    private renderer: Renderer2,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    elementRef: ElementRef,
    @Optional() private _dir: Directionality,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Self()
    @Optional()
    public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    @Inject(APLS_SELECT_SCROLL_STRATEGY) private _scrollStrategyFactory,
    private translate: TranslateService
  ) {
    super(elementRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.tabIndex = parseInt(tabIndex) || 0;

    this.id = this.id;

    this._placeholder = this.translate.instant('label.selecione');
    this._tooltipLimpar = this.translate.instant('label.limpar');
    this._tooltipFechar = this.translate.instant('label.fechar');
    this._tooltipConfirmar = this.translate.instant('label.confirmar');
    this._tooltipTodos = this.translate.instant('label.marcar_desmarcar_todos');

    setTimeout(() => {
      this.listTooltip.close = this.tooltipFechar;
      this.listTooltip.all = this._tooltipTodos;
      this.listTooltip.reset = this._tooltipLimpar;
      this.listTooltip.confirm = this._tooltipConfirmar;
    }, 150);
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<AplsOption>(this.multiple, undefined, false);
    this.isMultiplo = this.multiple;
    this.stateChanges.next();
  }

  ngAfterContentInit() {
    this._initKeyManager();

    if (this.inputFilter) {
      this.inputFilter.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.keyCode === SHIFT) {
          if (this.listTooltip.close != 'W') {
            this.listTooltip.all = 'A';
            this.listTooltip.confirm = 'S';
            this.listTooltip.reset = 'R';
            this.listTooltip.close = 'W';

            if (this.tooltipAll) this.tooltipAll.show();
            if (this.tooltipClose) this.tooltipClose.show();
            if (this.tooltipReset) this.tooltipReset.show();
            if (this.tooltipConfirm) this.tooltipConfirm.show();
          }
        }

        if (event.shiftKey) {
          if (event.keyCode == S || event.keyCode == A || event.keyCode == R || event.keyCode == W) {
            this.restallTooltips();
          }

          switch (event.keyCode) {
            case A:
              event.preventDefault();
              this.checkAll();
              break;
            case R:
              event.preventDefault();
              this.reset();
              break;
            case S:
              event.preventDefault();
              this.backdropClose();
              break;
            case W:
              event.preventDefault();
              this.close();
              break;
          }
        }
      });

      this.inputFilter.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {
        if (event.key.toLocaleLowerCase() == 'shift') {
          if (this.listTooltip.close == 'W') {
            this.restallTooltips();
          }
        }

        if (!this.inputFilter.control) {
          if (event.keyCode !== ENTER && !event.shiftKey && !event.ctrlKey && !event.altKey) {
            this.options.forEach((option: AplsOption) => {
              option.isHidden = !this.filterCompareWith(option.value, (event.target as HTMLInputElement).value);
            });
          }
        }

        if (this.multiple) {
          this.getCheckboxs();
        } else {
          this._changeDetectorRef.markForCheck();
        }

        if (event.keyCode !== SPACE) {
          this._handleKeydown(event);
        }

        if (event.altKey) {
          event.preventDefault();
        }
      });

      if (!!this.inputFilter.control) {
        this.inputFilter.control.valueChanges.pipe(debounceTime(800)).subscribe(() => {
          this._changeDetectorRef.markForCheck();
        });
      }
    }

    this.options.changes.pipe(startWith(null), takeUntil(this._destroy)).subscribe(() => {
      this._resetOptions();
      this._initializeSelection();
    });

    if (this.multiple) {
      this.getCheckboxs();
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.disabled) {
      this.stateChanges.next();
    }

    /**
     * Rogério: 11/03/2019
     * Devido a uma solicitação, onde precisava tratar em tempo de execução se o componente
     * deve ser Select Simples ou Multi-Select, adicionei esta validação, se caso o for
     * alterado de multiplo de true para false, o componente será resetado, limpando
     * os valores.
     *
     * Obs: Aqui também, posso verificar a criação dos eventos de checkbox para item
     * pois, paliativamente, para que funcione com a troca em tempo de execução, é
     * necessário iniciar o componente como Multi e depois alterar para Único
     */
    if (!!this._selectionModel && this.isMultiplo != this._selectionModel['_multiple']) {
      this.reset();
      this.isMultiplo = this._selectionModel['_multiple'];
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.stateChanges.complete();
  }

  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  open(): void {
    if (!this.inputFilter && (!this.options || !this.options.length)) {
      return;
    }
    if (this.disabled || this._panelOpen) {
      return;
    }

    this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
    this._triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

    this._panelOpen = true;
    this._keyManager.withHorizontalOrientation(null);
    this._calculateOverlayPosition();
    this._highlightCorrectOption();
    this._changeDetectorRef.markForCheck();

    this._ngZone.onStable
      .asObservable()
      .pipe(take(1))
      .subscribe(() => {
        if (this._triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
          this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this._triggerFontSize}px`;
        }
      });

    if (this.multiple) {
      this.beforeChange = JSON.stringify(
        this._selectionModel.selected.map(record => {
          return { id: record.id };
        })
      );
      this.getCheckboxs();
    }
  }

  btnClose() {
    this.close();
  }

  /**
   * Função final que fecha a modal.
   */
  close(): void {
    if (this._panelOpen) {
      this._panelOpen = false;
      this._keyManager.withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');
      if (this.inputFilter) this.inputFilter.nativeElement.value = '';
      this._changeDetectorRef.markForCheck();
      this._onTouched();
      if (this.beforeChange) {
        var arrayBeforeChange = JSON.parse(this.beforeChange);
      }

      this.options.forEach((option: AplsOption) => {
        option.isHidden = false;
        if (arrayBeforeChange) {
          let optionCache = arrayBeforeChange.find(flag => flag.id === option.id);
          let optionSelected = this._selectionModel.selected.find(flag => flag.id === option.id);

          if (optionCache && !optionSelected) {
            this._selectionModel.select(option);
            option.select();
          }

          if (!optionCache && optionSelected) {
            this._selectionModel.deselect(option);
            option.deselect();
          }
        }
      });

      if (this.multiple) {
        this.getCheckboxs();
      }
    }
  }

  backdropClose() {
    if (this.multiple) {
      this.beforeChange = null;
      this._propagateChanges();
    }
    this.close();
  }

  btnReset() {
    this.reset();
  }

  reset() {
    this.options.forEach((option: AplsOption) => {
      if (this._selectionModel.isSelected(option) && !option.disabled) {
        this._selectionModel.deselect(option);
        option.deselect();
      }
      option.isHidden = false;
    });

    if (this.inputFilter && !this.inputFilter.control) {
      this.inputFilter.nativeElement.value = '';
    }

    if (this.multiple) {
      this.beforeChange = JSON.stringify(
        this._selectionModel.selected.map(record => {
          return { id: record.id };
        })
      );
    }

    this._propagateChanges();

    if (this.multiple) {
      this.getCheckboxs();
      this.focus();
    } else {
      this.close();
    }
  }

  restallTooltips() {
    if (this.tooltipAll) this.tooltipAll.hide();
    if (this.tooltipReset) this.tooltipReset.hide();
    if (this.tooltipConfirm) this.tooltipConfirm.hide();
    if (this.tooltipClose) this.tooltipClose.hide();
    setTimeout(() => {
      this.listTooltip.close = this.tooltipFechar;
      this.listTooltip.all = this._tooltipTodos;
      this.listTooltip.reset = this._tooltipLimpar;
      this.listTooltip.confirm = this._tooltipConfirmar;
      this.focus();
    }, 150);
  }

  getCheckboxs() {
    // Retorna quantos estão visiveis
    this.nShowing = this.options.reduce((prev, current) => (coerceBooleanProperty(current.isHidden) ? prev : ++prev), 0);
    this.nRegistred = this._selectionModel.selected.reduce((prev, current) => (coerceBooleanProperty(current.isHidden) ? prev : ++prev), 0);
    let exception = this.nRegistred == 0 ? '' : 'indeterminate';
    this.checkallStates = this.nRegistred == this.nShowing ? 'checked' : exception;
    this.focus();

    this._changeDetectorRef.markForCheck();
  }

  checkAll() {
    // Retorna quantos estão visiveis
    this.nShowing = this.options.reduce((prev, current) => (!!current.isHidden ? prev : ++prev), 0);
    this.nRegistred = this._selectionModel.selected.reduce((prev, current) => (coerceBooleanProperty(current.isHidden) ? prev : ++prev), 0);

    this.options.forEach((option: AplsOption) => {
      // Se não estiver oculto ou desabilitado pode fazer a marcacao total ou desmarcacao total
      if (!coerceBooleanProperty(option.isHidden) && !option.disabled) {
        if (this.nRegistred == this.nShowing) {
          this._selectionModel.deselect(option);
          option.deselect();
        } else {
          this._selectionModel.select(option);
          option.select();
        }
      }
    });

    this.getCheckboxs();
  }

  writeValue(value: any): void {
    if (this.options) {
      this._setSelectionByValue(value);
    } else {
      this._valueWithOption = value;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  get panelOpen(): boolean {
    return this._panelOpen;
  }

  get selected(): AplsOption | AplsOption[] {
    return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
  }

  get triggerValue(): string {
    if (this.empty) {
      return '';
    }

    if (this._multiple) {
      const selectedOptions = this._selectionModel.selected.map(option => option.viewValue);

      if (this._isRtl()) {
        selectedOptions.reverse();
      }

      return selectedOptions.join(', ');
    }

    return this._selectionModel.selected[0].viewValue;
  }

  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  private _handleClosedKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
    const isOpenKey = keyCode === ENTER || keyCode === SPACE;

    if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
      event.preventDefault();
      this.open();
    } else if (!this.multiple) {
      this._keyManager.onKeydown(event);
    }
  }

  private _handleOpenKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
    const manager = this._keyManager;

    if (keyCode === HOME || keyCode === END) {
      event.preventDefault();
      keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
    } else if (isArrowKey && event.altKey) {
      // Close the select on ALT + arrow key to match the native <select>
      event.preventDefault();
      this.close();
    } else if ((keyCode === ENTER || keyCode === SPACE) && manager.activeItem) {
      event.preventDefault();
      manager.activeItem._selectViaInteraction();
    } else {
      const previouslyFocusedIndex = manager.activeItemIndex;

      manager.onKeydown(event);

      if (this._multiple && isArrowKey && event.shiftKey && manager.activeItem && manager.activeItemIndex !== previouslyFocusedIndex) {
        manager.activeItem._selectViaInteraction();
      }
    }
  }

  _onPanelDone(): void {
    if (this.panelOpen) {
      this._scrollTop = 0;
      this.openedChange.emit(true);
    } else {
      this.openedChange.emit(false);
      this._panelDoneAnimating = false;
      this.overlayDir.offsetX = 0;
      this._changeDetectorRef.markForCheck();
    }
  }

  _onFadeInDone(): void {
    this._panelDoneAnimating = this.panelOpen;
    this.focus();
    this._changeDetectorRef.markForCheck();
  }

  _onFocus() {
    if (!this.disabled) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  _onBlur() {
    this.focused = false;

    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  _onAttached(): void {
    this.overlayDir.positionChange.pipe(take(1)).subscribe(() => {
      this._changeDetectorRef.detectChanges();
      this._calculateOverlayOffsetX();
    });
  }
  get empty(): boolean {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  private _initializeSelection(): void {
    Promise.resolve().then(() => {
      this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
    });
  }

  private _setSelectionByValue(value: any | any[], isUserInput = false): void {
    if (this.multiple && value) {
      if (!Array.isArray(value)) {
        this._clearSelection();

        const correspondingOption = this._selectValue(value, isUserInput);

        this._valueWithOption = null;
        if (correspondingOption && this._keyManager) {
          this._keyManager.setActiveItem(correspondingOption);
        } else {
          this._valueWithOption = value;
        }
      } else {
        this._clearSelection();
        value.forEach((currentValue: any) => {
          let correspondingOption = this._selectValue(currentValue, isUserInput);
          if (!correspondingOption) {
            if (!this._valueWithOption) {
              this._valueWithOption = [];
            }

            this._valueWithOption.push(currentValue);
          } else {
            this._valueWithOption = null;
          }

          return correspondingOption;
        });
        this._sortValues();
      }
    } else {
      this._clearSelection();

      const correspondingOption = this._selectValue(value, isUserInput);

      this._valueWithOption = null;
      if (correspondingOption && this._keyManager) {
        this._keyManager.setActiveItem(correspondingOption);
      } else {
        this._valueWithOption = value;
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  private _sortSelectValue(value: any): void {
    const correspondingOption = this.options.find((option: AplsOption) => option.value != null && this._compareWith(option.value, value));

    if (correspondingOption) {
      this._selectionModel.select(correspondingOption);
      this.stateChanges.next();
    }
  }

  private _selectValue(value: any, isUserInput = false): AplsOption | undefined {
    const correspondingOption = this.options.find((option: AplsOption) => {
      try {
        return option.value != null && this._compareWith(option.value, value);
      } catch (error) {
        if (!environment.production) {
          console.warn(error);
        }
        return false;
      }
    });

    if (correspondingOption) {
      isUserInput ? correspondingOption._selectViaInteraction() : correspondingOption.select();
      this._selectionModel.select(correspondingOption);
      this.stateChanges.next();
    }

    return correspondingOption;
  }

  private _clearSelection(skip?: AplsOption): void {
    this._selectionModel.clear();
    this.options.forEach(option => {
      if (option !== skip) {
        option.deselect();
      }
    });
    this.stateChanges.next();
  }

  private _initKeyManager() {
    this._keyManager = new ActiveDescendantKeyManager<AplsOption>(this.options)
      .withTypeAhead()
      .withVerticalOrientation()
      .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');

    this._keyManager.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => {
      this.focus();
      this.close();
    });

    this._keyManager.change.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this._panelOpen && this.panel) {
        this._scrollActiveOptionIntoView();
      } else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
        this._keyManager.activeItem._selectViaInteraction();
      }
    });
  }

  private _resetOptions(): void {
    const changedOrDestroyed = merge(this.options.changes, this._destroy);

    this.optionSelectionChanges
      .pipe(
        takeUntil(changedOrDestroyed),
        filter((event: any) => event.isUserInput)
      )
      .subscribe(event => {
        this._onSelect(event.source);

        if (!this.multiple && this._panelOpen) {
          this.close();
          this.focus();
        }
      });

    merge(...this.options.map(option => option._stateChanges))
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
      });

    this._setOptionIds();
  }

  private _onSelect(option: AplsOption): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (this.multiple) {
      this._selectionModel.toggle(option);
      this.stateChanges.next();
      wasSelected ? option.deselect() : option.select();
      this._keyManager.setActiveItem(option);
      this._sortValues();

      this.focus();
      this.getCheckboxs();
      this._changeDetectorRef.markForCheck();
    } else {
      this._clearSelection(option.value == null ? undefined : option);

      if (option.value == null) {
        this._propagateChanges(option.value);
      } else {
        this._selectionModel.select(option);
        this.stateChanges.next();
      }

      if (wasSelected !== this._selectionModel.isSelected(option)) {
        this._propagateChanges();
      }
    }
  }

  private _sortValues(): void {
    if (this._multiple) {
      this._selectionModel.clear();

      this.options.forEach(option => {
        if (option.selected) {
          this._selectionModel.select(option);
        }
      });
      this.stateChanges.next();
    }
  }

  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = null;

    if (this.multiple) {
      if (this.selected && (this.selected as any[]).length > 0) valueToEmit = (this.selected as AplsOption[]).map(option => option.value);
    } else {
      valueToEmit = this.selected ? (this.selected as AplsOption).value : fallbackValue;
    }

    this._value = valueToEmit;
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this.selectionChange.emit(new AplsSelectChange(this, valueToEmit));
    this._changeDetectorRef.markForCheck();
  }

  private _setOptionIds() {
    this._optionIds = this.options.map(option => option.id).join(' ');
  }

  private _highlightCorrectOption(): void {
    if (this._keyManager) {
      if (this.empty) {
        this._keyManager.setFirstItemActive();
      } else {
        this._keyManager.setActiveItem(this._selectionModel.selected[0]);
      }
    }
  }

  private _scrollActiveOptionIntoView(): void {
    const activeOptionIndex = this._keyManager.activeItemIndex || 0;
    const labelCount = _countGroupLabelsBeforeOption(activeOptionIndex, this.options, this.optionGroups);
  }

  focus(): void {
    if (this.inputFilter) {
      Promise.resolve().then(() => {
        this.inputFilter.nativeElement.focus();
      });
    }
  }

  private _getOptionIndex(option: AplsOption): number | undefined {
    return this.options.reduce((result: number, current: AplsOption, index: number) => {
      return result === undefined ? (option === current ? index : undefined) : result;
    }, undefined);
  }

  private _calculateOverlayPosition(): void {
    const itemHeight = this._getItemHeight();
    const items = this._getItemCount();
    const panelHeight = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
    const scrollContainerHeight = items * itemHeight;

    const maxScroll = scrollContainerHeight - panelHeight;

    let selectedOptionOffset = this.empty ? 0 : this._getOptionIndex(this._selectionModel.selected[0])!;

    selectedOptionOffset += _countGroupLabelsBeforeOption(selectedOptionOffset, this.options, this.optionGroups);

    const scrollBuffer = panelHeight / 2;
    this._scrollTop = this._calculateOverlayScroll(selectedOptionOffset, scrollBuffer, maxScroll);
    this._offsetY = this._calculateOverlayOffsetY(selectedOptionOffset, scrollBuffer, maxScroll);

    this._checkOverlayWithinViewport(maxScroll);
  }

  _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number {
    const itemHeight = this._getItemHeight();
    const optionOffsetFromScrollTop = itemHeight * selectedIndex;
    const halfOptionHeight = itemHeight / 2;

    const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;
    return Math.min(Math.max(0, optimalScrollPosition), maxScroll);
  }

  get _ariaLabel(): string | null {
    return this.ariaLabelledby ? null : this.ariaLabel || this.placeholder;
  }

  _getAriaActiveDescendant(): string | null {
    if (this.panelOpen && this._keyManager && this._keyManager.activeItem) {
      return this._keyManager.activeItem.id;
    }

    return null;
  }

  private _calculateOverlayOffsetX(): void {
    const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
    const viewportSize = this._viewportRuler.getViewportSize();
    const isRtl = this._isRtl();
    const paddingWidth = this.multiple ? SELECT_MULTIPLE_PANEL_PADDING_X + SELECT_PANEL_PADDING_X : SELECT_PANEL_PADDING_X * 2;
    let offsetX: number;

    if (this.multiple) {
      offsetX = SELECT_MULTIPLE_PANEL_PADDING_X;
    } else {
      let selected = this._selectionModel.selected[0] || this.options.first;
      offsetX = selected && selected.group ? SELECT_PANEL_INDENT_PADDING_X : SELECT_PANEL_PADDING_X;
    }

    if (!isRtl) {
      offsetX *= -1;
    }

    const leftOverflow = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
    const rightOverflow = overlayRect.right + offsetX - viewportSize.width + (isRtl ? 0 : paddingWidth);

    if (leftOverflow > 0) {
      offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    } else if (rightOverflow > 0) {
      offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    }
  }

  private _calculateOverlayOffsetY(selectedIndex: number, scrollBuffer: number, maxScroll: number): number {
    const itemHeight = this._getItemHeight();
    const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
    const maxOptionsDisplayed = Math.floor(SELECT_PANEL_MAX_HEIGHT / itemHeight);
    let optionOffsetFromPanelTop: number;

    if (this._disableOptionCentering) {
      return 0;
    }

    if (this._scrollTop === 0) {
      optionOffsetFromPanelTop = selectedIndex * itemHeight;
    } else if (this._scrollTop === maxScroll) {
      const firstDisplayedIndex = this._getItemCount() - maxOptionsDisplayed;
      const selectedDisplayIndex = selectedIndex - firstDisplayedIndex;

      let partialItemHeight = itemHeight - ((this._getItemCount() * itemHeight - SELECT_PANEL_MAX_HEIGHT) % itemHeight);

      optionOffsetFromPanelTop = selectedDisplayIndex * itemHeight + partialItemHeight;
    } else {
      optionOffsetFromPanelTop = scrollBuffer - itemHeight / 2;
    }

    return Math.round(optionOffsetFromPanelTop * -1 - optionHeightAdjustment);
  }

  private _checkOverlayWithinViewport(maxScroll: number): void {
    const itemHeight = this._getItemHeight();
    const viewportSize = this._viewportRuler.getViewportSize();

    const topSpaceAvailable = this._triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
    const bottomSpaceAvailable = viewportSize.height - this._triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;

    const panelHeightTop = Math.abs(this._offsetY);
    const totalPanelHeight = Math.min(this._getItemCount() * itemHeight, SELECT_PANEL_MAX_HEIGHT);
    const panelHeightBottom = totalPanelHeight - panelHeightTop - this._triggerRect.height;

    if (panelHeightBottom > bottomSpaceAvailable) {
      this._adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
    } else if (panelHeightTop > topSpaceAvailable) {
      this._adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
    } else {
      this._transformOrigin = this._getOriginBasedOnOption();
    }
  }

  private _adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
    const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);

    this._scrollTop -= distanceBelowViewport;
    this._offsetY -= distanceBelowViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    if (this._scrollTop <= 0) {
      this._scrollTop = 0;
      this._offsetY = 0;
      this._transformOrigin = `50% bottom 0px`;
    }
  }

  private _adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number, maxScroll: number) {
    const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);

    this._scrollTop += distanceAboveViewport;
    this._offsetY += distanceAboveViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    if (this._scrollTop >= maxScroll) {
      this._scrollTop = maxScroll;
      this._offsetY = 0;
      this._transformOrigin = `50% top 0px`;
      return;
    }
  }

  private _getOriginBasedOnOption(): string {
    const itemHeight = this._getItemHeight();
    const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
    const originY = Math.abs(this._offsetY) - optionHeightAdjustment + itemHeight / 2;
    return `50% ${originY}px 0px`;
  }

  private _getItemCount(): number {
    return this.options.length + this.optionGroups.length;
  }

  private _getItemHeight(): number {
    return this._triggerFontSize * SELECT_ITEM_HEIGHT_EM;
  }

  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  onContainerClick() {
    this.focus();
    this.open();
  }

  get shouldLabelFloat(): boolean {
    return this._panelOpen || !this.empty;
  }
}
