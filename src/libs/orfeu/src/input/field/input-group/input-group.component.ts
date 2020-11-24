/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import { Input, Component, ViewEncapsulation, ContentChild, AfterContentInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { AplsInput } from '../../input';

@Component({
  selector: 'apls-input-group',
  styleUrls: ['./input-group.component.scss'],
  templateUrl: './input-group.component.html',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'form-group'
  }
})
export class AplsInputGroup implements AfterContentInit {
  @Input()
  get label(): string {
    return this._label;
  }
  set label(novoValor: string) {
    this._label = novoValor;
    // this._changeDetectorRef.markForCheck();
  }
  _label = '';

  @Input() hint = '';

  @Input() tooltip = '';

  /**
   * Essa estrada espera false do tipo boolean. Garanta que a entrada vai ser um boolean.
   * Desativa a margem de baixo do input
   */
  @Input('aplsEnableFooter') footer = true;

  @ContentChild(AplsInput) input: AplsInput;

  width = null;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit() {
    if (
      /* Testa se já tem o input */
      !!this.input &&
      /* Testa se a referencia possue as propriedade corretas */
      !!this.input.nativeElement
    ) {
      this.setWidth();

      var observer = new MutationObserver(mutationsList => {
        for (var mutation of mutationsList) {
          if (mutation.type == 'attributes' && mutation.attributeName == 'disabled') {
            this.setWidth();
          }
        }
      });
      observer.observe(this.input.nativeElement, {
        attributes: true,
        childList: false,
        subtree: false
      });
    }
  }

  /**
   * Calcula qual deve ser o width para o tooltip da esquerda
   */
  setWidth() {
    if (!!this.input && !!this.input.nativeElement) {
      if (this.input.nativeElement.clientWidth > 0) {
        this.width = this.input.nativeElement.clientWidth;
      }
      // this._changeDetectorRef.markForCheck();
    }
  }

  @HostListener('window:resize', [])
  handleResize() {
    this.setWidth();
  }
}
