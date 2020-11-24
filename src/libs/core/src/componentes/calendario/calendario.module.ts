import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AplsTooltipModule } from 'libs/orfeu';
import { AplsCalendarioMiniMesDiaComponent } from './calendario-mini-mes/calendario-mini-mes-dia/calendario-mini-mes-dia.component';
import { AplsCalendarioMiniMesComponent } from './calendario-mini-mes/calendario-mini-mes.component';

@NgModule({
  imports: [CommonModule, AplsTooltipModule],
  declarations: [AplsCalendarioMiniMesComponent, AplsCalendarioMiniMesDiaComponent],
  exports: [AplsCalendarioMiniMesComponent]
})
export class AplsCalendarioModule {}
