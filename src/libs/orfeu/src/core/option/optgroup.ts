
import {Component, ViewEncapsulation, Input, ChangeDetectionStrategy} from '@angular/core';
import {mixinDisabled, CanDisable} from '../common-behaviors/disabled';

export class AplsOptgroupBase { }
export const _AplsOptgroupMixinBase = mixinDisabled(AplsOptgroupBase);

let _uniqueOptgroupIdCounter = 0;

@Component({
  selector: 'apls-optgroup',
  exportAs: 'aplsOptgroup',
  templateUrl: 'optgroup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
  styleUrls: ['optgroup.scss'],
  host: {
    'class': 'apls-optgroup',
    'role': 'group',
    '[class.apls-optgroup-disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-labelledby]': '_labelId',
  }
})
export class AplsOptgroup extends _AplsOptgroupMixinBase implements CanDisable {
  @Input() label: string;

  _labelId: string = `apls-optgroup-label-${_uniqueOptgroupIdCounter++}`;
}
