import {
  Component,
  ViewEncapsulation,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

export type AplsPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'apls-pseudo-checkbox',
  styleUrls: ['pseudo-checkbox.scss'],
  template: '',
  host: {
    class: 'apls-pseudo-checkbox',
    '[class.apls-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
    '[class.apls-pseudo-checkbox-checked]': 'state === "checked"',
    '[class.apls-pseudo-checkbox-disabled]': 'disabled'
  }
})
export class AplsPseudoCheckbox {
  @Input() state: AplsPseudoCheckboxState = 'unchecked';

  @Input() disabled: boolean = false;
}
