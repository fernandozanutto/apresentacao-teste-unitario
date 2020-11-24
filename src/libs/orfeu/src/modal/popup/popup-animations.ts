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

export const aplsPopupAnimations: {
  readonly popupState: AnimationTriggerMetadata;
} = {
  popupState: trigger('state', [
    state(
      'void',
      style({
        opacity: 0
      })
    ),
    state(
      'origemDeBaixo',
      style({
        transform: 'translateY(5px)',
        opacity: 0
      })
    ),
    state(
      'origemDeCima',
      style({
        transform: 'translateY(-5px)',
        opacity: 0
      })
    ),
    state(
      'visivel',
      style({
        transform: 'translateY(0px)',
        opacity: 1,
      })
    ),
    state(
      'escondeEmBaixo',
      style({
        transform: 'translateY(5px)',
        opacity: 0
      })
    ),
    state(
      'escondeEmCima',
      style({
        transform: 'translateY(-5px)',
        opacity: 0
      })
    ),
    transition(
      'void <=> *',
      animate(
        '0s ease'
      )
    ),
    transition(
      '* => visivel',
      animate(
        '.5s ease'
      )
    ),
    transition(
      'visivel => *',
      animate(
        '.2s ease'
      )
    ),
  ])
};
