import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE, UP_ARROW} from '@angular/cdk/keycodes';
import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {take, filter} from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  Optional,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import {DateAdapter} from '../core/datetime/date-adapter';
import {AplsDialog, AplsDialogRef} from '../dialog';

import {merge, Subject, Subscription} from 'rxjs';
import {createMissingDateImplError} from './datepicker-errors';
import {AplsDatepickerInput} from './datepicker-input';
import {AplsCalendar} from './calendar';
import {aplsDatepickerAnimations} from './datepicker-animations';

/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/** Injection token that determines the scroll handling while the calendar is open. */
export const APLS_DATEPICKER_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('apls-datepicker-scroll-strategy');

/** @docs-private */
export function APLS_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const APLS_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: APLS_DATEPICKER_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APLS_DATEPICKER_SCROLL_STRATEGY_FACTORY,
};

// Boilerplate for applying mixins to AplsDatepickerContent.
/** @docs-private */
export class AplsDatepickerContentBase {
  color: String;
  disabled: boolean = false;
  constructor(public _elementRef: ElementRef) { }
}

/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * AplsCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
  
  selector: 'apls-datepicker-content',
  templateUrl: 'datepicker-content.html',
  styleUrls: ['datepicker-content.scss'],
  host: {
    'class': 'apls-datepicker-content',
    '[@transformPanel]': '"enter"',
    '[class.apls-datepicker-content-touch]': 'datepicker.touchUi',
  },
  animations: [
    aplsDatepickerAnimations.transformPanel,
    aplsDatepickerAnimations.fadeInCalendar,
  ],
  exportAs: 'aplsDatepickerContent',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['color'],
})
export class AplsDatepickerContent<D> extends AplsDatepickerContentBase
  implements AfterViewInit {

  /** Reference to the internal calendar component. */
  @ViewChild(AplsCalendar) _calendar: AplsCalendar<D>;

  /** Reference to the datepicker that created the overlay. */
  datepicker: AplsDatepicker<D>;

  /** Whether the datepicker is above or below the input. */
  _isAbove: boolean;

  constructor(elementRef: ElementRef) {
    super(elementRef);
  }

  ngAfterViewInit() {
    this._calendar.focusActiveCell();
  }
}

/** Componente responsável por gerenciar o popup/dialog do datepicker. */
@Component({
  selector: 'apls-datepicker',
  template: '',
  exportAs: 'aplsDatepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AplsDatepicker<D> implements OnDestroy {
  /** Uma entrada indicando o tipo do componente de cabeçalho customizado para o calendário, se configurado. */
  @Input() calendarHeaderComponent: ComponentType<any>;

  /** A data para abrir o calendário inicialmente. */
  @Input()
  get startAt(): D | null {
    return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
  }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _startAt: D | null;

  /** O estado de que o calendário deve começar. */
  @Input() startView: 'month' | 'year' = 'month';

  @Input()
  get color() {
    return this._color;
  }
  set color(value) {
    this._color = value;
  }
  _color;

  @Input()
  get touchUi(): boolean { return this._touchUi; }
  set touchUi(value: boolean) {
    this._touchUi = coerceBooleanProperty(value);
  }
  private _touchUi = false;

  @Input()
  get disabled(): boolean {
    return this._disabled === undefined && this._datepickerInput ?
        this._datepickerInput.disabled : !!this._disabled;
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._disabledChange.next(newValue);
    }
  }
  private _disabled: boolean;

  /**
   * Emite ano selecionado na visualização multianual.
   * Isso não implica uma alteração na data selecionada.
   */
  @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

  /**
   * Emite o mês selecionado na visualização do ano.
   * Isso não implica uma mudança na data selecionada.
   */
  @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

  @Input() panelClass: string | string[];

  /** Emite quando o datepicker foi aberto. */
  @Output('opened') openedStream: EventEmitter<void> = new EventEmitter<void>();

  /** Emite quando o datepicker foi fechado. */
  @Output('closed') closedStream: EventEmitter<void> = new EventEmitter<void>();


  @Input()
  get opened(): boolean { return this._opened; }
  set opened(value: boolean) { value ? this.open() : this.close(); }
  private _opened = false;

  id: string = `apls-datepicker-${datepickerUid++}`;

  get _selected(): D | null { return this._validSelected; }
  set _selected(value: D | null) { this._validSelected = value; }
  private _validSelected: D | null = null;

  get _minDate(): D | null {
    return this._datepickerInput && this._datepickerInput.min;
  }

  get _maxDate(): D | null {
    return this._datepickerInput && this._datepickerInput.max;
  }

  get _dateFilter(): (date: D | null) => boolean {
    return this._datepickerInput && this._datepickerInput._dateFilter;
  }

  _popupRef: OverlayRef;

  private _dialogRef: AplsDialogRef<AplsDatepickerContent<D>> | null;

  private _calendarPortal: ComponentPortal<AplsDatepickerContent<D>>;

  private _popupComponentRef: ComponentRef<AplsDatepickerContent<D>> | null;

  private _focusedElementBeforeOpen: HTMLElement | null = null;

  private _inputSubscription = Subscription.EMPTY;

  _datepickerInput: AplsDatepickerInput<D>;

  readonly _disabledChange = new Subject<boolean>();

  readonly _selectedChanged = new Subject<D>();

  constructor(private _dialog: AplsDialog,
              private _overlay: Overlay,
              private _ngZone: NgZone,
              private _viewContainerRef: ViewContainerRef,
              @Inject(APLS_DATEPICKER_SCROLL_STRATEGY) private _scrollStrategy,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() private _dir: Directionality,
              @Optional() @Inject(DOCUMENT) private _document: any) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
  }

  ngOnDestroy() {
    this.close();
    this._inputSubscription.unsubscribe();
    this._disabledChange.complete();

    if (this._popupRef) {
      this._popupRef.dispose();
      this._popupComponentRef = null;
    }
  }

  /** Selects the given date */
  _select(date: D): void {
    let oldValue = this._selected;
    this._selected = date;
    if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
      this._selectedChanged.next(date);
    }
  }

  /** Emits the selected year in multiyear view */
  _selectYear(normalizedYear: D): void {
    this.yearSelected.emit(normalizedYear);
  }

  /** Emits selected month in year view */
  _selectMonth(normalizedMonth: D): void {
    this.monthSelected.emit(normalizedMonth);
  }

  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   */
  _registerInput(input: AplsDatepickerInput<D>): void {
    if (this._datepickerInput) {
      throw Error('A AplsDatepicker can only be associated with a single input.');
    }
    this._datepickerInput = input;
    this._inputSubscription =
        this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
  }

  /** Open the calendar. */
  open(): void {
    if (this._opened || this.disabled) {
      return;
    }
    if (!this._datepickerInput) {
      throw Error('Attempted to open an AplsDatepicker with no associated input.');
    }
    if (this._document) {
      this._focusedElementBeforeOpen = this._document.activeElement;
    }

    this.touchUi ? this._openAsDialog() : this._openAsPopup();
    this._opened = true;
    this.openedStream.emit();
  }

  /** Close the calendar. */
  close(): void {
    if (!this._opened) {
      return;
    }
    if (this._popupRef && this._popupRef.hasAttached()) {
      this._popupRef.detach();
    }
    if (this._dialogRef) {
      this._dialogRef.close();
      this._dialogRef = null;
    }
    if (this._calendarPortal && this._calendarPortal.isAttached) {
      this._calendarPortal.detach();
    }

    const completeClose = () => {
      // The `_opened` could've been reset already if
      // we got two events in quick succession.
      if (this._opened) {
        this._opened = false;
        this.closedStream.emit();
        this._focusedElementBeforeOpen = null;
      }
    };

    if (this._focusedElementBeforeOpen &&
      typeof this._focusedElementBeforeOpen.focus === 'function') {
      // Because IE moves focus asynchronously, we can't count on it being restored before we've
      // marked the datepicker as closed. If the event fires out of sequence and the element that
      // we're refocusing opens the datepicker on focus, the user could be stuck with not being
      // able to close the calendar at all. We work around it by making the logic, that marks
      // the datepicker as closed, async as well.
      this._focusedElementBeforeOpen.focus();
      setTimeout(completeClose);
    } else {
      completeClose();
    }
  }

  /** Open the calendar as a dialog. */
  private _openAsDialog(): void {
    this._dialogRef = this._dialog.open<AplsDatepickerContent<D>>(AplsDatepickerContent, {
      direction: this._dir ? this._dir.value : 'ltr',
      viewContainerRef: this._viewContainerRef,
      panelClass: 'apls-datepicker-dialog',
    });

    this._dialogRef.afterClosed().subscribe(() => this.close());
    this._dialogRef.componentInstance.datepicker = this;
    this._setColor();
  }

  /** Open the calendar as a popup. */
  private _openAsPopup(): void {
    if (!this._calendarPortal) {
      this._calendarPortal = new ComponentPortal<AplsDatepickerContent<D>>(AplsDatepickerContent,
                                                                          this._viewContainerRef);
    }

    if (!this._popupRef) {
      this._createPopup();
    }

    if (!this._popupRef.hasAttached()) {
      this._popupComponentRef = this._popupRef.attach(this._calendarPortal);
      this._popupComponentRef.instance.datepicker = this;
      this._setColor();

      // Update the position once the calendar has rendered.
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
        this._popupRef.updatePosition();
      });
    }
  }

  /** Create the popup. */
  private _createPopup(): void {
    const overlayConfig = new OverlayConfig({
      positionStrategy: this._createPopupPositionStrategy(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      direction: this._dir,
      scrollStrategy: this._scrollStrategy(),
      panelClass: 'apls-datepicker-popup',
    });

    this._popupRef = this._overlay.create(overlayConfig);

    merge(
      this._popupRef.backdropClick(),
      this._popupRef.detachments(),
      this._popupRef.keydownEvents().pipe(filter(event => {
        // Closing on alt + up is only valid when there's an input associated with the datepicker.
        return event.keyCode === ESCAPE ||
               (this._datepickerInput && event.altKey && event.keyCode === UP_ARROW);
      }))
    ).subscribe(() => this.close());
  }

  /** Create the popup PositionStrategy. */
  private _createPopupPositionStrategy(): PositionStrategy {
    return this._overlay.position()
      .flexibleConnectedTo(this._datepickerInput.getConnectedOverlayOrigin())
      .withTransformOriginOn('.apls-datepicker-content')
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withPush(false)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom'
        }
      ]);
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }

  /** Passes the current theme color along to the calendar overlay. */
  private _setColor(): void {
    const color = this.color;
    if (this._popupComponentRef) {
      this._popupComponentRef.instance.color = color;
    }
    if (this._dialogRef) {
      this._dialogRef.componentInstance.color = color;
    }
  }
}
