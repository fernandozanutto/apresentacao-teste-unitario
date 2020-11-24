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

export const aplsFotosAnimations: {
  readonly fotoState: AnimationTriggerMetadata;
} = {
  fotoState: trigger('state', [
    state(
      'visivel',
      style({
        transform: 'translateX(0%)',
        position: 'absolute',
        zIndex: '9999',
        top: 0
      })
    ),
    state(
      'proximo',
      style({
        transform: 'translateX(100%)',
        display: 'none'
      })
    ),
    state(
      'anterior',
      style({
        transform: 'translateX(-100%)',
        display: 'none'
      })
    ),
    transition(
      '* <=> *',
      animate(
        '.6s ease'
      )
    ),
  ])
};
