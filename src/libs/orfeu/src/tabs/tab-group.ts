/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
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
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { merge, Subscription } from 'rxjs';
import { AplsTab } from './tab';
import { AplsTabHeader } from './tab-header';

let nextId = 0;

export class AplsTabChangeEvent {
  index: number;
  tab: AplsTab;
}

export type AplsTabHeaderPosition = 'above' | 'below';
export type AplsTabHeaderIcones = 'mostrar' | 'esconder';

@Component({
  selector: 'apls-tab-group',
  exportAs: 'aplsTabGroup',
  templateUrl: 'tab-group.html',
  styleUrls: ['tab-group.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['color', 'disableRipple'],
  host: {
    class: 'apls-tab-group',
    '[class.apls-tab-group-dynamic-height]': 'dynamicHeight',
    '[class.apls-tab-group-inverted-header]': 'headerPosition === "below"'
  }
})
export class AplsTabGroup implements AfterContentInit, AfterContentChecked, OnDestroy {
  @ContentChildren(AplsTab) _tabs: QueryList<AplsTab>;

  @ViewChild('tabBodyWrapper') _tabBodyWrapper: ElementRef;

  @ViewChild('tabHeader') _tabHeader: AplsTabHeader;

  private _indexToSelect: number | null = 0;

  private _tabBodyWrapperHeight: number = 0;

  private _tabsSubscription = Subscription.EMPTY;

  private _tabLabelSubscription = Subscription.EMPTY;

  @Input()
  get dynamicHeight(): boolean {
    return this._dynamicHeight;
  }
  set dynamicHeight(value: boolean) {
    this._dynamicHeight = coerceBooleanProperty(value);
  }
  private _dynamicHeight: boolean = false;

  @Input()
  get selectedIndex(): number | null {
    return this._selectedIndex;
  }
  set selectedIndex(value: number | null) {
    this._indexToSelect = coerceNumberProperty(value, null);
  }
  private _selectedIndex: number | null = null;

  @Input() headerPosition: AplsTabHeaderPosition = 'above';

  // atributo usado para intercalar entre 2 modelos de header disponiveis. "mostrar" e "esconder"
  // tab-header.icones.ts
  @Input() headerIcones: AplsTabHeaderIcones = 'esconder';

  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  @Output() readonly focusChange: EventEmitter<AplsTabChangeEvent> = new EventEmitter<AplsTabChangeEvent>();

  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  @Output() readonly selectedTabChange: EventEmitter<AplsTabChangeEvent> = new EventEmitter<AplsTabChangeEvent>(true);

  private _groupId: number;

  constructor(public elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef) {
    this._groupId = nextId++;
  }

  ngAfterContentChecked() {
    let indexToSelect = (this._indexToSelect = Math.min(this._tabs.length - 1, Math.max(this._indexToSelect || 0, 0)));

    if (this._selectedIndex != indexToSelect && this._selectedIndex != null) {
      const tabChangeEvent = this._createChangeEvent(indexToSelect);
      this.selectedTabChange.emit(tabChangeEvent);
      Promise.resolve().then(() => this.selectedIndexChange.emit(indexToSelect));
    }

    this._tabs.forEach((tab: AplsTab, index: number) => {
      tab.position = index - indexToSelect;
      tab.isActive = index === indexToSelect;

      if (this._selectedIndex != null && tab.position == 0 && !tab.origin) {
        tab.origin = indexToSelect - this._selectedIndex;
      }
    });

    if (this._selectedIndex !== indexToSelect) {
      this._selectedIndex = indexToSelect;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngAfterContentInit() {
    this._subscribeToTabLabels();

    this._tabsSubscription = this._tabs.changes.subscribe(() => {
      this._subscribeToTabLabels();
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this._tabsSubscription.unsubscribe();
    this._tabLabelSubscription.unsubscribe();
  }

  realignInkBar() {
    if (this._tabHeader) {
      this._tabHeader._alignInkBarToSelectedTab();
    }
  }

  _focusChanged(index: number) {
    this.focusChange.emit(this._createChangeEvent(index));
  }

  private _createChangeEvent(index: number): AplsTabChangeEvent {
    const event = new AplsTabChangeEvent();
    event.index = index;
    if (this._tabs && this._tabs.length) {
      event.tab = this._tabs.toArray()[index];
    }
    return event;
  }

  private _subscribeToTabLabels() {
    if (this._tabLabelSubscription) {
      this._tabLabelSubscription.unsubscribe();
    }

    this._tabLabelSubscription = merge(...this._tabs.map(tab => tab._disableChange), ...this._tabs.map(tab => tab._labelChange)).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  _getTabLabelId(i: number): string {
    return `apls-tab-label-${this._groupId}-${i}`;
  }

  _getTabContentId(i: number): string {
    return `apls-tab-content-${this._groupId}-${i}`;
  }

  _setTabBodyWrapperHeight(tabHeight: number): void {
    if (!this._dynamicHeight || !this._tabBodyWrapperHeight) {
      return;
    }

    const wrapper: HTMLElement = this._tabBodyWrapper.nativeElement;

    wrapper.style.height = this._tabBodyWrapperHeight + 'px';

    if (this._tabBodyWrapper.nativeElement.offsetHeight) {
      wrapper.style.height = tabHeight + 'px';
    }
  }

  _removeTabBodyWrapperHeight(): void {
    this._tabBodyWrapperHeight = this._tabBodyWrapper.nativeElement.clientHeight;
    this._tabBodyWrapper.nativeElement.style.height = '';
    this.animationDone.emit();
  }

  _handleClick(tab: AplsTab, tabHeader: AplsTabHeader, idx: number) {
    if (!tab.disabled) {
      this.selectedIndex = tabHeader.focusIndex = idx;
    }
  }

  _getTabIndex(tab: AplsTab, idx: number): number | null {
    if (tab.disabled) {
      return null;
    }
    return this.selectedIndex === idx ? 0 : -1;
  }

  /**
   * Utilizado para direcionar para aba passada por parametro
   * @param value indíce da aba
   */
  setTab(value: number | null) {
    this._indexToSelect = coerceNumberProperty(value, null);
  }
}
