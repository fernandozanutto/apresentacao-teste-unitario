import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
  query,
  animateChild,
  group,
} from '@angular/animations';

export const aplsSelectAnimations: {
  readonly transformPanel: AnimationTriggerMetadata;
  readonly fadeInContent: AnimationTriggerMetadata;
} = {
  transformPanel: trigger('transformPanel', [
    state('void', style({
      transform: 'scale(0.9)',
      minWidth: '100%',
      opacity: 0
    })),
    state('showing', style({
      opacity: 1,
      minWidth: '100%', 
      transform: 'scale(1)'
    })),
    state('showing-multiple', style({
      opacity: 1,
      minWidth: '100%',
      transform: 'scale(1)'
    })),
    transition('void => *', group([
      query('@fadeInContent', animateChild()),
      animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)')
    ])),
    transition('* => void', [
      animate('250ms 100ms linear', style({opacity: 0}))
    ])
  ]),

  fadeInContent: trigger('fadeInContent', [
    state('showing', style({opacity: 1})),
    transition('void => showing', [
      style({opacity: 0}),
      animate('150ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
    ])
  ])
};