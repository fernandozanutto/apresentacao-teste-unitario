/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AnimationEvent } from '@angular/animations';
import { aplsDialogAnimations } from './dialog-animations';
import {
  BasePortalOutlet,
  ComponentPortal,
  CdkPortalOutlet,
  TemplatePortal
} from '@angular/cdk/portal';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { AplsDialogConfig } from './dialog-config';

export function throwAplsDialogContentAlreadyAttachedError() {
  throw Error(
    'Attempting to attach dialog content after content is already attached'
  );
}

@Component({
  selector: 'apls-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [aplsDialogAnimations.slideDialog],
  host: {
    class: 'apls-dialog-container',
    tabindex: '-1',
    '[attr.id]': '_id',
    '[attr.role]': '_config.role',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledBy',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[@slideDialog]': '_state',
    '(@slideDialog.start)': '_onAnimationStart($event)',
    '(@slideDialog.done)': '_onAnimationDone($event)'
  }
})
export class AplsDialogContainer extends BasePortalOutlet {
  @ViewChild(CdkPortalOutlet) _portalOutlet: CdkPortalOutlet;

  private _focusTrap: FocusTrap;

  private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

  _state: 'void' | 'enter' | 'exit' = 'enter';

  _animationStateChanged = new EventEmitter<AnimationEvent>();

  _ariaLabelledBy: string | null = null;

  _id: string;

  constructor(
    private _elementRef: ElementRef,
    private _focusTrapFactory: FocusTrapFactory,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional()
    @Inject(DOCUMENT)
    private _document: any,
    public _config: AplsDialogConfig
  ) {
    super();
  }

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached()) {
      throwAplsDialogContentAlreadyAttachedError();
    }

    this._savePreviouslyFocusedElement();
    return this._portalOutlet.attachComponentPortal(portal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalOutlet.hasAttached()) {
      throwAplsDialogContentAlreadyAttachedError();
    }

    this._savePreviouslyFocusedElement();
    return this._portalOutlet.attachTemplatePortal(portal);
  }

  private _trapFocus() {
    if (!this._focusTrap) {
      this._focusTrap = this._focusTrapFactory.create(
        this._elementRef.nativeElement
      );
    }

    if (this._config.autoFocus) {
      this._focusTrap.focusInitialElementWhenReady();
    }
  }

  private _restoreFocus() {
    const toFocus = this._elementFocusedBeforeDialogWasOpened;

    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }

    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  private _savePreviouslyFocusedElement() {
    if (this._document) {
      this._elementFocusedBeforeDialogWasOpened = this._document
        .activeElement as HTMLElement;

      if (this._elementRef.nativeElement.focus) {
        Promise.resolve().then(() => this._elementRef.nativeElement.focus());
      }
    }
  }

  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._trapFocus();
    } else if (event.toState === 'exit') {
      this._restoreFocus();
    }

    this._animationStateChanged.emit(event);
  }

  _onAnimationStart(event: AnimationEvent) {
    this._animationStateChanged.emit(event);
  }

  _startExitAnimation(): void {
    this._state = 'exit';
    this._changeDetectorRef.markForCheck();
  }
}
