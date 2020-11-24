/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  Overlay,
  OverlayConfig,
  OverlayContainer,
  OverlayRef,
  ScrollStrategy
} from '@angular/cdk/overlay';
import {
  ComponentPortal,
  ComponentType,
  PortalInjector,
  TemplatePortal
} from '@angular/cdk/portal';
import { Location } from '@angular/common';
import {
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Optional,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { defer, Observable, of as observableOf, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { AplsDialogConfig } from './dialog-config';
import { AplsDialogContainer } from './dialog-container';
import { AplsDialogRef } from './dialog-ref';

export const APLS_DIALOG_DATA = new InjectionToken<any>('AplsDialogData');

export const APLS_DIALOG_DEFAULT_OPTIONS = new InjectionToken<AplsDialogConfig>(
  'apls-dialog-default-options'
);

export const APLS_DIALOG_SCROLL_STRATEGY = new InjectionToken<
  () => ScrollStrategy
>('apls-dialog-scroll-strategy');

export function APLS_DIALOG_SCROLL_STRATEGY_FACTORY(
  overlay: Overlay
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

export function APLS_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

export const APLS_DIALOG_SCROLL_STRATEGY_PROVIDER = {
  provide: APLS_DIALOG_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APLS_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY
};

@Injectable({
  providedIn: 'root'
})
export class AplsDialog {
  private _openDialogsAtThisLevel: AplsDialogRef<any>[] = [];
  private readonly _afterAllClosedAtThisLevel = new Subject<void>();
  private readonly _afterOpenAtThisLevel = new Subject<AplsDialogRef<any>>();
  private _ariaHiddenElements = new Map<Element, string | null>();

  get openDialogs(): AplsDialogRef<any>[] {
    return this._parentDialog
      ? this._parentDialog.openDialogs
      : this._openDialogsAtThisLevel;
  }

  get afterOpen(): Subject<AplsDialogRef<any>> {
    return this._parentDialog
      ? this._parentDialog.afterOpen
      : this._afterOpenAtThisLevel;
  }

  get _afterAllClosed(): any {
    const parent = this._parentDialog;
    return parent ? parent._afterAllClosed : this._afterAllClosedAtThisLevel;
  }

  readonly afterAllClosed = defer<any>(() => this.openDialogs.length ?
      this._afterAllClosed :
      this._afterAllClosed.pipe(startWith(undefined)));

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    @Optional() private _location: Location,
    @Optional()
    @Inject(APLS_DIALOG_DEFAULT_OPTIONS)
    private _defaultOptions: any,
    @Inject(APLS_DIALOG_SCROLL_STRATEGY) private _scrollStrategy: any,
    @Optional()
    @SkipSelf()
    private _parentDialog: AplsDialog,
    private _overlayContainer: OverlayContainer
  ) {}

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: AplsDialogConfig<D>
  ): AplsDialogRef<T, R> {
    config = _applyConfigDefaults(
      config,
      this._defaultOptions || new AplsDialogConfig()
    );

    if (config.id && this.getDialogById(config.id)) {
      throw Error(
        `Dialog with id "${
          config.id
        }" exists already. The dialog id must be unique.`
      );
    }

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const dialogRef = this._attachDialogContent<T, R>(
      componentOrTemplateRef,
      dialogContainer,
      overlayRef,
      config
    );

    if (!this.openDialogs.length) {
      this._hideNonDialogContentFromAssistiveTechnology();
    }

    this.openDialogs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => this._removeOpenDialog(dialogRef));
    this.afterOpen.next(dialogRef);

    return dialogRef;
  }

  closeAll(): void {
    let i = this.openDialogs.length;

    while (i--) {
      this.openDialogs[i].close();
    }
  }

  getDialogById(id: string): AplsDialogRef<any> | undefined {
    return this.openDialogs.find(dialog => dialog.id === id);
  }

  private _createOverlay(config: AplsDialogConfig): OverlayRef {
    const overlayConfig = this._getOverlayConfig(config);
    return this._overlay.create(overlayConfig);
  }

  private _getOverlayConfig(dialogConfig: AplsDialogConfig): OverlayConfig {
    const state = new OverlayConfig({
      positionStrategy: this._overlay.position().global(),
      scrollStrategy: dialogConfig.scrollStrategy || this._scrollStrategy(),
      panelClass: dialogConfig.panelClass,
      hasBackdrop: dialogConfig.hasBackdrop,
      direction: dialogConfig.direction,
      minWidth: dialogConfig.minWidth,
      minHeight: dialogConfig.minHeight,
      maxWidth: dialogConfig.maxWidth,
      maxHeight: dialogConfig.maxHeight
    });

    if (dialogConfig.backdropClass) {
      state.backdropClass = dialogConfig.backdropClass;
    }

    return state;
  }

  private _attachDialogContainer(
    overlay: OverlayRef,
    config: AplsDialogConfig
  ): AplsDialogContainer {
    const userInjector =
      config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = new PortalInjector(
      userInjector || this._injector,
      new WeakMap([[AplsDialogConfig, config]])
    );
    const containerPortal = new ComponentPortal(
      AplsDialogContainer,
      config.viewContainerRef,
      injector
    );
    const containerRef = overlay.attach<AplsDialogContainer>(containerPortal);

    return containerRef.instance;
  }

  private _attachDialogContent<T, R>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    dialogContainer: AplsDialogContainer,
    overlayRef: OverlayRef,
    config: AplsDialogConfig
  ): AplsDialogRef<T, R> {
    const dialogRef = new AplsDialogRef<T, R>(
      overlayRef,
      dialogContainer,
      this._location,
      config.id
    );

    if (config.hasBackdrop) {
      overlayRef.backdropClick().subscribe(() => {
        if (!dialogRef.disableClose) {
          dialogRef.close();
        }
      });
    }

    if (componentOrTemplateRef instanceof TemplateRef) {
      dialogContainer.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!, <any>{
          $implicit: config.data,
          dialogRef
        })
      );
    } else {
      const injector = this._createInjector<T>(
        config,
        dialogRef,
        dialogContainer
      );
      const contentRef = dialogContainer.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, undefined, injector)
      );
      dialogRef.componentInstance = contentRef.instance;
    }

    dialogRef
      .updateSize(config.width, config.height)
      .updatePosition(config.position);

    return dialogRef;
  }

  private _createInjector<T>(
    config: AplsDialogConfig,
    dialogRef: AplsDialogRef<T>,
    dialogContainer: AplsDialogContainer
  ): PortalInjector {
    const userInjector =
      config && config.viewContainerRef && config.viewContainerRef.injector;

    const injectionTokens = new WeakMap<any, any>([
      [AplsDialogContainer, dialogContainer],
      [APLS_DIALOG_DATA, config.data],
      [AplsDialogRef, dialogRef]
    ]);

    if (
      config.direction &&
      (!userInjector ||
        !userInjector.get<Directionality | null>(Directionality, null))
    ) {
      injectionTokens.set(Directionality, {
        value: config.direction,
        change: observableOf()
      });
    }

    return new PortalInjector(userInjector || this._injector, injectionTokens);
  }

  private _removeOpenDialog(dialogRef: AplsDialogRef<any>) {
    const index = this.openDialogs.indexOf(dialogRef);

    if (index > -1) {
      this.openDialogs.splice(index, 1);

      if (!this.openDialogs.length) {
        this._ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute('aria-hidden', previousValue);
          } else {
            element.removeAttribute('aria-hidden');
          }
        });

        this._ariaHiddenElements.clear();
        this._afterAllClosed.next();
      }
    }
  }

  private _hideNonDialogContentFromAssistiveTechnology() {
    const overlayContainer = this._overlayContainer.getContainerElement();

    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;

      for (let i = siblings.length - 1; i > -1; i--) {
        let sibling = siblings[i];

        if (
          sibling !== overlayContainer &&
          sibling.nodeName !== 'SCRIPT' &&
          sibling.nodeName !== 'STYLE' &&
          !sibling.hasAttribute('aria-live')
        ) {
          this._ariaHiddenElements.set(
            sibling,
            sibling.getAttribute('aria-hidden')
          );
          sibling.setAttribute('aria-hidden', 'true');
        }
      }
    }
  }
}

function _applyConfigDefaults(
  config?: AplsDialogConfig,
  defaultOptions?: AplsDialogConfig
): AplsDialogConfig {
  return { ...defaultOptions, ...config };
}
