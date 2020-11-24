/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { AplsTabLabel } from './tab-label';
import { AplsTabContent } from './tab-content';

@Component({
  selector: 'apls-tab',
  templateUrl: 'tab.html',
  inputs: ['disabled'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'aplsTab'
})
export class AplsTab implements OnInit, OnChanges, OnDestroy {
  @ContentChild(AplsTabLabel) templateLabel: AplsTabLabel;

  @ContentChild(AplsTabContent, { read: TemplateRef })
  _explicitContent: TemplateRef<any>;

  @ViewChild(TemplateRef) _implicitContent: TemplateRef<any>;

  @Input('label') textLabel: string = '';

  @Input() disabled: boolean = false;

  private _contentPortal: TemplatePortal | null = null;

  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  readonly _labelChange = new Subject<void>();

  readonly _disableChange = new Subject<void>();

  position: number | null = null;

  origin: number | null = null;

  isActive = false;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('textLabel')) {
      this._labelChange.next();
    }

    if (changes.hasOwnProperty('disabled')) {
      this._disableChange.next();
    }
  }

  ngOnDestroy(): void {
    this._disableChange.complete();
    this._labelChange.complete();
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(
      this._explicitContent || this._implicitContent,
      this._viewContainerRef
    );
  }
}
