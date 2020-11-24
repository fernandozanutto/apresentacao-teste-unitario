import { EventEmitter, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/Observable';
import { AplsTitle, AplsModal } from '@apollus-ngx/orfeu';

import { AplsResponse } from '../interfaces';
import { TelaCadastroBase } from './tela-cadastro-base';
import { AplsCache } from '../cache';
import { AplsUnload } from '../unload';
import { i18nApollus } from '@apollus/common';
import { TranslateService } from '@ngx-translate/core';

/**
 * É disparado aqui. Somente o frameInsereLista está inscrito até o momento.
 */
export const RESETA_TELA = new EventEmitter();

/**
 * Deve ser disparado no detalhar do cadastro quando entra no modo edição.
 * Somente o frameInsereLista está inscrito.
 */
export const POPULA_LISTAS = new EventEmitter();

/**
 * Essa classe é usada nas telas de cadastro. Nela é feito os controles de estado padrão para telas cadastro.
 *
 * Recuperar da api, colocar em edição, detectar se é novo cadastro ou atualização, checar se pode sair sem confirmar, etc...
 *
 * @author Thiago Ramos
 */
export class TelaCadastro extends TelaCadastroBase {
  /**
   * [IMPORTANTE]
   *
   * Essa é a propriedade que se guarda o form para a tela de cadastro.
   *
   * Sua entrada e saida deve ser o mais limpa possivel, se aproximando ao maximo
   * do que a api espera como envio.
   *
   * DEVE ser definido na classe que irá extender de "TelaCadastro".
   */
  formCadastro: FormGroup;

  /**
   * Guarda o serviço da tela. Usado para enviar ou atualizar registro.
   *
   * Deve ser inserido em toda chamada. (Possui problema de perder o this quando passa a referencia da função).
   *
   * DEVE ser definido na classe que irá extender de "TelaCadastro".
   */
  servicoPrincipal: Function;

  /**
   * Usado como chave para pegar e setar o cache das telas.
   *
   * DEVE ser definido na classe que irá extender de "TelaCadastro".
   */
  NomeModulo;

  /**
   * Valor que o form deve ter
   */
  formValuePadrao: any;

  /**
   * Guarda o subscribe do valueChange do form princial
   */
  formCadastroEvtRef: Subscription;

  /**
   * Guarda o subscribe do param change.
   */
  rotaParametroEvtRef: Subscription;

  /**
   * Precisa ser populado para botão de voltar funcionar.
   */
  urlLista: string;

  /**
   * Refrencia do botão de salvar.
   */
  elSalvar: null;

  /**
   * Só precisa ser importado.
   */
  i18n: i18nApollus;

  translate: TranslateService;

  /**
   * [LIFECYCLE]
   * Deve ser implementado esse metodo no componente.
   */
  onSalvarRetornoSucesso(resp: AplsResponse) {}

  /**
   * [LIFECYCLE]
   * Deve ser implementado esse metodo no componente.
   */
  onSalvarRetornoErro(resp: AplsResponse) {}

  /**
   * [LIFECYCLE]
   * Chamado quando entra na tela para editar um item, passando o id na url.
   * @param id ID retornado pela api.
   */
  onModoEdicao(id: number) {}

  /**
   * [LIFECYCLE]
   * Chamado quando entra na tela e não possui id na url, send então um modo cadastro.
   */
  onModoCadastro() {}

  /**
   * [LIFECYCLE]
   * Chamado quando o form é resetado ao valor padrão.
   */
  onResetaForm() {}

  /**
   * [LIFECYCLE]
   * Chamado antes do serviço enviar os dados para api.
   *
   * Entra o valor do formGroup definido e deve sair o objeto que a api espera.
   *
   * Essa função por usa vez limpa todas as propriedades que são nulas do form.
   *
   * Cuidado com campos multi select, eles podem ser um problema.
   */
  onTratarForm(form: any): any {
    return form;
  }

  regraNovo = () => this.controles.estado == 'visualizacao' && this.controles.permissoes.cadastro;

  regraSalvar = () => this.controles.estado != 'edicao';

  /**
   *
   * @param aplsRota
   * @param activatedRoute
   * @param aplsCache
   * @param router
   * @param aplsModal Não é obrigatorio, porem é necessario para usar funções de modal.
   */
  constructor(
    aplsRota: AplsTitle,
    protected activatedRoute: ActivatedRoute,
    public aplsCache: AplsCache,
    public router: Router,
    public aplsModal?: AplsModal,
    public aplsUnload?: AplsUnload
  ) {
    super(aplsRota, aplsUnload);
  }

  ngAfterContentInit() {
    // Testa se o objeto de rota realmente existe e se vai ter um observable esperando a gente.
    if (!!this.activatedRoute && !!this.activatedRoute.queryParams && this.activatedRoute.queryParams instanceof Observable) {
      this.rotaParametroEvtRef = this.activatedRoute.queryParams.subscribe(params => {
        // Testa se na url tem a propriedade id
        if (params.hasOwnProperty('id')) {
          if (this.controles.idRegistro != params.id) {
            // Verifica se tem acesso para a função.
            if (!this.controles.permissoes.edicao) {
              this.aplsModal.toast(this.i18n.mensagens.msg_sem_acesso_funcao, 'A');
              if (this.urlLista) {
                this.router.navigate([this.urlLista]);
              }
              return;
            }

            this.controles.idRegistro = params.id;
            this.formCadastro.addControl('id', new FormControl(params.id));
            this.onModoEdicao(params.id);
            this.controles.modoEdicao = true;
          }
        } else {
          // Verifica se tem acesso para a função.
          if (!this.controles.permissoes.cadastro) {
            this.aplsModal.toast(this.i18n.mensagens.msg_sem_acesso_funcao, 'A');
            if (this.urlLista) {
              this.router.navigate([this.urlLista]);
            }
            return;
          }

          this.onModoCadastro();
          this.controles.estado = 'novo';
          if (this.controles.modoEdicao) {
            this.controles.modoEdicao = false;
          }
        }
      });
    }

    // Caso o form da tela seja o padrão(formCadastro), observa se teve mudança.
    this.formCadastroEvtRef = this.formCadastro.valueChanges.subscribe(d => {
      this.controles.teveAlteracao = true;
      this.controles.modoVisualizacao = false;
      this.controles.estado = 'edicao';
      if (this.aplsUnload) this.aplsUnload.bloqueia();
    });
  }

  /**
   * Leva a tela para o estado de inserção.
   */
  btnResetarTela() {
    super.btnResetarTela();

    // Limpa a url para tirar o id no query param
    if (!!this.router && this.controles.modoEdicao) {
      this.router.navigate([], {
        queryParams: { id: undefined },
        queryParamsHandling: 'merge',
        skipLocationChange: true
      });
      this.controles.modoEdicao = false;
    }

    // Componentes filhos que abstraem de FrameInsereLista ficam ouvindo esse evento.
    RESETA_TELA.emit();
    if (this.aplsUnload) this.aplsUnload.desbloqueia();
  }

  // Botão cancelar
  btnVoltaLista($event) {
    if (this.aplsUnload && this.aplsUnload.travaSaidaPagina) {
      this.confirmaSairTela($event);
    } else {
      this.sairDaTela();
    }
  }

  confirmaSairTela($event) {
    if (this.aplsModal) {
      if (navigator.userAgent.indexOf('MSIE') == -1) {
        this.aplsModal.popup($event.target as ElementRef, {
          titulo: this.translate.instant('label.atencao'),
          mensagem: this.translate.instant('mensagem.existe_informacoes_nao_foram_salvas'),
          tipo: 'A',
          enableClose: true,
          botoes: [
            {
              nome: this.translate.instant('mensagem.sair_sem_salvar'),
              color: 'light',
              handler: () => this.sairDaTela()
            },
            {
              nome: this.translate.instant('label.salvar_sair'),
              handler: () => {
                this.controles.voltaListaQuandoSalvar = true;
                this.btnSalvar();
              }
            }
          ]
        });
      }
    } else {
      console.log('Metodo "confirmaSairTela" não foi executado pois aplsModal não foram importados.');
    }
  }

  sairDaTela() {
    if (this.aplsUnload) this.aplsUnload.desbloqueia();
    if (this.urlLista) {
      this.router.navigate([this.urlLista]);
    }
  }

  /**
   * Disponibiliza a função de save da tela.
   *
   * Pode ser chamada direto no template.
   */
  btnSalvar($event?): any {
    if (!this.elSalvar && $event) {
      this.elSalvar = $event.target;
    }

    if (!this.controles.teveAlteracao) {
      return false;
    }

    super.btnSalvar();
  }

  btnDuplicar() {
    this.formCadastro.get('id').patchValue('');
    this.formCadastro.get('codigo').patchValue('');
    this.formCadastro.get('codigo').enable({ onlySelf: true, emitEvent: false });

    // Limpa a url para tirar o id no query param
    if (!!this.router) {
      this.router.navigate([], {
        queryParams: { id: undefined },
        queryParamsHandling: 'merge',
        skipLocationChange: true
      });
    }
  }

  /**
   * É chamado quando a requisição http retorna com sucesso e a api retorna como sucesso.
   *
   * Dispara a função onSalvarRetornoSucesso que pode ser implementada no componente.
   *
   * @param resp Resposta padrão da apollus da api.
   */
  tratarRetornoSucesso(resp: AplsResponse) {
    super.tratarRetornoSucesso(resp);

    if (this.router) {
      // Adiciona o id da alteração na url caso o usuario de F5 não entra em uma tela nova de cadastro.
      this.router.navigate([], {
        queryParams: { id: resp.objetoResposta },
        queryParamsHandling: 'merge',
        skipLocationChange: true
      });
    }

    if (!!this.NomeModulo && !!this.aplsCache) {
      // Deleta o cache da tela de lista.
      this.aplsCache.delete(this.NomeModulo);
    }

    if (!!this.formCadastro) {
      // Desmarca os campos
      this.marcarFormGroupIntocado(this.formCadastro);
    }

    setTimeout(() => {
      this.controles.estado = 'visualizacao';
    });

    // Sai da tela após realizar a ação de salvar
    if (this.controles.voltaListaQuandoSalvar) {
      this.controles.voltaListaQuandoSalvar = false;
      this.sairDaTela();
    }
  }

  /**
   * Modal que pergunta se usuario quem realizar um novo cadastro.
   */
  perguntaNovaInsercao() {
    // Se a tela tem uma saida programada ele não deve perguntar
    if (this.elSalvar) {
      this.aplsModal.popup(this.elSalvar, {
        titulo: 'Atenção!',
        mensagem: 'Deseja incluir um novo item?',
        tipo: 'A',
        botoes: [
          {
            nome: 'Cancelar',
            color: 'light'
          },
          {
            nome: 'Novo',
            handler: () => {
              this.btnResetarTela();
            }
          }
        ]
      });
    } else {
      console.log('Modal para resetar tela não foi chamada pois viewContainerRef e aplsModal não foram importados.');
    }
  }
}
