import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Inject,
  Input,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

let progressbarId = 0;

@Component({
  selector: 'apls-progress-bar',
  exportAs: 'aplsProgressBar',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value',
    '[attr.mode]': 'mode',
    'class': 'apls-progress-bar',
    '[class._apls-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
  inputs: ['color'],
  templateUrl: 'progress-bar.html',
  styleUrls: ['progress-bar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AplsProgressBar {


  constructor(public _elementRef: ElementRef,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
  }

  @Input()
  get value(): number { return this._value; }
  set value(v: number) { this._value = clamp(v || 0); }
  private _value: number = 0;

  @Input()
  get bufferValue(): number { return this._bufferValue; }
  set bufferValue(v: number) { this._bufferValue = clamp(v || 0); }
  private _bufferValue: number = 0;

  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';

  progressbarId = `apls-progress-bar-${progressbarId++}`;

  _primaryTransform() {
    const scale = this.value / 100;
    return {transform: `scaleX(${scale})`};
  }

  _bufferTransform() {
    if (this.mode === 'buffer') {
      const scale = this.bufferValue / 100;
      return {transform: `scaleX(${scale})`};
    }
  }
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
