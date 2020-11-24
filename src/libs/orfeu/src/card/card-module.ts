/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AplsCard,
  AplsCardActions,
  AplsCardAvatar,
  AplsCardContent,
  AplsCardFooter,
  AplsCardHeader,
  AplsCardImage,
  AplsCardLgImage,
  AplsCardMdImage,
  AplsCardSmImage,
  AplsCardSubtitle,
  AplsCardTitle,
  AplsCardTitleGroup,
  AplsCardXlImage,
} from './card';


@NgModule({
  imports: [CommonModule],
  exports: [
    AplsCard,
    AplsCardHeader,
    AplsCardTitleGroup,
    AplsCardContent,
    AplsCardTitle,
    AplsCardSubtitle,
    AplsCardActions,
    AplsCardFooter,
    AplsCardSmImage,
    AplsCardMdImage,
    AplsCardLgImage,
    AplsCardImage,
    AplsCardXlImage,
    AplsCardAvatar,
    CommonModule,
  ],
  declarations: [
    AplsCard, AplsCardHeader, AplsCardTitleGroup, AplsCardContent, AplsCardTitle, AplsCardSubtitle,
    AplsCardActions, AplsCardFooter, AplsCardSmImage, AplsCardMdImage, AplsCardLgImage, AplsCardImage,
    AplsCardXlImage, AplsCardAvatar,
  ],
})
export class AplsCardModule {}
