/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  NgZone
} from '@angular/core';

// tslint:disable-next-line class-name Using leading underscore to denote internal interface.
export interface _AplsInkBarPositioner {
  (element: HTMLElement): { left: string; width: string };
}

export const _APLS_INK_BAR_POSITIONER = new InjectionToken<
  _AplsInkBarPositioner
>('AplsInkBarPositioner', {
  providedIn: 'root',
  factory: _APLS_INK_BAR_POSITIONER_FACTORY
});

/**
 * @docs-private
 */
export function _APLS_INK_BAR_POSITIONER_FACTORY(): _AplsInkBarPositioner {
  const method = (element: HTMLElement) => ({
    left: element ? (element.offsetLeft || 0) + 'px' : '0',
    width: element ? (element.offsetWidth || 0) + 'px' : '0'
  });

  return method;
}

@Directive({
  selector: 'apls-ink-bar',
  host: {
    class: 'apls-ink-bar'
  }
})
export class AplsInkBar {
  constructor(
    private _elementRef: ElementRef,
    private _ngZone: NgZone,
    @Inject(_APLS_INK_BAR_POSITIONER)
    private _inkBarPositioner: _AplsInkBarPositioner
  ) {}

  alignToElement(element: HTMLElement) {
    this.show();

    if (typeof requestAnimationFrame !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this._setStyles(element));
      });
    } else {
      this._setStyles(element);
    }
  }

  show(): void {
    this._elementRef.nativeElement.style.visibility = 'visible';
  }

  hide(): void {
    this._elementRef.nativeElement.style.visibility = 'hidden';
  }

  private _setStyles(element: HTMLElement) {
    const positions = this._inkBarPositioner(element);
    const inkBar: HTMLElement = this._elementRef.nativeElement;

    inkBar.style.left = positions.left;
    inkBar.style.width = positions.width;
  }
}
