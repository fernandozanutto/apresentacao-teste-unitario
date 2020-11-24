/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { AnimationEvent } from '@angular/animations';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE } from '@angular/cdk/keycodes';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState
} from '@angular/cdk/layout';
import {
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  ScrollDispatcher,
  ScrollStrategy,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { take, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { aplsTooltipAnimations } from './tooltip-animations';

export type TooltipPosition =
  | 'left'
  | 'right'
  | 'above'
  | 'below'
  | 'before'
  | 'after';

export const SCROLL_THROTTLE_MS = 20;

export const TOOLTIP_PANEL_CLASS = 'apls-tooltip-panel';

export function getAplsTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

export const APLS_TOOLTIP_SCROLL_STRATEGY = new InjectionToken<
  () => ScrollStrategy
>('apls-tooltip-scroll-strategy');

export function APLS_TOOLTIP_SCROLL_STRATEGY_FACTORY(
  overlay: Overlay
): () => ScrollStrategy {
  return () =>
    overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}

export const APLS_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: APLS_TOOLTIP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APLS_TOOLTIP_SCROLL_STRATEGY_FACTORY
};

export interface AplsTooltipDefaultOptions {
  showDelay: number;
  hideDelay: number;
  touchendHideDelay: number;
}

export const APLS_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<
  AplsTooltipDefaultOptions
>('apls-tooltip-default-options', {
  providedIn: 'root',
  factory: APLS_TOOLTIP_DEFAULT_OPTIONS_FACTORY
});

export function APLS_TOOLTIP_DEFAULT_OPTIONS_FACTORY(): AplsTooltipDefaultOptions {
  return {
    showDelay: 0,
    hideDelay: 0,
    touchendHideDelay: 1500
  };
}

@Directive({
  selector: '[aplsTooltip]',
  exportAs: 'aplsTooltip',
  host: {
    '(longpress)': 'show()',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': '_handleTouchend()'
  }
})
export class AplsTooltip implements OnDestroy {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: TooltipComponent | null;

  private _portal: ComponentPortal<TooltipComponent>;
  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;
  private _tooltipClass:
    | string
    | string[]
    | Set<string>
    | { [key: string]: any };

  @Input('aplsTooltipPosition')
  get position(): TooltipPosition {
    return this._position;
  }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      if (this._overlayRef) {
        this._updatePosition();

        if (this._tooltipInstance) {
          this._tooltipInstance!.show(0);
        }

        this._overlayRef.updatePosition();
      }
    }
  }

  @Input('aplsTooltipDisabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);

    if (this._disabled) {
      this.hide(0);
    }
  }

  @Input('aplsTooltipShowDelay') showDelay = this._defaultOptions.showDelay;

  @Input('aplsTooltipHideDelay') hideDelay = this._defaultOptions.hideDelay;

  private _message = '';

  @Input('aplsTooltip')
  get message() {
    return this._message;
  }
  set message(value: string) {
    this._ariaDescriber.removeDescription(
      this._elementRef.nativeElement,
      this._message
    );

    this._message = value != null ? `${value}`.trim() : '';

    if (!this._message && this._isTooltipVisible()) {
      this.hide(0);
    } else {
      this._updateTooltipMessage();
      this._ariaDescriber.describe(
        this._elementRef.nativeElement,
        this.message
      );
    }
  }

  @Input('aplsTooltipClass')
  get tooltipClass() {
    return this._tooltipClass;
  }
  set tooltipClass(
    value: string | string[] | Set<string> | { [key: string]: any }
  ) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  private _manualListeners = new Map<string, Function>();

  private readonly _destroyed = new Subject<void>();

  constructor(
    private _overlay: Overlay,
    private _elementRef: ElementRef,
    private _scrollDispatcher: ScrollDispatcher,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _platform: Platform,
    private _ariaDescriber: AriaDescriber,
    private _focusMonitor: FocusMonitor,
    @Inject(APLS_TOOLTIP_SCROLL_STRATEGY) private _scrollStrategy: any,
    @Optional() private _dir: Directionality,
    @Optional()
    @Inject(APLS_TOOLTIP_DEFAULT_OPTIONS)
    private _defaultOptions: AplsTooltipDefaultOptions
  ) {
    const element: HTMLElement = _elementRef.nativeElement;

    if (!_platform.IOS) {
      this._manualListeners.set('mouseenter', () => this.show());
      this._manualListeners.set('mouseleave', () => this.hide());

      this._manualListeners.forEach((listener, event) =>
        _elementRef.nativeElement.addEventListener(event, listener)
      );
    } else if (
      element.nodeName === 'INPUT' ||
      element.nodeName === 'TEXTAREA'
    ) {
      element.style.webkitUserSelect = element.style.userSelect = '';
    }

    _focusMonitor
      .monitor(element)
      .pipe(takeUntil(this._destroyed))
      .subscribe(origin => {
        if (!origin) {
          _ngZone.run(() => this.hide(0));
        } else if (origin !== 'program') {
          _ngZone.run(() => this.show());
        }
      });
  }

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._tooltipInstance = null;
    }

    if (!this._platform.IOS) {
      this._manualListeners.forEach((listener, event) =>
        this._elementRef.nativeElement.removeEventListener(event, listener)
      );

      this._manualListeners.clear();
    }

    this._destroyed.next();
    this._destroyed.complete();

    this._ariaDescriber.removeDescription(
      this._elementRef.nativeElement,
      this.message
    );
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  show(delay: number = this.showDelay): void {
    if (this.disabled || !this.message) {
      return;
    }

    const overlayRef = this._createOverlay();

    this._detach();
    this._portal =
      this._portal ||
      new ComponentPortal(TooltipComponent, this._viewContainerRef);
    this._tooltipInstance = overlayRef.attach(this._portal).instance;
    this._tooltipInstance
      .afterHidden()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());
    this._setTooltipClass(this._tooltipClass);
    this._updateTooltipMessage();
    this._tooltipInstance!.show(delay);
  }

  hide(delay: number = this.hideDelay): void {
    if (this._tooltipInstance) {
      this._tooltipInstance.hide(delay);
    }
  }

  toggle(): void {
    this._isTooltipVisible() ? this.hide() : this.show();
  }

  _isTooltipVisible(): boolean {
    return !!this._tooltipInstance && this._tooltipInstance.isVisible();
  }

  _handleKeydown(e: KeyboardEvent) {
    if (this._isTooltipVisible() && e.keyCode === ESCAPE) {
      e.stopPropagation();
      this.hide(0);
    }
  }

  _handleTouchend() {
    this.hide(this._defaultOptions.touchendHideDelay);
  }

  private _createOverlay(): OverlayRef {
    if (this._overlayRef) {
      return this._overlayRef;
    }

    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withTransformOriginOn('.apls-tooltip')
      .withFlexibleDimensions(false)
      .withViewportMargin(8);

    const scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(
      this._elementRef
    );

    strategy.withScrollableContainers(scrollableAncestors);

    strategy.positionChanges
      .pipe(takeUntil(this._destroyed))
      .subscribe(change => {
        if (this._tooltipInstance) {
          if (
            change.scrollableViewProperties.isOverlayClipped &&
            this._tooltipInstance.isVisible()
          ) {
            this._ngZone.run(() => this.hide(0));
          }
        }
      });

    this._overlayRef = this._overlay.create({
      direction: this._dir,
      positionStrategy: strategy,
      panelClass: TOOLTIP_PANEL_CLASS,
      scrollStrategy: this._scrollStrategy()
    });

    this._updatePosition();

    this._overlayRef
      .detachments()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    return this._overlayRef;
  }

  private _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._tooltipInstance = null;
  }

  private _updatePosition() {
    const position = this._overlayRef!.getConfig()
      .positionStrategy as FlexibleConnectedPositionStrategy;
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    position.withPositions([
      { ...origin.main, ...overlay.main },
      { ...origin.fallback, ...overlay.fallback }
    ]);
  }

  _getOrigin(): {
    main: OriginConnectionPosition;
    fallback: OriginConnectionPosition;
  } {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let originPosition: OriginConnectionPosition;

    if (position == 'above' || position == 'below') {
      originPosition = {
        originX: 'center',
        originY: position == 'above' ? 'top' : 'bottom'
      };
    } else if (
      position == 'before' ||
      (position == 'left' && isLtr) ||
      (position == 'right' && !isLtr)
    ) {
      originPosition = { originX: 'start', originY: 'center' };
    } else if (
      position == 'after' ||
      (position == 'right' && isLtr) ||
      (position == 'left' && !isLtr)
    ) {
      originPosition = { originX: 'end', originY: 'center' };
    } else {
      throw getAplsTooltipInvalidPositionError(position);
    }

    const { x, y } = this._invertPosition(
      originPosition.originX,
      originPosition.originY
    );

    return {
      main: originPosition,
      fallback: { originX: x, originY: y }
    };
  }

  _getOverlayPosition(): {
    main: OverlayConnectionPosition;
    fallback: OverlayConnectionPosition;
  } {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let overlayPosition: OverlayConnectionPosition;

    if (position == 'above') {
      overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
    } else if (position == 'below') {
      overlayPosition = { overlayX: 'center', overlayY: 'top' };
    } else if (
      position == 'before' ||
      (position == 'left' && isLtr) ||
      (position == 'right' && !isLtr)
    ) {
      overlayPosition = { overlayX: 'end', overlayY: 'center' };
    } else if (
      position == 'after' ||
      (position == 'right' && isLtr) ||
      (position == 'left' && !isLtr)
    ) {
      overlayPosition = { overlayX: 'start', overlayY: 'center' };
    } else {
      throw getAplsTooltipInvalidPositionError(position);
    }

    const { x, y } = this._invertPosition(
      overlayPosition.overlayX,
      overlayPosition.overlayY
    );

    return {
      main: overlayPosition,
      fallback: { overlayX: x, overlayY: y }
    };
  }

  private _updateTooltipMessage() {
    if (this._tooltipInstance) {
      this._tooltipInstance.message = this.message;
      this._tooltipInstance._markForCheck();

      this._ngZone.onMicrotaskEmpty
        .asObservable()
        .pipe(take(1), takeUntil(this._destroyed))
        .subscribe(() => {
          if (this._tooltipInstance) {
            this._overlayRef!.updatePosition();
          }
        });
    }
  }

  private _setTooltipClass(
    tooltipClass: string | string[] | Set<string> | { [key: string]: any }
  ) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipClass = tooltipClass;
      this._tooltipInstance._markForCheck();
    }
  }

  private _invertPosition(
    x: HorizontalConnectionPos,
    y: VerticalConnectionPos
  ) {
    if (this.position === 'above' || this.position === 'below') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return { x, y };
  }
}

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

@Component({
  selector: 'apls-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [aplsTooltipAnimations.tooltipState],
  host: {
    '[style.zoom]': '_visibility === "visible" ? 1 : null',
    '(body:click)': 'this._handleBodyInteraction()',
    'aria-hidden': 'true'
  }
})
export class TooltipComponent {
  message: string;

  tooltipClass: string | string[] | Set<string> | { [key: string]: any };

  _showTimeoutId: any;

  _hideTimeoutId: any;

  _visibility: TooltipVisibility = 'initial';

  private _closeOnInteraction: boolean = false;

  private readonly _onHide: Subject<any> = new Subject();

  _isHandset: Observable<BreakpointState> = this._breakpointObserver.observe(
    Breakpoints.Handset
  );

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _breakpointObserver: BreakpointObserver
  ) {}

  show(delay: number): void {
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
    }

    this._closeOnInteraction = true;
    this._showTimeoutId = setTimeout(() => {
      this._visibility = 'visible';

      this._markForCheck();
    }, delay);
  }

  hide(delay: number): void {
    if (this._showTimeoutId) {
      clearTimeout(this._showTimeoutId);
    }

    this._hideTimeoutId = setTimeout(() => {
      this._visibility = 'hidden';

      this._markForCheck();
    }, delay);
  }

  afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  _animationStart() {
    this._closeOnInteraction = false;
  }

  _animationDone(event: AnimationEvent): void {
    const toState = event.toState as TooltipVisibility;

    if (toState === 'hidden' && !this.isVisible()) {
      this._onHide.next();
    }

    if (toState === 'visible' || toState === 'hidden') {
      this._closeOnInteraction = true;
    }
  }

  _handleBodyInteraction(): void {
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }

  _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
