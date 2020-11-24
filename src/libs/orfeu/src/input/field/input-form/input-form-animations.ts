/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata
} from '@angular/animations';

export const aplsInputFormAnimations: {
  readonly slideLength: AnimationTriggerMetadata;
} = {
  slideLength: trigger('slideLength', [
    state('shown', style({transform: 'translateY(5px)', opacity: 1})),
    state('void', style({opacity: 0})),
    state('hide', style({transform: 'translateY(0px)', opacity: 0})),
    transition('* => shown', animate('225ms linear')),
    transition('* => hide', animate('195ms linear'))
  ])

};
