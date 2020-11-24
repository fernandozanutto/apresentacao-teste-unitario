import { Component, Input, OnInit } from '@angular/core';
import { getMonth, isToday, isWeekend } from 'date-fns';
import { AplsCalendarioUtils } from '../calendario-utils';

@Component({
  selector: 'apls-calendario-mini-mes',
  templateUrl: './calendario-mini-mes.component.html',
  styleUrls: ['./calendario-mini-mes.component.scss']
})
export class AplsCalendarioMiniMesComponent implements OnInit {
  public DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  public semanas: Date[] = [];

  private _mes: Date;
  public get mes(): Date {
    return this._mes;
  }
  @Input()
  public set mes(v: Date) {
    this._mes = v;
    this.semanas = AplsCalendarioUtils.retornaSemanasDoMes(v, { forceSixRows: true });
  }

  @Input() mostrarDescricaoMes: boolean = true;

  public isWeekend = isWeekend;
  public isToday = isToday;
  public getMonth = getMonth;

  constructor() {}

  ngOnInit() {}
}
