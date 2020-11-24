import { Component, ElementRef, InjectionToken, Inject } from '@angular/core';

import { aplsPopupAnimations } from './popup-animations';

export interface PopupOpcoes {
  width?: number,
  titulo: string,
  mensagem: string,
  tipo: 'A' | 'E',
  botoes: Array<botoesPopup>,
  fnFechar?: Function,
  enableClose?: boolean,
  origem?: number,
}

export interface botoesPopup {
  nome: String,
  class?: String,
  color?: String,
  handler?: Function,
}

export const APLS_POPUP_DATA = new InjectionToken<any>('AplsPopupData');

@Component({
  selector: 'apls-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  animations: [aplsPopupAnimations.popupState],
  host: {
    '[style.width.px]': '!!config.width ? config.width : 250'
  }
})
export class AplsPopupComponent {

  animacao = '';

  animacaoRetorno = '';

  fnClose;

  constructor(
    public elementRef: ElementRef,
    @Inject(APLS_POPUP_DATA) public config: PopupOpcoes,
  ) {
    this.fnClose = config.fnFechar;
    this.animacao = config.origem > 200 ? 'origemDeBaixo' : 'origemDeCima';
  }

  _onAnimacaoDone() {
    if (this.animacao == 'origemDeBaixo' || this.animacao == 'origemDeCima') {
      if(this.animacao == 'origemDeBaixo') {
        this.animacaoRetorno = 'escondeEmBaixo';
      }
      if(this.animacao == 'origemDeCima') {
        this.animacaoRetorno = 'escondeEmCima';
      }

      this.animacao = 'visivel';
    }
    
    if (this.animacao == 'escondeEmBaixo' || this.animacao == 'escondeEmCima') {
      this.fnClose();
    }
  }

  callClick(item: botoesPopup): void {
    this.animacao = this.animacaoRetorno;

    // Testa se tem alguma função a ser executada no click
    if (!!item.handler) {
      // Executa função passada como parametro
      item.handler();
      this.fnClose();
    }
  }


}
