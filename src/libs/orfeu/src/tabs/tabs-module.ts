/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { ObserversModule } from '@angular/cdk/observers';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AplsInkBar } from './ink-bar';
import { AplsTab } from './tab';
import { AplsTabBody, AplsTabBodyPortal } from './tab-body';
import { AplsTabContent } from './tab-content';
import { AplsTabGroup } from './tab-group';
import { AplsTabHeader } from './tab-header';
import { AplsTabLabel } from './tab-label';
import { AplsTabLabelWrapper } from './tab-label-wrapper';
import { AplsTabLink, AplsTabNav } from './tab-nav-bar/tab-nav-bar';
import { AplsTabHeaderIcones } from './tab-header.icones';

@NgModule({
  imports: [CommonModule, PortalModule, ObserversModule],
  exports: [
    AplsTabGroup,
    AplsTabLabel,
    AplsTab,
    AplsTabNav,
    AplsTabLink,
    AplsTabContent
  ],
  declarations: [
    AplsTabGroup,
    AplsTabLabel,
    AplsTab,
    AplsInkBar,
    AplsTabLabelWrapper,
    AplsTabNav,
    AplsTabLink,
    AplsTabBody,
    AplsTabBodyPortal,
    AplsTabHeader,
    AplsTabContent,
    AplsTabHeaderIcones
  ]
})
export class AplsTabsModule {}
