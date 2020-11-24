import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GestaoEpiRelatoriosControllerEvent } from '../../gestao-epi-relatorios-controller-event';
import { AplsCache } from '@apollus-ngx/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'gestao-epi-relatorios-home',
  templateUrl: './gestao-epi-relatorios-home.component.html',
  styleUrls: ['./gestao-epi-relatorios-home.component.scss']
})
export class RelatoriosHomeComponent {
  public url = '';

  public exibirBotaoMenuPortal = false;

  public menuArray = [];

  constructor(
    private translate: TranslateService,
    private elRef: ElementRef,
    private router: Router,
    private gestaoEpiRelatoriosControllerEvent: GestaoEpiRelatoriosControllerEvent,
    protected aplsCache: AplsCache
  ) {
    if (this.aplsCache.get('portalEpi')) {
      this.url = '/relatorios-epi';
      this.exibirBotaoMenuPortal = true;
    } else {
      this.url = '/so/gestaoepi/relatorios';
      this.exibirBotaoMenuPortal = false;
    }
  }

  ngOnInit(): void {
    this.menuArray = [
      {
        descricao: this.translate.instant('label.entrega_epi_geral'),
        icone: 'fas fa-bell',
        status: '',
        class: 'btn-light border-left-size border-left-color-blue entrega-epi-geral',
        route: this.url + '/entrega-epi-geral'
      },
      {
        descricao: this.translate.instant('label.entrega_epi_individual'),
        icone: 'fas fa-archive',
        status: '',
        class: 'btn-light border-left-size border-left-color-red entrega-epi-individual',
        route: this.url + '/entrega-epi-individual'
      },
      {
        descricao: this.translate.instant('label.movimentacoes'),
        icone: 'fas fa-building',
        status: '',
        class: 'btn-light border-left-size border-left-color-orange disabled movimentacoes',
        route: ''
      },
      {
        descricao: this.translate.instant('label.estoque'),
        icone: 'fas fa-chart-area',
        status: '',
        class: 'btn-light border-left-size border-left-color-green disabled estoque',
        route: ''
      }
    ];

    if (this.exibirBotaoMenuPortal) {
      // this.menuArray[0].route = '';
    }
  }

  ngAfterViewInit() {
    this.navegarRota({ route: this.router.url });
  }

  public navegarRota(item) {
    if (!item.route) return;

    if (!this.exibirBotaoMenuPortal) {
      this.ativarMenu(item.route.substring(25));
    } else {
      this.ativarMenu(item.route.substring(16));
    }
    this.router.navigate([item.route]);
  }

  private ativarMenu(menuAtivar: string) {
    let menus = ['entrega-epi-geral', 'entrega-epi-individual', 'movimentacoes', 'estoque'];

    menus.forEach(menu => {
      if (menu === menuAtivar) return this.elRef.nativeElement.querySelector(`.${menu}`).classList.add('active');

      this.elRef.nativeElement.querySelector(`.${menu}`).classList.remove('active');
    });
  }

  public btnGerarRelatorio() {
    switch (this.router.url) {
      case '/so/gestaoepi/relatorios/entrega-epi-geral':
        this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiEvt.emit();
        break;

      case '/so/gestaoepi/relatorios/entrega-epi-individual':
        this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiIndividualEvt.emit();
        break;
      case '/relatorios-epi/entrega-epi-geral':
        this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiEvt.emit();
        break;

      case '/relatorios-epi/entrega-epi-individual':
        this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiIndividualEvt.emit();
        break;
      default:
        break;
    }
  }
}
