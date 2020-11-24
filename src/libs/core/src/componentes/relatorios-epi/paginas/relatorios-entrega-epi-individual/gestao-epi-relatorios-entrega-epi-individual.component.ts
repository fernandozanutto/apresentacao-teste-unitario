import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { addMonths } from 'date-fns';

import { FormUtils, CollectionsUtils, AplsCache, UsuarioLogado, StorageUtils, HttpApollus, formatarResponseParaAsync } from '@apollus-ngx/core';
import { AplsSubTitle, StatusEnum } from '@apollus/common';
import { EntregaEpiService } from '@apollusepi/modulos/portal-epi/servicos/entrega-epi';
import { AplsModal } from 'libs/orfeu';
import { GestaoEpiRelatoriosControllerEvent } from '../../gestao-epi-relatorios-controller-event';
import { EpiSelectControllerEvent } from '@apollus/common/componentes/select/epi/epi-select-controller-event';
import { Observable } from 'rxjs';
import { AreaService, PontoDistribuicaoService } from '@apollus/modulos';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'gestao-epi-relatorios-entrega-epi-individual',
  templateUrl: './gestao-epi-relatorios-entrega-epi-individual.component.html',
  styleUrls: ['./gestao-epi-relatorios-entrega-epi-individual.component.scss']
})
export class RelatoriosEntregaEpiIndividualComponent implements OnInit, OnDestroy {
  public statusEnum = StatusEnum;
  public familiasSelecionadas;
  public listaArea1 = [];
  listaArea2: any;
  listaArea3: any;
  public hierarquia1 = '.Unidade';
  public hierarquia2 = '.Area';
  public hierarquia3 = '.Setor';
  public ehPortal = false;
  pontoDistribuicao = this.storageUtils.retornarObjJSON('ponto_distribuicao');

  public form = this.formBuilder.group({
    area1: [null],
    area2: [null],
    area3: [null],
    funcionario: [null, Validators.required],
    familia: [null],
    ca: [null],
    epi: [null],
    periodoEntregaInicio: [addMonths(new Date(), -1), Validators.required],
    periodoEntregaFim: [new Date(), Validators.required],
    situacao: [null],
    registroEntrega: [null],
    excecao: [null],
    exibirCampoAssinaturaRodape: []
  });

  constructor(
    private translate: TranslateService,
    aplsSubTitle: AplsSubTitle,
    private aplsCache: AplsCache,
    private formBuilder: FormBuilder,
    private gestaoEpiRelatoriosControllerEvent: GestaoEpiRelatoriosControllerEvent,
    private http: HttpApollus,
    private aplsModal: AplsModal,
    private formUtils: FormUtils,
    private entregaEpiService: EntregaEpiService,
    private areaService: AreaService,
    private pontoDistribuicaoService: PontoDistribuicaoService,
    private epiSelectControllerEvent: EpiSelectControllerEvent,
    private collectionsUtils: CollectionsUtils,
    private usuarioLogado: UsuarioLogado,
    private storageUtils: StorageUtils
  ) {
    aplsSubTitle.set([translate.instant('label.entrega_epi_individual')]);

    if (this.aplsCache.get('portalEpi')) {
      this.ehPortal = true;
    } else {
      this.ehPortal = false;
    }
  }

  ngOnInit(): void {
    this.tratarHabilitarDesabilitarCampo('area1', false);
    this.tratarHabilitarDesabilitarCampo('area2', false);
    this.tratarHabilitarDesabilitarCampo('area3', false);
    this.definirChangeFamilia();
    this.ouvirEventoGerarRelatorio();
    this.carregarHierarquia();
    this.aplicarChangeArea();
    this.carregarArea1();
  }

  ngOnDestroy(): void {
    this.gestaoEpiRelatoriosControllerEvent.limparEventos();
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

  private ouvirEventoGerarRelatorio() {
    this.gestaoEpiRelatoriosControllerEvent.gerarRelatorioEntregaEpiIndividualEvt.subscribe(() => {
      this.gerarRelatorio();
    });
  }

  private gerarRelatorio() {
    if (this.form.invalid) return this.processarFormInvalido();

    let {
      area1,
      area2,
      area3,
      funcionario,
      familia,
      ca,
      epi,
      periodoEntregaInicio,
      periodoEntregaFim,
      situacao,
      registroEntrega,
      excecao,
      exibirCampoAssinaturaRodape,
      ...valorForm
    } = this.form.value;

    if (periodoEntregaInicio) periodoEntregaInicio = periodoEntregaInicio.getTime();
    if (periodoEntregaFim) periodoEntregaFim = periodoEntregaFim.getTime();

    if (area1) area1 = area1.id;
    if (area2) area2 = area2.id;
    if (area3) area3 = area3.id;
    if (funcionario) funcionario = funcionario.matricula;
    if (familia) familia = Array.isArray(familia) ? familia.map(item => item.id) : [familia.id];
    if (epi) epi = Array.isArray(epi) ? epi.map(item => item.id) : [epi.id];

    valorForm = {
      ...valorForm,
      area1,
      area2,
      area3,
      funcionario,
      familia,
      ca,
      epi,
      periodoEntregaInicio,
      periodoEntregaFim,
      situacao,
      registroEntrega,
      excecao,
      exibirCampoAssinaturaRodape
    };

    this.entregaEpiService.agendarRelatorioEntregaIndividualEpi(valorForm).subscribe(() => {
      this.aplsModal.toast(this.translate.instant('mensagem.msg_relatorio_sendo_gerado'), 'I');
    });
  }

  private processarFormInvalido() {
    this.aplsModal.toast(this.translate.instant('mensagem.form_invalido'), 'A');
    this.formUtils.marcarFormGroupTocado(this.form);
  }

  /**
   * Busca qual item esta marcado para exibição. Considerando a chave ID.
   * @param a Record, item, linha. Opção de um select.
   * @param b Valor setado.
   */
  compararPorID = (a: any, b: any): boolean => {
    if (!b) {
      return false;
    }

    return a.id == b.id;
  };

  /**
   * Método utilizado para filtrar os registros a partir do que for digitando no Campo de Select
   * @param item
   * @param filtro
   */
  filtrarArea(item: any, filtro: any): boolean {
    if (!filtro) {
      return true;
    }

    return (
      item.descricao
        .removerAcentos()
        .toLowerCase()
        .indexOf(filtro.removerAcentos().toLowerCase()) !== -1
    );
  }

  private carregarArea1(): void {
    this.listaArea1 = [...this.aplsCache.get('listaAreasPermissao')];

    if (this.listaArea1 != null) {
      this.tratarHabilitarDesabilitarCampo('area1', true);

      this.listaArea1.sort(this.collectionsUtils.ordenarListaPelaDescricao);

      if (this.listaArea1.length === 1) {
        setTimeout(() => {
          this.form.get('area1').patchValue(this.listaArea1[0], { emitEvent: true });
        }, 1);
      }
    }
  }

  /**
   * Método utilizado para fazer o mapeamento dos campos da Área
   * @param item
   */
  private mapArea(item: Array<any>) {
    let areas = item.map(area => {
      return {
        id: area[0],
        codigo: area[1],
        descricao: area[2]
      };
    });

    return areas;
  }

  /**
   * Retorna uma lista de areas de acordo com o id passado por parametro
   * @param idArea - ID Area
   */
  // private listarAreasPeloNivelId(idArea: number): Observable<any> {
  //   return this.http.cache(`area-${idArea}`, this.areaService.listarAreasPeloNivelId(0, idArea, 'A').pipe(map(formatarResponseParaAsync)));
  // }
  private listarAreasPeloNivelId(idArea: number, nivel): void {
    let evento: Observable<any> = this.http.cache(`area-${idArea}`, this.areaService.listarAreasPeloNivelId(0, idArea, 'A').pipe(map(formatarResponseParaAsync)));

    evento.subscribe(retorno => {
      if (!!retorno && retorno.length > 0) {
        if (nivel == 1) {
          this.listaArea2 = retorno;
        } else if (nivel == 2) {
          this.listaArea3 = retorno;
        }
      }
    });
  }

  private listarAreas2AtivasPontoDistribuicaoArea1(idPonto: number, idArea1: number, nivel: number): void {
    let evento: Observable<any> = this.http.cache(
      `area-${idPonto}-${idArea1}`,
      this.pontoDistribuicaoService.listarAreas2AtivasPontoDistribuicaoArea1(idPonto, idArea1).pipe(map(formatarResponseParaAsync), map(this.mapArea))
    );

    /**
     * Primeiro, verifico se HÁ Áreas de Hierarquia 2 vinculadas a Área 1 do Ponto de Distribuição, caso existam, serão carregadas
     */
    evento.subscribe(retorno => {
      if (!!retorno && retorno.length > 0) {
        if (nivel == 1) {
          this.listaArea2 = retorno;
        } else if (nivel == 2) {
          this.listaArea3 = retorno;
        }
      } else {
        this.listarAreasPeloNivelId(idArea1, nivel);
      }
    });
  }

  private carregarHierarquia() {
    this.usuarioLogado.retornarHierarquiaIdioma().then(hierarquia => {
      this.hierarquia1 = hierarquia.descricao;
      this.hierarquia2 = hierarquia.hierarquiaFilha.descricao;
      this.hierarquia3 = hierarquia.hierarquiaFilha.hierarquiaFilha.descricao;
    });
  }

  private aplicarChangeArea(): void {
    this.form.get('area1').valueChanges.subscribe(area1 => {
      if (!area1) {
        this.resetarCamposArea1();
      } else {
        this.tratarHabilitarDesabilitarCampo('area2', true);

        if (this.ehPortal) {
          this.listarAreas2AtivasPontoDistribuicaoArea1(this.pontoDistribuicao.id, area1.id, 1);
        } else {
          this.listarAreasPeloNivelId(area1.id, 1);
        }
      }
    });

    this.form.get('area2').valueChanges.subscribe(area2 => {
      if (!area2) {
        this.resetarCamposArea2();
      } else {
        this.tratarHabilitarDesabilitarCampo('area3', true);

        if (this.ehPortal) {
          this.listarAreas2AtivasPontoDistribuicaoArea1(this.pontoDistribuicao.id, area2.id, 2);
        } else {
          this.listarAreasPeloNivelId(area2.id, 2);
        }
      }
    });
  }

  /**
   * Método utilizado para resetar os campos vinculado a Área 1
   */
  private resetarCamposArea1(): void {
    this.tratarHabilitarDesabilitarCampo('area2', false);
    this.tratarHabilitarDesabilitarCampo('area3', false);
  }

  private resetarCamposArea2(): void {
    this.tratarHabilitarDesabilitarCampo('area3', false);
  }

  /**
   * Metodo utilizado para habilitar/desabilitar um campo
   * @param campo - identificador do campo
   * @param isHabilita - Flag que informa de habilita ou desabilita o campo
   */
  private tratarHabilitarDesabilitarCampo(campo: string, isHabilita: boolean) {
    this.form.get(campo)[isHabilita ? 'enable' : 'disable']({ emitEvent: false });
  }
}
