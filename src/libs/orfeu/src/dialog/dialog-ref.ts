/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { ESCAPE } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { Observable, Subject, Subscription, SubscriptionLike } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DialogPosition } from './dialog-config';
import { AplsDialogContainer } from './dialog-container';

let uniqueId = 0;

export class AplsDialogRef<T, R = any> {
  componentInstance: T;

  disableClose: boolean | undefined = this._containerInstance._config
    .disableClose;

  private readonly _afterOpen = new Subject<void>();

  private readonly _afterClosed = new Subject<R | undefined>();

  private readonly _beforeClose = new Subject<R | undefined>();

  private _result: R | undefined;

  private _locationChanges: SubscriptionLike = Subscription.EMPTY;

  constructor(
    private _overlayRef: OverlayRef,
    public _containerInstance: AplsDialogContainer,
    location?: Location,
    readonly id: string = `apls-dialog-${uniqueId++}`
  ) {
    _containerInstance._id = id;

    _containerInstance._animationStateChanged
      .pipe(
        filter(
          event => event.phaseName === 'done' && event.toState === 'enter'
        ),
        take(1)
      )
      .subscribe(() => {
        this._afterOpen.next();
        this._afterOpen.complete();
      });

    _containerInstance._animationStateChanged
      .pipe(
        filter(event => event.phaseName === 'done' && event.toState === 'exit'),
        take(1)
      )
      .subscribe(() => {
        this._overlayRef.dispose();
        this._locationChanges.unsubscribe();
        this._afterClosed.next(this._result);
        this._afterClosed.complete();
        this.componentInstance = null!;
      });

    _overlayRef
      .keydownEvents()
      .pipe(filter(event => event.keyCode === ESCAPE && !this.disableClose))
      .subscribe(() => this.close());

    if (location) {
      this._locationChanges = location.subscribe(() => {
        if (this._containerInstance._config.closeOnNavigation) {
          this.close();
        }
      });
    }
  }

  close(dialogResult?: R): void {
    this._result = dialogResult;

    this._containerInstance._animationStateChanged
      .pipe(filter(event => event.phaseName === 'start'), take(1))
      .subscribe(() => {
        this._beforeClose.next(dialogResult);
        this._beforeClose.complete();
        this._overlayRef.detachBackdrop();
      });

    this._containerInstance._startExitAnimation();
  }

  afterOpen(): Observable<void> {
    return this._afterOpen.asObservable();
  }

  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  beforeClose(): Observable<R | undefined> {
    return this._beforeClose.asObservable();
  }

  backdropClick(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick();
  }

  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  updatePosition(position?: DialogPosition): this {
    let strategy = this._getPositionStrategy();

    if (position && (position.left || position.right)) {
      position.left
        ? strategy.left(position.left)
        : strategy.right(position.right);
    } else {
      strategy.centerHorizontally();
    }

    if (position && (position.top || position.bottom)) {
      position.top
        ? strategy.top(position.top)
        : strategy.bottom(position.bottom);
    } else {
      strategy.centerVertically();
    }

    this._overlayRef.updatePosition();

    return this;
  }

  updateSize(width: string = 'auto', height: string = 'auto'): this {
    this._getPositionStrategy()
      .width(width)
      .height(height);
    this._overlayRef.updatePosition();
    return this;
  }

  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig()
      .positionStrategy as GlobalPositionStrategy;
  }
}
