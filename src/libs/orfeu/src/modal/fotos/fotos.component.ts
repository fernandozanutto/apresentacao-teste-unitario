import { Component, Inject, ViewEncapsulation, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { AplsDialogRef, APLS_DIALOG_DATA } from '../../dialog';
import { aplsFotosAnimations } from './fotos-animations';
import { AplsUpload } from '@apollus/common';

@Component({
  selector: 'apls-fotos',
  templateUrl: './fotos.component.html',
  styleUrls: ['./fotos.component.scss'],
  host: {
    class: 'modal-fotos'
  },
  animations: [aplsFotosAnimations.fotoState],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AplsFotosComponent {
  controleItens = [];

  emAnimacao = false;

  possuiPaginador = true;

  desabilitaProximoCallback = false;

  index = 0;

  constructor(
    public dialogRef: AplsDialogRef<AplsFotosComponent>,
    @Inject(APLS_DIALOG_DATA) public data: any,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    if (this.data.length > 1) {
      let status = 'visivel';
      for(let i = 0; i < this.data.length; i++) {
        this.controleItens.push({
          foto: this.data[i],
          status: status
        });
        
        status = 'proximo';
      }
      
      if (this.controleItens.length > 0) {
        this.controleItens[0].status = 'visivel';
      }
    } else {
      this.controleItens.push({
        foto: this.data[0],
        status: 'visivel'
      });

      this.possuiPaginador = false;
    }
  }

  btnFechar() {
    this.dialogRef.close();
  }

  proximoIndex(): number {
    return this.index + 1;
  }

  indexAnterior(): number {
    return this.index - 1;
  }

  /**
   * Ação de proximo para a visualização da imagem.
   */
  proxima() {
    let proximoIndex = this.proximoIndex();

    this.controleItens[this.index].status = 'anterior';
    this.controleItens[proximoIndex].status = 'visivel';

    this.index = proximoIndex;

    this.emAnimacao = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Ação de proximo para a visualização da imagem.
   */
  anterior() {
    let indexAnterior = this.indexAnterior();

    this.controleItens[this.index].status = 'proximo';
    this.controleItens[indexAnterior].status = 'visivel';

    this.index = indexAnterior;

    this.emAnimacao = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Callback finalização de animação
   */
  setaProximoAnterior() {
    // Quando só existem duas fotos o controle de proximo e anterior é feito na chamada.
    if (this.possuiPaginador && this.controleItens.length != 2) {
      let proximoIndexParaAnimacao = this.proximoIndex();
      let anteriorIndexParaAnimacao = this.indexAnterior();
      
      if (proximoIndexParaAnimacao < (this.controleItens.length - 1)) {
        let proximoStatus = this.controleItens[proximoIndexParaAnimacao].status;
        if (proximoStatus != 'visivel' && proximoStatus != 'proximo') {
          this.controleItens[proximoIndexParaAnimacao].status = 'proximo';
        }
      }
      
      if (anteriorIndexParaAnimacao > -1) {
        let anteriorStatus = this.controleItens[anteriorIndexParaAnimacao].status;
        if (anteriorStatus != 'visivel' && anteriorStatus != 'anterior') {
          this.controleItens[anteriorIndexParaAnimacao].status = 'anterior';
        }
      }
    }
    this.emAnimacao = false;
    this._changeDetectorRef.markForCheck();
  }

}
