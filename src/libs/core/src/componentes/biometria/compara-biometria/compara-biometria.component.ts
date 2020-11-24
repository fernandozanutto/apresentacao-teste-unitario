import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AplsDialogRef, AplsModal, APLS_DIALOG_DATA } from '@apollus-ngx/orfeu';
import { BiometriaService } from '../biometria.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Objeto que encapscula os dados de entrada para o modal ComparaBiometriaComponent
 */
export interface ComparaBiometria {
  entidade: string;
  formCadastro: FormGroup;
  digitais: Array<string>;
  dialogRef?: AplsDialogRef<ComparaBiometriaComponent>;
  aplsModal?: AplsModal;
  translate?: TranslateService;
  dvPosicao?: ElementRef;

  inicializarDigitalNaoCadastrada();
  finalizarComparacaoDigital();
}

@Component({
  selector: 'compara-biometria',
  templateUrl: 'compara-biometria.component.html',
  styleUrls: ['compara-biometria.component.scss']
})
export class ComparaBiometriaComponent implements OnInit {
  @ViewChild('dvPosicao') dvPosicao: ElementRef;
  @ViewChild('dvBoxDigital') dvBoxDigital: ElementRef<HTMLDivElement>;

  intervalContador: any; //Váriavel que controla o contador do timer da coleta de digital

  constructor(
    @Inject(APLS_DIALOG_DATA) public comparaBiometria: ComparaBiometria,
    private translate: TranslateService,
    private dialogRef: AplsDialogRef<ComparaBiometriaComponent>,
    private biometriaService: BiometriaService,
    private aplsModal: AplsModal
  ) {}

  ngOnInit() {
    this.definirInstanciaObjetos();
    this.inicializar();
  }

  /**
   * Inicializa a instância dos objetos para utiliza-los
   */
  private definirInstanciaObjetos() {
    this.comparaBiometria.dialogRef = this.dialogRef;
    this.comparaBiometria.aplsModal = this.aplsModal;
    this.comparaBiometria.dvPosicao = this.dvPosicao;
  }

  private inicializar() {
    setTimeout(() => {
      if (this.existeDigitalCadastrada(this.comparaBiometria.digitais)) {
        this.compararDigital(this.comparaBiometria.digitais);
      } else {
        this.comparaBiometria.inicializarDigitalNaoCadastrada();
      }
    }, 0);
  }

  private existeDigitalCadastrada(digitais: any): boolean {
    return digitais != null;
  }

  async compararDigital(digitais) {
    try {
      this.contadorDescrescente('dv-contador');
      const respostaComprarDigital: any = await this.biometriaService.compararDigital(digitais);

      if (this.isDigitalCorresponde(respostaComprarDigital)) {
        clearInterval(this.intervalContador);

        this.removerAdicionarClassePorId('dv-alerta', 'alert-warning', 'alert-success');
        this.atualizarMensagemAlerta(this.translate.instant('mensagem.digitais_conferem'));
        setTimeout(() => {
          this.comparaBiometria.finalizarComparacaoDigital();
        }, 1000);
      } else {
        this.prepararNaoCorrespondenciaDigital(digitais);
      }
    } catch ({ error }) {
      this.apresentarMensagemErro(error);
      return error;
    }
  }

  /**
   * Controla a apresentação do relógio (12 - 0) de forma descrecente no HTML
   *
   * @param idDivContador dv-contador
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

  private isDigitalCorresponde(respostaComprarDigital: any) {
    return respostaComprarDigital.objetoResposta;
  }

  private prepararNaoCorrespondenciaDigital(digitaisLista: any) {
    clearInterval(this.intervalContador);
    this.aplsModal.popup(this.dvPosicao as ElementRef, {
      titulo: this.translate.instant('label.atencao'),
      mensagem: this.translate.instant('mensagem.digital_nao_corresponde'),
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.nao'),
          color: 'light',
          handler: () => {
            this.dialogRef.close();
          }
        },
        {
          nome: this.translate.instant('label.comparar'),
          handler: () => {
            const dvBoxDigitalFilhos = this.dvBoxDigital.nativeElement.childNodes[0];
            this.dvBoxDigital.nativeElement.removeChild(this.dvBoxDigital.nativeElement.childNodes[0]);
            this.dvBoxDigital.nativeElement.appendChild(dvBoxDigitalFilhos);
            this.compararDigital(digitaisLista);
          }
        }
      ]
    });
  }

  private apresentarMensagemErro(error: any) {
    this.dialogRef.close();
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
        mensagemI18N = 'mensagem.erro_interceptor';
        break;
    }

    this.aplsModal.toast(this.translate.instant(mensagemI18N), tipoAlerta);
  }

  /**
   * Remove e adiciona uma classe para determinado id
   */
  private removerAdicionarClassePorId(idElementoHtml: string, classeRemover: string, classeAdicionar: string) {
    document.getElementById(idElementoHtml).classList.remove(classeRemover);
    document.getElementById(idElementoHtml).classList.add(classeAdicionar);
  }

  /**
   * Atualiza a mensadem da dv-alerta
   */
  private atualizarMensagemAlerta(mensagem: string) {
    document.getElementById('dv-alerta').innerText = mensagem;
  }
}
