import { Component, OnInit, Inject, NgZone, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AplsDialogRef, APLS_DIALOG_DATA, AplsModal } from '@apollus-ngx/orfeu';
import { i18nApollus } from '@apollus/common';

import { FormGroup } from '@angular/forms';
import { BIOMETRIA_MAO_ESQUERDA, BIOMETRIA_MAO_DIREITA } from './biometria.svg';
import { BiometriaService } from '../biometria.service';
import { TranslateService } from '@ngx-translate/core';

/********************************************************
 * @author Jardel Simão
 * @since 01/02/2019
 ********************************************************/

export var COR_BIOMETRIA_VERDE = '#42d242';
export var COR_BIOMETRIA_AMARELO = '#c6c60b';
export var COR_BIOMETRIA_BRANCO = 'white';

/**
 * Interface que encapsula as variáveis e métodos para que de acordo com a implementação seja realizado um comportamento diferente.
 *
 * Atualmente 2 telas utilizam a coleta de biometria
 *
 * - PontoDistribuicaoDistribuidoresComponent
 * - BiometriaListaComponent
 *
 * Elas apresentam comportamentos diferentes. Por isso essa abstração se fez necessário.
 *
 */
export interface ColetaBiometria {
  form: FormGroup;
  listaDigitais: any;
  listaDigitaisColetadas;
  idBiometria?: number;
  dialogRef?: AplsDialogRef<ColetaBiometriaComponent>;
  translate?: TranslateService;
  aplsModal?: AplsModal;

  /**
   * Implementação obrigatória para carregar as digitais na tela.
   *
   * ***Exemplo:***
    ```
    this.listaDigitais = this.form.get('biometria').value;
    setTimeout(() => {
      for (let digital in this.listaDigitais) {
        if (digital != 'id') {
          this.listaDigitaisColetadas[digital] = this.listaDigitais[digital];
          let pathDedo: any = document.querySelector('#' + digital + ' path');
          pathDedo.style.fill = COR_BIOMETRIA_VERDE;
        }
      }
    }, 0);
    ```
    **Obs:** setTimeout necessário para garantir a manipulação da dom
   */
  carregarDigitais();

  /**
   * Implementação obrigatória para fechar o modal da tela.
   *
   * ***Exemplo:***
    ```
    this.form.get('biometria').patchValue(listaDigitais);
    this.dialogRef.close();
    ```
   */
  fecharModal(listaDigitais?);

  /**
   * Implementação obrigatória com a ação do botão salvar
   *
   * ***Exemplo:***
    ```
    this.aplsModal.toast(this.i18n.mensagens.msg_digital_coletada_sucesso, 'I');
    this.fecharModal(this.listaDigitaisColetadas);
    ```
   */
  btnSalvar();
}

@Component({
  selector: 'coleta-biometria',
  templateUrl: 'coleta-biometria.component.html',
  styleUrls: ['coleta-biometria.component.scss']
})
export class ColetaBiometriaComponent implements OnInit {
  /**
   * As imagens estão em svg inline armazenadas nas constantes abaixo instânciadas (BIOMETRIA_MAO_ESQUERDA, BIOMETRIA_MAO_DIREITA).
   */
  MAO_ESQUERDA = BIOMETRIA_MAO_ESQUERDA;
  MAO_DIREITA = BIOMETRIA_MAO_DIREITA;

  dedoEscolhido: string; //Dedo selecionado para obter a digital
  hashDedoColetado: string; //Hash do dedo da primeira coleta realizada
  coletandoDigital = false; //Controla o estado da coleta digital

  listaDigitaisAlterada = false;

  intervalContador: any; //Váriavel que controla o contador do timer da coleta de digital

  idBiometria: number;

  constructor(
    private translate: TranslateService,
    public dialogRef: AplsDialogRef<ColetaBiometriaComponent>,
    @Inject(APLS_DIALOG_DATA) public coletaBiometria: ColetaBiometria,
    public router: Router,
    public aplsModal: AplsModal,
    private biometriaservice: BiometriaService,
    private _ngZone: NgZone
  ) {}

  ngOnInit() {
    this.definirInstanciaObjetos();
    this.coletaBiometria.carregarDigitais();
    this.ocultarTemplateColetaDigital();
    this.adicionarBindMetodoOnClickSelecionarDedo();
  }

  /**
   * Inicializa a instância dos objetos para utiliza-los
   */
  private definirInstanciaObjetos() {
    this.coletaBiometria.dialogRef = this.dialogRef; //Necessário para conseguir fazer o close na implementação do método coletaBiometria.fecharModal
    this.coletaBiometria.aplsModal = this.aplsModal;
  }

  /**
   * Oculta os elementos HTMLs do processo de coleta de digital
   */
  private ocultarTemplateColetaDigital() {
    this.ocultarElementosHtml(['dv-digitais-direita', 'dv-digitais-esquerda', 'dv-alerta', 'img-coleta-01', 'img-coleta-02', 'img-coleta-03', 'img-coleta-04']);
  }

  /**
   * Necessário para que o svg da mão identifique esse método
   */
  private adicionarBindMetodoOnClickSelecionarDedo() {
    (<any>window).onClickSelecionarDedo = this.onClickSelecionarDedo.bind(this);
  }

  /**
   * Percorre os elementos HTML passados por parâmento setando o display para none
   *
   * @param idsElementosHtml
   */
  private ocultarElementosHtml(idsElementosHtml: string[]) {
    idsElementosHtml.forEach(elemento => {
      document.getElementById(elemento).style.display = 'none';
    });
  }

  /**
   * Função que retorna o Dedo clicado.
   * @param dedo - este parametro vem do svg e traz consigo o dedo selecionado
   */
  onClickSelecionarDedo(dedo: string) {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.run(() => {
        if (this.coletandoDigital) {
          return;
        }

        this.dedoEscolhido = dedo; //seta em uma váriavel de escopo global para ser utilizado em outros métodos
        if (this.isDigitalColetada(dedo)) {
          this.mostrarModalExclusao(dedo);
          return;
        }

        this.coletarDigital(dedo);
      });
    });
  }

  /**
   * Verifica se a digital já foi coletada
   */
  private isDigitalColetada(dedo: string) {
    return !!this.coletaBiometria.listaDigitaisColetadas[dedo];
  }

  private mostrarModalExclusao(dedo: string) {
    this.aplsModal.alert({
      texto: this.translate.instant('mensagem.deseja_realmente_excluir'),
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.cancelar'),
          color: 'light'
        },
        {
          nome: this.translate.instant('label.excluir'),
          color: 'primary',
          handler: () => {
            this.excluirDigital(dedo);
          }
        }
      ]
    });
  }

  private excluirDigital(dedo: string) {
    this.listaDigitaisAlterada = true;
    let svgDedoSelecionado: any = document.querySelector('#' + dedo + ' path');
    svgDedoSelecionado.style.fill = COR_BIOMETRIA_BRANCO;
    delete this.coletaBiometria.listaDigitaisColetadas[dedo];
    localStorage.setItem('biometria', JSON.stringify(this.coletaBiometria.listaDigitaisColetadas));
  }

  private coletarDigital(dedo: string) {
    this.atualizarMensagemTextoInformativo(this.buscarTextoInsercaoDedo(dedo));
    this.alterarCorDedo(COR_BIOMETRIA_AMARELO);
    this.coletandoDigital = true;

    if (dedo.includes('Esquerdo')) {
      this.coletarDigitalAsync('esquerda');
    } else {
      this.coletarDigitalAsync('direita');
    }
  }

  /**
   * Atualiza o texto do elemento html h-texto-informativo
   * @param mensagem
   */
  private atualizarMensagemTextoInformativo(mensagem: string) {
    document.getElementById('h-texto-informativo').innerText = mensagem;
  }

  /**
   * Retorna a mensagem de acordo com o dedo informado. Ex: 'Insira o dedo Anelar Esquerdo'
   */
  private buscarTextoInsercaoDedo(dedo: string): string {
    return `${this.translate.instant('label.insira_o_dedo')} ${this.translate.instant('label.biometria_' + dedo)}`;
  }

  /**
   * Altera a cor do dedo escolhido de acordo com o parâmetro enviado
   *
   * @param cor
   */
  private alterarCorDedo(cor: string): void {
    let pathDedo: any = document.querySelector('#' + this.dedoEscolhido + ' path');
    pathDedo.style.fill = cor;
  }

  /**
   * Método assíncrono utilizado para coleta de digital.
   *
   * Utilizado para coleta de ambas as mãos (esquerda e direita). No ínicio do método algumas constantes se fazem necessário para o funcionamento correto.
   *
   * Para facilitar o entendimento. Considere que temos 4 zonas (01, 02, 03 e 04) para cada coleta realizada.
   *
   * - Na dv-digitais-esquerda encontrasse as zonas 03 e 04 e
   *
   * - Na dv-digitais-direita encontrasse as zonas 01 e 02
   *
   * Através dessas zonas é realizado uma série de controles para ocultar/mostrar, bloquear/desbloquear.
   *
   * **Fluxo:** Na prática esse método é chamado passando a mão (esquerda ou direita) com parâmetro onde se espera a realização de 2 coletas de um mesmo dedo. Coleta 1 corresponde com a Coleta 2?
   *
   * - Sim: Desbloqueia o botão cancelar e finalizar coleta;
   * - Não: Reinicia o processo da coleta
   * - Tempo excedido: Caso passe o tempo limite de 12 segundos para determinada coleta, o sistema apresenta uma mensagem e aborta a operação.
   *
   * @param mao esquerda | direita
   */
  private async coletarDigitalAsync(mao: 'esquerda' | 'direita') {
    const maoOposta = mao === 'esquerda' ? 'direita' : 'esquerda';
    const primeiraDigitalMao = mao === 'esquerda' ? '01' : '03'; //01 ou 03
    const segundaDigitalMao = mao === 'esquerda' ? '02' : '04'; //02 ou 04
    const primeiraDigitalMaoOposta = maoOposta === 'esquerda' ? '01' : '03'; //01 ou 03
    const segundaDigitalMaoOposta = maoOposta === 'esquerda' ? '02' : '04'; //02 ou 04

    this.bloquearElementosHtml([`dv-mao-${mao}`, `dv-digitais-${maoOposta}`, `dv-loader-${maoOposta}-${primeiraDigitalMao}`]);
    this.ocultarElementosHtml([
      `dv-mao-${maoOposta}`,
      'dv-menu-modal',
      `h-${maoOposta}`,
      `dv-loader-${maoOposta}-${segundaDigitalMao}`,
      `img-coleta-${primeiraDigitalMaoOposta}`,
      `img-coleta-${segundaDigitalMaoOposta}`
    ]);

    this.contadorDescrescente(`dv-contador-${primeiraDigitalMao}`);
    this.adicionarClassePorId(`dv-box-digital-${primeiraDigitalMao}`, 'dv-box-digital-coletando');
    try {
      // INICIANDO COLETA 1
      const retornoColetarDigital: any = await this.biometriaservice.coletarDigital();
      this.hashDedoColetado = retornoColetarDigital.objetoResposta;

      this.contadorDescrescente(`dv-contador-${segundaDigitalMao}`);
      this.bloquearElementosHtml(['dv-alerta', `img-coleta-${primeiraDigitalMaoOposta}`, `dv-loader-${maoOposta}-${segundaDigitalMao}`]);
      this.ocultarElementosHtml([`dv-loader-${maoOposta}-${primeiraDigitalMao}`]);
      this.atualizarMensagemAlerta(this.translate.instant('mensagem.insira_novamente_o_dedo'));
      this.removerAdicionarClassePorId(`dv-box-digital-${primeiraDigitalMao}`, 'dv-box-digital-coletando', 'dv-box-digital-coletado');
      this.removerAdicionarClassePorId(`dv-box-digital-${segundaDigitalMao}`, 'dv-box-digital', 'dv-box-digital-coletando');

      // INICIANDO COLETA 2
      const respostaComprarDigital: any = await this.biometriaservice.compararDigital([this.hashDedoColetado]);

      this.ocultarElementosHtml([`dv-loader-${maoOposta}-${segundaDigitalMao}`]);
      this.removerAdicionarClassePorId(`dv-box-digital-${segundaDigitalMao}`, 'dv-box-digital-coletando', 'dv-box-digital-coletado');

      if (this.isDigitalCorresponde(respostaComprarDigital)) {
        clearInterval(this.intervalContador);
        this.bloquearElementosHtml([`img-coleta-${segundaDigitalMaoOposta}`]);
        this.removerAdicionarClassePorId('dv-alerta', 'alert-warning', 'alert-success');
        this.atualizarMensagemAlerta(this.translate.instant('mensagem.digitais_conferem'));

        setTimeout(() => {
          this.finalizarColeta();
        }, 1000);
      } else {
        this.prepararNovaTentativa(primeiraDigitalMao, segundaDigitalMao);
        this.coletarDigitalAsync(mao);
      }
    } catch ({ error }) {
      clearInterval(this.intervalContador);

      let mensagemI18N = '';
      let tipoAlerta = error.tipoAlerta || 'E';

      switch (error.mensagem) {
        case 'msg_digitais_nao_correspondentes':
          mensagemI18N = 'mensagem.digitais_nao_correspondentes';
          break;

        case 'msg_biometria_falha_ao_coletar_biometria':
          mensagemI18N = 'mensagem.falha_ao_coletar_biometria';
          break;

        case 'msg_biometria_falha_conexao_dispositivo':
          mensagemI18N = 'mensagem.falha_conexao_dispositivo';
          break;

        case 'msg_biometria_usuario_nao_colocou_digital':
          mensagemI18N = 'mensagem.usuario_nao_colocou_digital';
          break;

        case 'msg_biometria_as_digitais_nao_conferem':
          mensagemI18N = 'mensagem.digitais_nao_conferem';
          break;

        case 'msg_biometria_insira_novamente_o_dedo_no_leitor':
          mensagemI18N = 'mensagem.insira_novamente_o_dedo';
          break;

        case 'msg_funcionario_nao_possui_digital':
          mensagemI18N = 'mensagem.funcionario_nao_possui_digital';
          break;

        case 'msg_digital_nao_corresponde':
          mensagemI18N = 'mensagem.digital_nao_corresponde';
          break;

        case 'msg_digitais_conferem':
          mensagemI18N = 'mensagem.digitais_conferem';
          break;

        default:
          mensagemI18N = 'mensagem.nao_foi_possivel_localizar_dispositivo';
          break;
      }

      this.aplsModal.toast(this.translate.instant(mensagemI18N), tipoAlerta);

      this.cancelarColeta();

      return error;
    }
  }

  /**
   * Controla a apresentação do relógio (12 - 0) de forma descrecente no HTML
   *
   * @param idDivContador dv-contador-01 | dv-contador-02 | dv-contador-03 | dv-contador-04
   */
  private contadorDescrescente(idDivContador: string) {
    let contador: any = 12;
    document.getElementById(idDivContador).innerHTML = contador;
    clearInterval(this.intervalContador);

    this.intervalContador = setInterval(function() {
      document.getElementById(idDivContador).innerHTML = contador;
      contador--;
    }, 920);
  }

  /**
   * Percorre os elementos HTML passados por parâmento setando o display para block
   *
   * @param idsElementosHtml
   */
  private bloquearElementosHtml(idsElementosHtml: string[]) {
    idsElementosHtml.forEach(elemento => {
      document.getElementById(elemento).style.display = 'block';
    });
  }

  /**
   * Atualiza a mensadem da dv-alerta
   */
  private atualizarMensagemAlerta(mensagem: string) {
    document.getElementById('dv-alerta').innerText = mensagem;
  }

  private adicionarClassePorId(idElementoHtml: string, classeAdicionar: string) {
    document.getElementById(idElementoHtml).classList.add(classeAdicionar);
  }

  private removerClassePorId(idElementoHtml: string, classeRemover: string) {
    document.getElementById(idElementoHtml).classList.remove(classeRemover);
  }

  /**
   * Remove e adiciona uma classe para determinado id
   */
  private removerAdicionarClassePorId(idElementoHtml: string, classeRemover: string, classeAdicionar: string) {
    this.removerClassePorId(idElementoHtml, classeRemover);
    this.adicionarClassePorId(idElementoHtml, classeAdicionar);
  }

  /**
   * Verifica se existe correspondencia entre a primeira e a segunda digital coletada
   * @param respostaComprarDigital
   */
  private isDigitalCorresponde(respostaComprarDigital: any) {
    return respostaComprarDigital.objetoResposta;
  }

  /**
   * Caso a comparação de digital entre a primeira e segunda coleta não corresponda é realizado a preparação para uma nova tentativa
   */
  private prepararNovaTentativa(primeiraDigitalMao: string, segundaDigitalMao: string) {
    this.removerAdicionarClassePorId(`dv-box-digital-${primeiraDigitalMao}`, 'dv-box-digital-coletado', 'dv-box-digital-coletando');
    this.removerAdicionarClassePorId(`dv-box-digital-${segundaDigitalMao}`, 'dv-box-digital-coletado', 'dv-box-digital');
    this.removerAdicionarClassePorId('dv-alerta', 'alert-success', 'alert-warning');
    this.atualizarMensagemAlerta(this.translate.instant('mensagem.digitais_nao_conferem'));
  }

  /**
   * Caso as 2 digitais coletadas correspondam esse método é chamado
   */
  private finalizarColeta() {
    this.listaDigitaisAlterada = true;
    this.coletaBiometria.listaDigitaisColetadas[this.dedoEscolhido] = this.hashDedoColetado;
    this.alterarCorDedo(COR_BIOMETRIA_VERDE);
    this.limparColetaBiometria();
  }

  /**
   * Após iniciado o processo de coleta, caso ocorra um erro no método coletarDigitalAsync esse método é chamado
   */
  private cancelarColeta() {
    this.limparColetaBiometria();
    this.alterarCorDedo(COR_BIOMETRIA_BRANCO);
    this.atualizarMensagemTextoInformativo(this.translate.instant('label.selecione_o_dedo'));
  }

  /**
   * Limpa o processo de coleta de biometria resetando ao estado inicial
   */
  private limparColetaBiometria() {
    this.resetarDivBoxDigital();
    this.bloquearElementosHtml(['dv-menu-modal', 'dv-mao-esquerda', 'dv-mao-direita']);
    this.ocultarElementosHtml(['dv-digitais-direita', 'dv-digitais-esquerda', 'dv-alerta']);
    this.ocultarElementosHtml(['dv-digitais-direita', 'dv-digitais-esquerda', 'dv-alerta']);
    this.atualizarMensagemTextoInformativo(this.translate.instant('label.selecione_o_dedo'));
    this.removerAdicionarClassePorId('dv-alerta', 'alert-success', 'alert-warning');
    this.bloquearElementosHtml(['h-esquerda', 'h-direita']);
    this.coletandoDigital = false;
  }

  private resetarDivBoxDigital() {
    const div = 'dv-box-digital-0';
    for (let index = 1; index <= 4; index++) {
      this.removerClassePorId(`${div}${index}`, 'dv-box-digital-coletado');
      this.removerClassePorId(`${div}${index}`, 'dv-box-digital-coletando');
      this.adicionarClassePorId(`${div}${index}`, 'dv-box-digital');
    }
  }

  btnFecharModal($event) {
    if (this.listaDigitaisAlterada) {
      this.aplsModal.popup($event.target as ElementRef, {
        titulo: this.translate.instant('label.atencao'),
        mensagem: this.translate.instant('mensagem.existe_informacoes_nao_foram_salvas'),
        tipo: 'A',
        botoes: [
          {
            nome: this.translate.instant('label.sair_sem_salvar'),
            color: 'light',
            handler: () => {
              this.coletaBiometria.fecharModal(this.coletaBiometria.listaDigitais);
            }
          },
          {
            nome: this.translate.instant('label.salvar_sair'),
            handler: () => {
              this.coletaBiometria.btnSalvar();
            }
          }
        ]
      });
    } else {
      this.coletaBiometria.fecharModal(this.coletaBiometria.listaDigitais);
    }
  }

  btnSalvar() {
    this.coletaBiometria.btnSalvar();
  }
}
