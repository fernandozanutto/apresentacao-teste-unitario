import { Component } from '@angular/core';

import { ModalRelatorioService } from '@apollus/paginas/aplicacao';
import { AplsTitle } from 'libs/orfeu';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'gestao-epi-relatorios-raiz',
  templateUrl: './gestao-epi-relatorios-raiz.component.html',
  styleUrls: ['./gestao-epi-relatorios-raiz.component.scss']
})
export class RelatoriosRaizComponent {
  constructor(private translate: TranslateService, aplsTitle: AplsTitle, private modalRelatorioService: ModalRelatorioService) {
    aplsTitle.set(this.translate.instant('label.so_gestao_epi'));
  }

  btnAbrirRelatorio() {
    this.modalRelatorioService.abrirModalRelatorio();
  }
}
