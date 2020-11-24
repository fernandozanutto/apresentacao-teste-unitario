import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { OperatorFunction } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { AplsCache, AplsResponse, DateUtils, FormUtils, I18nUtils } from '@apollus-ngx/core';
import { AplsSubTitle, StatusEnum } from '@apollus/common';
import { EpiSelectControllerEvent } from '@apollus/common/componentes/select/epi/epi-select-controller-event';
import { GheService } from '@apollus/modulos/hoe';
import { GrupoRiscoService } from '@apollus/modulos/si';
import { PontoDistribuicaoService } from '@apollus/modulos/so/servicos';
import { DistribuidorService } from '@apollus/modulos/so/servicos/distribuidor';
import { EntregaEpiService } from '@apollusepi/modulos/portal-epi/servicos/entrega-epi';
import { JustificativaService, ParametrosJustificativaEntrega } from '@apollusepi/modulos/portal-epi/servicos/justificativa';
import { AplsModal } from 'libs/orfeu';
import { GestaoEpiRelatoriosControllerEvent } from '../../gestao-epi-relatorios-controller-event';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'gestao-epi-relatorios-entrega-epi',
  templateUrl: './gestao-epi-relatorios-entrega-epi.component.html',
  styleUrls: ['./gestao-epi-relatorios-entrega-epi.component.scss']
})
export class RelatoriosEntregaEpiComponent implements OnInit, OnDestroy {
  public form = this.formBuilder.group({
    area1: [null, Validators.required],
    area2: [null],
    area3: [null],
    funcionario: [null],
    lider: [null],
    ghe: [{ value: null, disabled: true }],
    atividadeCritica: [null],
    familia: [null],
    epi: [null],
    ca: [null],
    situacao: [null],
    registroEntrega: [null],
    pontoDistribuicao: [{ value: null, disabled: true }],
    distribuidor: [{ value: null, disabled: true }],
    status: [['A', 'C']],
    periodoEntregaInicio: [this.dateUtils.somarDias(new Date(), -365), [Validators.required]],
    periodoEntregaFim: [new Date(), Validators.required],
    vencimentoInicio: [null, Validators.required],
    vencimentoFim: [null, Validators.required],
    idioma: [(<any>window).idioma],
    justificativa: [{ value: null, disabled: true }],
    excecao: [null]
  });

  public statusEnum = StatusEnum;

  public lider$: any;
  public iLider = new FormControl('');

  public listaJustificativa: any;
  public familiasSelecionadas = [];

  public listaAtividadesCriticas = [];
  public listaGhePorUnidade = [];
  public listaPontoDistribuicao = [];
  public listaDistribuidores = [];

  public tipoJustificativa = new FormControl('');

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private aplsSubTitle: AplsSubTitle,
    protected aplsCache: AplsCache,
    private justificativaService: JustificativaService,
    private i18nUtils: I18nUtils,
    private entregaEpiService: EntregaEpiService,
    private gestaoEpiRelatoriosControllerEvent: GestaoEpiRelatoriosControllerEvent,
    private grupoRiscoService: GrupoRiscoService,
    private gheService: GheService,
    private pontoDistribuicaoService: PontoDistribuicaoService,
    private distribuidorService: DistribuidorService,
    private dateUtils: DateUtils,
    private aplsModal: AplsModal,
    private formUtils: FormUtils,
    private epiSelectControllerEvent: EpiSelectControllerEvent
  ) {
    this.aplsSubTitle.set([this.translate.instant('label.entrega_epi_geral')]);
  }

  ngOnInit() {
    this.definirChangePesquisaLider();
    this.definirChangeFamilia();
    this.listarAtividadesCriticas();
    this.ouvirEventoGerarRelatorio();
  }

  ngOnDestroy(): void {
    this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiEvt.observers = [];
  }

  /**
   * Realiza o filtro de digite 3 letras para o campo lider.
   */
  private definirChangePesquisaLider(): void {
    this.iLider.valueChanges.pipe(debounceTime(800)).subscribe(input => {
      this.lider$ = null;
      if (input && input.length > 2) this.lider$ = this.gestaoEpiRelatoriosControllerEvent.listarLider(this.form, input);
    });
  }

  private definirChangeFamilia() {
    this.form.get('familia').valueChanges.subscribe(familia => {
      this.familiasSelecionadas = familia;

      if (familia && familia.length > 1) this.form.get('epi').disable();
      else this.form.get('epi').enable();

      this.epiSelectControllerEvent.limparListaEpiEvt.emit();
      this.form.get('epi').patchValue(null);
    });
  }

  private ouvirChangePontoDistribuicao() {
    this.form.get('pontoDistribuicao').valueChanges.subscribe(res => {
      this.listarDistribuidores(res);
      if (res && res.length === 1) {
        this.form.get('distribuidor').enable();
      } else if (res && res.length > 1) {
        this.form.get('distribuidor').disable();
      } else {
        this.form.get('distribuidor').disable();
        this.form.get('distribuidor').reset();
      }
    });
  }

  private listarDistribuidores(pontoDistribuicao: any) {
    this.listaDistribuidores = [];
    let pontosDist = [];
    if (pontoDistribuicao) {
      pontoDistribuicao.forEach((element: { id: any }) => {
        pontosDist.push(element.id);
      });

      this.distribuidorService.listarDistribuidorPorPonto(pontosDist).subscribe(retorno => {
        retorno.objetoResposta.forEach((element: any) => {
          this.listaDistribuidores.push(element);
        });
      });
    }
  }

  private listarAtividadesCriticas() {
    this.listaAtividadesCriticas = [];
    this.grupoRiscoService.listarGrupoRiscoRestricao('A', true).subscribe(d => {
      if (!!d.objetoResposta) {
        for (let atividade of d.objetoResposta) {
          if (atividade[5] === false) {
            this.listaAtividadesCriticas.push({ id: atividade[0], descricao: atividade[2] });
          }
        }
      }
    });
  }

  public changeArea1({ area1 }) {
    if (area1 && area1.length) {
      this.listaGhePorArea(area1);
      this.listarPontosDistribuicao(area1);
      this.form.get('pontoDistribuicao').enable();
      this.form.get('ghe').enable();
    } else {
      this.form.get('pontoDistribuicao').disable();
      this.form.get('ghe').disable();
      this.form.get('pontoDistribuicao').reset();
      this.form.get('ghe').reset();
    }
  }

  public changeArea2({ area2 }) {
    if (area2) {
      this.listarPontosDistribuicao(area2);
    }
  }

  private listarPontosDistribuicao(listArea: any) {
    this.listaPontoDistribuicao = [];
    let area = Array.isArray(listArea) ? listArea.map(area => area.id) : [listArea.id];

    this.pontoDistribuicaoService.listarPontoPorArea(area).subscribe(retorno => {
      this.listaPontoDistribuicao = [...retorno.objetoResposta];
      this.ouvirChangePontoDistribuicao();
    });
  }

  private listaGhePorArea(listArea: any[]) {
    this.listaGhePorUnidade = [];
    if (listArea && listArea.length) {
      this.gheService
        .listarGhesPelaArea(
          listArea.map(area => area.id),
          ['A'],
          'N'
        )
        .subscribe(res => {
          this.listaGhePorUnidade = res.objetoResposta;
        });
    }
  }

  private ouvirEventoGerarRelatorio() {
    this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiEvt.subscribe(() => {
      this.gerarRelatorio();
    });
  }

  private gerarRelatorio(): void {
    this.validarDatas(event);
    if (this.form.valid) {
      this.formUtils.marcarFormGroupIntocado(this.form);

      let {
        area1,
        area2,
        area3,
        funcionario,
        lider,
        ghe,
        atividadeCritica,
        familia,
        epi,
        pontoDistribuicao,
        distribuidor,
        justificativa,
        justificativaExcecao,
        justificativaConfirmacao,
        vencimentoInicio,
        vencimentoFim,
        periodoEntregaInicio,
        periodoEntregaFim,
        ...valuesForm
      } = this.form.value;

      if (vencimentoInicio) vencimentoInicio = vencimentoInicio.getTime();
      if (vencimentoFim) vencimentoFim = vencimentoFim.getTime();
      if (periodoEntregaInicio) periodoEntregaInicio = periodoEntregaInicio.getTime();
      if (periodoEntregaFim) periodoEntregaFim = periodoEntregaFim.getTime();

      if (area1) area1 = Array.isArray(area1) ? area1.map(item => item.id) : [area1.id];
      if (area2) area2 = area2.id;
      if (area3) area3 = area3.id;
      if (funcionario) funcionario = Array.isArray(funcionario) ? funcionario.map(item => item.matricula) : funcionario.matricula;
      if (lider) lider = Array.isArray(lider) ? lider.map(item => item.matricula) : lider.matricula;
      if (ghe) ghe = Array.isArray(ghe) ? ghe.map(item => item.id) : [ghe.id];
      if (atividadeCritica) atividadeCritica = Array.isArray(atividadeCritica) ? atividadeCritica.map(item => item.id) : [atividadeCritica.id];
      if (familia) familia = Array.isArray(familia) ? familia.map(item => item.id) : [familia.id];
      if (epi) epi = Array.isArray(epi) ? epi.map(item => item.id) : [epi.id];
      if (pontoDistribuicao) pontoDistribuicao = Array.isArray(pontoDistribuicao) ? pontoDistribuicao.map(item => item.id) : [pontoDistribuicao.id];
      if (distribuidor) distribuidor = Array.isArray(distribuidor) ? distribuidor.map(item => item.id) : [distribuidor.id];

      if (justificativa) {
        if (this.tipoJustificativa.value === 'confirmacaoEntrega') justificativaConfirmacao = justificativa.id;
        if (this.tipoJustificativa.value === 'epiExcecao') justificativaExcecao = justificativa.id;
      }

      valuesForm = {
        ...valuesForm,
        area1,
        area2,
        area3,
        funcionario,
        lider,
        ghe,
        atividadeCritica,
        familia,
        epi,
        pontoDistribuicao,
        distribuidor,
        justificativaExcecao,
        justificativaConfirmacao,
        vencimentoInicio,
        vencimentoFim,
        periodoEntregaInicio,
        periodoEntregaFim
      };

      this.entregaEpiService.agendarRelatorioGeral(valuesForm).subscribe(() => {
        this.aplsModal.toast(this.translate.instant('mensagem.msg_relatorio_sendo_gerado'), 'I');
      }, (err) => {
        this.aplsModal.toast("Atenção! Este relatório possui muitos dados. Favor refinar os filtros.", 'A');
      });
    } else {
      this.aplsModal.toast(this.translate.instant('mensagem.form_invalido'), 'A');
      this.formUtils.marcarFormGroupTocado(this.form);
    }
  }

  public compararPorID = (a: any, b: any): boolean => {
    if (!b) {
      return false;
    }
    return a.id == b.id;
  };

  public filtrarPorDescricao = (objeto: any, objeto2: any): boolean => {
    let retorno = false;
    if (objeto != 't' && objeto.descricao != null) {
      if (objeto.descricao.toLowerCase().indexOf(objeto2.toLowerCase()) != -1) {
        retorno = true;
      }
    }
    return retorno;
  };

  public tratarValorComboJustificativa(comboValor: { value: string }) {
    if (comboValor.value) {
      this.form.get('justificativa').enable();
    } else {
      this.form.get('justificativa').disable();
      this.form.get('justificativa').reset();
    }

    if (comboValor.value === 'epiExcecao') return this.carregarListaJustificativa({ epiExcecao: true, confirmacaoEntrega: false });
    else if (comboValor.value === 'confirmacaoEntrega') return this.carregarListaJustificativa({ epiExcecao: false, confirmacaoEntrega: true });
  }

  private carregarListaJustificativa(comboValor: {
    epiExcecao: any;
    confirmacaoEntrega: any;
    epiNaoDevolvidoDescontinuado?: any;
    movimentacaoEntrada?: any;
    movimentacaoSaida?: any;
  }) {
    this.justificativaService
      .listarPorTipo(new ParametrosJustificativaEntrega(comboValor))
      .pipe(this.tratarResponseListarPorTipo(this))
      .subscribe(response => {
        this.listaJustificativa = response;
      });
  }

  private tratarResponseListarPorTipo(response: any): OperatorFunction<AplsResponse, AplsResponse> {
    return map(response => {
      if (response.objetoResposta) {
        response = response.objetoResposta
          .filter((res: { status: string }) => res.status === 'A')
          .map((epi: { id: any; status: any }) => {
            return {
              id: epi.id,
              descricao: this.i18nUtils.buscarDescricaoI18nDTO(epi),
              status: epi.status
            };
          });
      }
      return response;
    });
  }

  validarDatas(event: Event) {
    const { vencimentoInicio, vencimentoFim, periodoEntregaInicio, periodoEntregaFim } = this.form.value;
    const isObrigatorio = vencimentoInicio || vencimentoFim || periodoEntregaInicio || periodoEntregaFim;

    this.form.get('periodoEntregaInicio').setValidators([Validators.required]);
    this.form.get('periodoEntregaFim').setValidators([Validators.required]);
    this.form.get('vencimentoInicio').setValidators([Validators.required]);
    this.form.get('vencimentoFim').setValidators([Validators.required]);

    if (isObrigatorio) {
      this.form.get('periodoEntregaInicio').setValidators([]);
      this.form.get('periodoEntregaFim').setValidators([]);
      this.form.get('vencimentoInicio').setValidators([]);
      this.form.get('vencimentoFim').setValidators([]);
    }

    this.form.get('periodoEntregaInicio').updateValueAndValidity();
    this.form.get('periodoEntregaFim').updateValueAndValidity();

    this.form.get('vencimentoInicio').updateValueAndValidity();
    this.form.get('vencimentoFim').updateValueAndValidity();
  }
}
