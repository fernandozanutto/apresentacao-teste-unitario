/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  AfterContentChecked,
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { merge, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AplsInkBar } from '../ink-bar';

@Component({
  selector: '[apls-tab-nav-bar]',
  exportAs: 'aplsTabNavBar, aplsTabNav',
  inputs: ['color', 'disableRipple'],
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.scss'],
  host: { class: 'apls-tab-nav-bar' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AplsTabNav
  implements AfterContentChecked, AfterContentInit, OnDestroy {
  private readonly _onDestroy = new Subject<void>();

  private _activeLinkChanged: boolean;
  private _activeLinkElement: ElementRef | null;

  @ViewChild(AplsInkBar) _inkBar: AplsInkBar;

  @ContentChildren(forwardRef(() => AplsTabLink), { descendants: true })
  _tabLinks: QueryList<AplsTabLink>;

  constructor(
    public elementRef: ElementRef,
    @Optional() private _dir: Directionality,
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    private _viewportRuler: ViewportRuler
  ) {}

  updateActiveLink(element: ElementRef) {
    this._activeLinkChanged = !!element;
    this._changeDetectorRef.markForCheck();
  }

  ngAfterContentInit(): void {
    this._ngZone.runOutsideAngular(() => {
      const dirChange = this._dir ? this._dir.change : observableOf(null);

      return merge(dirChange, this._viewportRuler.change(10))
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => this._alignInkBar());
    });
  }

  ngAfterContentChecked(): void {
    if (this._activeLinkChanged) {
      const activeTab = this._tabLinks.find(tab => tab.active);

      this._activeLinkElement = activeTab ? activeTab._elementRef : null;
      this._alignInkBar();
      this._activeLinkChanged = false;
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  _alignInkBar(): void {
    if (this._activeLinkElement) {
      this._inkBar.show();
      this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
    } else {
      this._inkBar.hide();
    }
  }
}

@Directive({
  selector: '[apls-tab-link], [aplsTabLink]',
  exportAs: 'aplsTabLink',
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  host: {
    class: 'apls-tab-link',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.tabIndex]': 'tabIndex',
    '[class.apls-tab-disabled]': 'disabled',
    '[class.apls-tab-label-active]': 'active',
    '(click)': '_handleClick($event)'
  }
})
export class AplsTabLink {
  protected _isActive: boolean = false;

  @Input()
  get active(): boolean {
    return this._isActive;
  }
  set active(value: boolean) {
    if (value !== this._isActive) {
      this._isActive = value;
      this._tabNavBar.updateActiveLink(this._elementRef);
    }
  }

  @Input() tabIndex = 0;

  @Input() disabled = false;

  constructor(
    private _tabNavBar: AplsTabNav,
    public _elementRef: ElementRef,
    @Attribute('tabindex') tabIndex: string
  ) {
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  _handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
    }
  }
}
