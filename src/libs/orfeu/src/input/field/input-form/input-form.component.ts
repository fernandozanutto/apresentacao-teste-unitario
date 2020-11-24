/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 */

import {
  Component,
  ViewEncapsulation,
  ElementRef,
  ContentChild,
  AfterContentInit,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';

import { AplsInput } from '../../input';
import { aplsInputFormAnimations } from './input-form-animations';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'apls-input-form',
  styleUrls: ['./input-form.component.scss'],
  templateUrl: './input-form.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [aplsInputFormAnimations.slideLength]
})
export class AplsInputForm implements AfterContentInit {
  states: 'void' | 'shown' | 'hide' = 'void';

  showLength = false;

  length = 0;

  maxLength = 255;

  right = 0;

  @Input('input') input: AplsInput;

  constructor(public _elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef, private platform: Platform) {}

  ngAfterContentInit() {
    if (
      /* Testa se já tem o input */
      !!this.input &&
      /* Testa se a referencia possue as propriedade corretas */
      !!this.input.nativeElement
    ) {
      // Problema IE
      let maxLength = this.input.nativeElement.maxLength;
      if (this.platform.EDGE || this.platform.TRIDENT) {
        if (maxLength === 2147483647) {
          maxLength = 0;
        }
      }

      if (
        /* Testa se tem maxLength como atributo */
        maxLength > 0
      ) {
        this.setaPosicoes();

        var observer = new MutationObserver(mutationsList => {
          for (var mutation of mutationsList) {
            if (mutation.type == 'attributes' && mutation.attributeName == 'disabled') {
              this.setaPosicoes();
            }
          }
        });

        observer.observe(this.input.nativeElement, {
          attributes: true,
          childList: true,
          subtree: false
        });

        this.input.nativeElement.addEventListener('blur', () => {
          this.states = 'hide';
          this._changeDetectorRef.markForCheck();
        });

        this.input.nativeElement.addEventListener('focus', () => {
          this.setaPosicoes();
          this.length = this.input.nativeElement.value.length;
          this.showLength = true;
          this.states = 'shown';
          this._changeDetectorRef.markForCheck();
        });

        this.input.nativeElement.addEventListener('keyup', () => {
          this.length = this.input.nativeElement.value.length;
          this._changeDetectorRef.markForCheck();
        });
      }
    }
  }

  setaPosicoes() {
    if (
      /* Testa se já tem o input */
      !!this.input &&
      /* Testa se a referencia possue as propriedade corretas */
      !!this.input.nativeElement &&
      /* Testa se tem maxLength como atributo */
      this.input.nativeElement.maxLength > 0
    ) {
      if (this.input.nativeElement.offsetParent) {
        this.right = Math.abs(this.input.nativeElement.offsetParent.clientWidth - this.input.nativeElement.clientWidth) + 10;
      } else {
        this.right = Math.abs(this.input.nativeElement.clientWidth) + 10;
      }
      this.maxLength = this.input.nativeElement.maxLength;
      this._changeDetectorRef.markForCheck();
    }
  }

  _onAnimationDone(event: AnimationEvent) {
    if (event.fromState == 'shown') {
      
      setTimeout(() => {
        this.showLength = false;
      }, 50);
      
      this._changeDetectorRef.markForCheck();

    }
  }

  getConnectedOverlayOrigin(): ElementRef {
    return this._elementRef;
  }
}
