/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE
} from '@angular/cdk/keycodes';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { AplsInkBar } from './ink-bar';
import { AplsTabLabelWrapper } from './tab-label-wrapper';

export type ScrollDirection = 'after' | 'before';

const EXAGGERATED_OVERSCROLL = 60;

@Component({
  selector: 'apls-tab-header-icones',
  templateUrl: 'tab-header.icones.html',
  styleUrls: ['tab-header.icones.scss'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'apls-tab-icones-header',
    '[class.apls-tab-icones-header-pagination-controls-enabled]':
      '_showPaginationControls',
    '[class.apls-tab-icones-header-rtl]': "_getLayoutDirection() == 'rtl'"
  }
})
export class AplsTabHeaderIcones
  implements AfterContentChecked, AfterContentInit, OnDestroy {
  @ContentChildren(AplsTabLabelWrapper)
  _labelWrappers: QueryList<AplsTabLabelWrapper>;
  @ViewChild(AplsInkBar) _inkBar: AplsInkBar;
  @ViewChild('tabListContainer') _tabListContainer: ElementRef;
  @ViewChild('tabList') _tabList: ElementRef;

  private _focusIndex: number = 0;

  private _scrollDistance = 0;

  private _selectedIndexChanged = false;

  private _realignInkBar = Subscription.EMPTY;

  _showPaginationControls = false;

  _disableScrollAfter = true;

  _disableScrollBefore = true;

  private _tabLabelCount: number;

  private _scrollDistanceChanged: boolean;

  private _selectedIndex: number = 0;

  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(value: number) {
    value = coerceNumberProperty(value);
    this._selectedIndexChanged = this._selectedIndex != value;
    this._selectedIndex = value;
    this._focusIndex = value;
  }

  @Output() readonly selectFocusedIndex = new EventEmitter();

  @Output() readonly indexFocused = new EventEmitter();

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _viewportRuler: ViewportRuler,
    @Optional() private _dir: Directionality
  ) {}

  ngAfterContentChecked(): void {
    if (this._tabLabelCount != this._labelWrappers.length) {
      this._updatePagination();
      this._tabLabelCount = this._labelWrappers.length;
      this._changeDetectorRef.markForCheck();
    }

    if (this._selectedIndexChanged) {
      this._scrollToLabel(this._selectedIndex);
      this._checkScrollingControls();
      this._alignInkBarToSelectedTab();
      this._selectedIndexChanged = false;
      this._changeDetectorRef.markForCheck();
    }

    if (this._scrollDistanceChanged) {
      this._updateTabScrollPosition();
      this._scrollDistanceChanged = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this._focusNextTab();
        break;
      case LEFT_ARROW:
        this._focusPreviousTab();
        break;
      case HOME:
        this._focusFirstTab();
        event.preventDefault();
        break;
      case END:
        this._focusLastTab();
        event.preventDefault();
        break;
      case ENTER:
      case SPACE:
        this.selectFocusedIndex.emit(this.focusIndex);
        event.preventDefault();
        break;
    }
  }

  ngAfterContentInit() {
    const dirChange = this._dir ? this._dir.change : observableOf(null);
    const resize = this._viewportRuler.change(150);
    const realign = () => {
      this._updatePagination();
      this._alignInkBarToSelectedTab();
    };

    typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame(realign)
      : realign();
    this._realignInkBar = merge(dirChange, resize).subscribe(realign);
  }

  ngOnDestroy() {
    this._realignInkBar.unsubscribe();
  }

  _onContentChanges() {
    this._updatePagination();
    this._alignInkBarToSelectedTab();
    this._changeDetectorRef.markForCheck();
  }

  _updatePagination() {
    this._checkPaginationEnabled();
    this._checkScrollingControls();
    this._updateTabScrollPosition();
  }

  set focusIndex(value: number) {
    if (!this._isValidIndex(value) || this._focusIndex == value) {
      return;
    }

    this._focusIndex = value;
    this.indexFocused.emit(value);
    this._setTabFocus(value);
  }

  get focusIndex(): number {
    return this._focusIndex;
  }

  _isValidIndex(index: number): boolean {
    if (!this._labelWrappers) {
      return true;
    }

    const tab = this._labelWrappers
      ? this._labelWrappers.toArray()[index]
      : null;
    return !!tab && !tab.disabled;
  }

  _setTabFocus(tabIndex: number) {
    if (this._showPaginationControls) {
      this._scrollToLabel(tabIndex);
    }

    if (this._labelWrappers && this._labelWrappers.length) {
      this._labelWrappers.toArray()[tabIndex].focus();

      const containerEl = this._tabListContainer.nativeElement;
      const dir = this._getLayoutDirection();

      if (dir == 'ltr') {
        containerEl.scrollLeft = 0;
      } else {
        containerEl.scrollLeft =
          containerEl.scrollWidth - containerEl.offsetWidth;
      }
    }
  }

  _moveFocus(offset: number) {
    if (this._labelWrappers) {
      const tabs: AplsTabLabelWrapper[] = this._labelWrappers.toArray();

      for (
        let i = this.focusIndex + offset;
        i < tabs.length && i >= 0;
        i += offset
      ) {
        if (this._isValidIndex(i)) {
          this.focusIndex = i;
          return;
        }
      }
    }
  }

  _focusNextTab(): void {
    this._moveFocus(this._getLayoutDirection() == 'ltr' ? 1 : -1);
  }

  _focusPreviousTab(): void {
    this._moveFocus(this._getLayoutDirection() == 'ltr' ? -1 : 1);
  }

  private _focusFirstTab(): void {
    for (let i = 0; i < this._labelWrappers.length; i++) {
      if (this._isValidIndex(i)) {
        this.focusIndex = i;
        break;
      }
    }
  }

  private _focusLastTab(): void {
    for (let i = this._labelWrappers.length - 1; i > -1; i--) {
      if (this._isValidIndex(i)) {
        this.focusIndex = i;
        break;
      }
    }
  }

  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  _updateTabScrollPosition() {
    const scrollDistance = this.scrollDistance;
    const translateX =
      this._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;

    this._tabList.nativeElement.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }

  get scrollDistance(): number {
    return this._scrollDistance;
  }
  set scrollDistance(v: number) {
    this._scrollDistance = Math.max(
      0,
      Math.min(this._getMaxScrollDistance(), v)
    );

    this._scrollDistanceChanged = true;
    this._checkScrollingControls();
  }

  _scrollHeader(scrollDir: ScrollDirection) {
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    this.scrollDistance += (scrollDir == 'before' ? -1 : 1) * viewLength / 3;
  }

  _scrollToLabel(labelIndex: number) {
    const selectedLabel = this._labelWrappers
      ? this._labelWrappers.toArray()[labelIndex]
      : null;

    if (!selectedLabel) {
      return;
    }

    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    let labelBeforePos: number, labelAfterPos: number;
    if (this._getLayoutDirection() == 'ltr') {
      labelBeforePos = selectedLabel.getOffsetLeft();
      labelAfterPos = labelBeforePos + selectedLabel.getOffsetWidth();
    } else {
      labelAfterPos =
        this._tabList.nativeElement.offsetWidth - selectedLabel.getOffsetLeft();
      labelBeforePos = labelAfterPos - selectedLabel.getOffsetWidth();
    }

    const beforeVisiblePos = this.scrollDistance;
    const afterVisiblePos = this.scrollDistance + viewLength;

    if (labelBeforePos < beforeVisiblePos) {
      this.scrollDistance -=
        beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
    } else if (labelAfterPos > afterVisiblePos) {
      this.scrollDistance +=
        labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
    }
  }

  _checkPaginationEnabled() {
    const isEnabled =
      this._tabList.nativeElement.scrollWidth >
      this._elementRef.nativeElement.offsetWidth;

    if (!isEnabled) {
      this.scrollDistance = 0;
    }

    if (isEnabled !== this._showPaginationControls) {
      this._changeDetectorRef.markForCheck();
    }

    this._showPaginationControls = isEnabled;
  }

  _checkScrollingControls() {
    this._disableScrollBefore = this.scrollDistance == 0;
    this._disableScrollAfter =
      this.scrollDistance == this._getMaxScrollDistance();
    this._changeDetectorRef.markForCheck();
  }

  _getMaxScrollDistance(): number {
    const lengthOfTabList = this._tabList.nativeElement.scrollWidth;
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;
    return lengthOfTabList - viewLength || 0;
  }

  _alignInkBarToSelectedTab(): void {
    const selectedLabelWrapper =
      this._labelWrappers && this._labelWrappers.length
        ? this._labelWrappers.toArray()[this.selectedIndex].elementRef
            .nativeElement
        : null;

    this._inkBar.alignToElement(selectedLabelWrapper);
  }
}
