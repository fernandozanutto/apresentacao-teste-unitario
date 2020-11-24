/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Directive,
  Input,
} from '@angular/core';


/**
 * Content of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'apls-card-content',
  host: {'class': 'apls-card-content'}
})
export class AplsCardContent {}

/**
 * Title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `apls-card-title, [apls-card-title], [aplsCardTitle]`,
  host: {
    'class': 'apls-card-title'
  }
})
export class AplsCardTitle {}

/**
 * Sub-title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `apls-card-subtitle, [apls-card-subtitle], [aplsCardSubtitle]`,
  host: {
    'class': 'apls-card-subtitle'
  }
})
export class AplsCardSubtitle {}

/**
 * Action section of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'apls-card-actions',
  exportAs: 'aplsCardActions',
  host: {
    'class': 'apls-card-actions',
    '[class.apls-card-actions-align-end]': 'align === "end"',
  }
})
export class AplsCardActions {
  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Footer of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'apls-card-footer',
  host: {'class': 'apls-card-footer'}
})
export class AplsCardFooter {}

/**
 * Image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-image], [aplsCardImage]',
  host: {'class': 'apls-card-image'}
})
export class AplsCardImage {}

/**
 * Image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-sm-image], [aplsCardImageSmall]',
  host: {'class': 'apls-card-sm-image'}
})
export class AplsCardSmImage {}

/**
 * Image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-md-image], [aplsCardImageMedium]',
  host: {'class': 'apls-card-md-image'}
})
export class AplsCardMdImage {}

/**
 * Image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-lg-image], [aplsCardImageLarge]',
  host: {'class': 'apls-card-lg-image'}
})
export class AplsCardLgImage {}

/**
 * Large image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-xl-image], [aplsCardImageXLarge]',
  host: {'class': 'apls-card-xl-image'}
})
export class AplsCardXlImage {}

/**
 * Avatar image used in a card, needed to add the apls- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[apls-card-avatar], [aplsCardAvatar]',
  host: {'class': 'apls-card-avatar'}
})
export class AplsCardAvatar {}


/**
 * A basic content container component that adds the styles of a Aplserial design card.
 *
 * While this component can be used alone, it also provides a number
 * of preset styles for common card sections, including:
 * - apls-card-title
 * - apls-card-subtitle
 * - apls-card-content
 * - apls-card-actions
 * - apls-card-footer
 */
@Component({  
  selector: 'apls-card',
  exportAs: 'aplsCard',
  templateUrl: 'card.html',
  styleUrls: ['card.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'apls-card'}
})
export class AplsCard {}


/**
 * Component intended to be used within the `<apls-card>` component. It adds styles for a
 * preset header section (i.e. a title, subtitle, and avatar layout).
 * @docs-private
 */
@Component({  
  selector: 'apls-card-header',
  templateUrl: 'card-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'apls-card-header'}
})
export class AplsCardHeader {}


/**
 * Component intended to be used within the `<apls-card>` component. It adds styles for a preset
 * layout that groups an image with a title section.
 * @docs-private
 */
@Component({  
  selector: 'apls-card-title-group',
  templateUrl: 'card-title-group.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'apls-card-title-group'}
})
export class AplsCardTitleGroup {}
