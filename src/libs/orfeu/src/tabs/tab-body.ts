/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {
  Component,
  Input,
  Inject,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  ElementRef,
  Directive,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ComponentFactoryResolver,
  ViewContainerRef,
  forwardRef,
  ViewChild
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import {
  TemplatePortal,
  CdkPortalOutlet,
  PortalHostDirective
} from '@angular/cdk/portal';
import { Directionality, Direction } from '@angular/cdk/bidi';
import { Subscription } from 'rxjs';
import { aplsTabsAnimations } from './tabs-animations';
import { startWith } from 'rxjs/operators';

export type AplsTabBodyPositionState =
  | 'left'
  | 'center'
  | 'right'
  | 'left-origin-center'
  | 'right-origin-center';

export type AplsTabBodyOriginState = 'left' | 'right';

@Directive({
  selector: '[matTabBodyHost]'
})
export class AplsTabBodyPortal extends CdkPortalOutlet
  implements OnInit, OnDestroy {
  private _centeringSub = Subscription.EMPTY;
  private _leavingSub = Subscription.EMPTY;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => AplsTabBody))
    private _host: AplsTabBody
  ) {
    super(componentFactoryResolver, viewContainerRef);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._centeringSub = this._host._beforeCentering
      .pipe(startWith(this._host._isCenterPosition(this._host._position)))
      .subscribe((isCentering: boolean) => {
        if (isCentering && !this.hasAttached()) {
          this.attach(this._host._content);
        }
      });

    // Comentado pois faz perder os dados quando esta em lazy load
    // this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
    //   this.detach();
    // });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._centeringSub.unsubscribe();
    this._leavingSub.unsubscribe();
  }
}

@Component({
  selector: 'apls-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [aplsTabsAnimations.translateTab],
  host: {
    class: 'apls-tab-body'
  }
})
export class AplsTabBody implements OnInit {
  @Output()
  readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  readonly _beforeCentering: EventEmitter<boolean> = new EventEmitter<
    boolean
  >();

  @Output()
  readonly _afterLeavingCenter: EventEmitter<boolean> = new EventEmitter<
    boolean
  >();

  @Output()
  readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  @Input('content') _content: TemplatePortal;

  @Input()
  set position(position: number) {
    if (position < 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'left' : 'right';
    } else if (position > 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }
  }
  _position: AplsTabBodyPositionState;

  @Input()
  set origin(origin: number) {
    if (origin == null) {
      return;
    }

    const dir = this._getLayoutDirection();
    if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
      this._origin = 'left';
    } else {
      this._origin = 'right';
    }
  }
  _origin: AplsTabBodyOriginState;

  constructor(
    private _elementRef: ElementRef,
    @Optional() private _dir: Directionality
  ) {}

  ngOnInit() {
    if (this._position == 'center' && this._origin) {
      this._position =
        this._origin == 'left' ? 'left-origin-center' : 'right-origin-center';
    }
  }

  _onTranslateTabStarted(e: AnimationEvent): void {
    const isCentering = this._isCenterPosition(e.toState);
    this._beforeCentering.emit(isCentering);
    if (isCentering) {
      this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  _onTranslateTabComplete(e: AnimationEvent): void {
    if (
      this._isCenterPosition(e.toState) &&
      this._isCenterPosition(this._position)
    ) {
      this._onCentered.emit();
    }

    if (
      this._isCenterPosition(e.fromState) &&
      !this._isCenterPosition(this._position)
    ) {
      this._afterLeavingCenter.emit();
    }
  }

  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  _isCenterPosition(position: AplsTabBodyPositionState | string): boolean {
    return (
      position == 'center' ||
      position == 'left-origin-center' ||
      position == 'right-origin-center'
    );
  }
}
