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

export const aplsTooltipAnimations: {
  readonly tooltipState: AnimationTriggerMetadata;
} = {
  tooltipState: trigger('state', [
    state('initial, void, hidden', style({transform: 'scale(0.8)', opacity: 0})),
    state('visible', style({transform: 'scale(1)', opacity: 1})),
    transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
    transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)'))
  ])
};
