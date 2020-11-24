import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { AplsDialogModule } from '../dialog';
import { AplsButtonModule } from '../button';

import { AplsModal, APLS_POPUP_SCROLL_STRATEGY_FACTORY_PROVIDER } from './modal';
import { AplsAlertaComponent } from './alerta/alerta.component';
import { AplsFotosComponent } from './fotos/fotos.component';
import { AplsPopupComponent } from './popup/popup.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AplsAlertaComponent, AplsFotosComponent, AplsPopupComponent],
  entryComponents: [AplsAlertaComponent, AplsFotosComponent, AplsPopupComponent],
  providers: [AplsModal, APLS_POPUP_SCROLL_STRATEGY_FACTORY_PROVIDER],
  imports: [CommonModule, AplsDialogModule, AplsButtonModule, OverlayModule, TranslateModule]
})
export class AplsModalModule {}
