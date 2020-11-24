import { NgModule } from '@angular/core';

import { AplsButtonModule, AplsDialogModule } from '@apollus-ngx/orfeu';
import { AplsCommonModule } from '@apollus/common';
import { ComparaBiometriaComponent } from './compara-biometria.component';
import { BiometriaServicoModule } from '../biometria-servico.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ComparaBiometriaComponent],
  imports: [AplsCommonModule, AplsButtonModule, BiometriaServicoModule, AplsDialogModule, TranslateModule],
  entryComponents: [ComparaBiometriaComponent]
})
export class ComparaBiometriaModule {}
