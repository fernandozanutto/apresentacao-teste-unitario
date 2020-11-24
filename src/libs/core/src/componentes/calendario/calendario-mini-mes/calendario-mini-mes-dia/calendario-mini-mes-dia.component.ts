import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AgendaServiceController } from '@apollus/modulos/si/telas/prontuario/agenda/agenda-service-controller';
import { getMonth, isToday } from 'date-fns';
import { AplsCalendarioUtils } from '../../calendario-utils';

@Component({
  selector: 'apls-calendario-mini-mes-dia',
  templateUrl: './calendario-mini-mes-dia.component.html',
  styleUrls: ['./calendario-mini-mes-dia.component.scss']
})
export class AplsCalendarioMiniMesDiaComponent implements OnInit {
  @Input() public diaDoMes: Date;
  @Input() public mesCorrente: Date;

  @Input() public percentual: number = Math.floor(Math.random() * 100) + 0;

  @HostBinding('attr.style')
  public get percentualStyle(): any {
    return this.sanitizer.bypassSecurityTrustStyle(`--var-cor-dia: ${this.definirCorDia()}`);
  }

  get desabilitado(): boolean {
    return getMonth(this.diaDoMes) !== getMonth(this.mesCorrente);
  }

  public isToday = isToday;

  constructor(private sanitizer: DomSanitizer, private agendaServiceController: AgendaServiceController) {}

  ngOnInit() {}

  private definirCorDia(): string {
    return AplsCalendarioUtils.definirCorDia(this.percentual);
  }

  public clickDia() {
    if (!this.desabilitado) {
      this.agendaServiceController.eventoClickNoDia.emit(this.diaDoMes);
    }
  }
}
