import { Component, Inject } from '@angular/core';

import { AplsDialogRef, APLS_DIALOG_DATA } from '../../dialog';
import { TranslateService } from '@ngx-translate/core';

export interface botoesAlerta {
  nome: String;
  color?: String;
  handler?: Function;
}

export interface DataAlerta {
  texto: String;
  tipo?: 'I' | 'E' | 'A';
  botoes: Array<botoesAlerta>;
}

@Component({
  selector: 'alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.scss'],
  host: {
    class: 'modal-dialog-centered'
  }
})
export class AplsAlertaComponent {
  modelo = {
    A: {
      titulo: this.translate.instant('label.atencao'),
      icon: 'iapls fas fa-exclamation-triangle',
      class: 'btn-w'
    },
    I: {
      titulo: this.translate.instant('label.informacao'),
      icon: 'iapls fas fa-exclamation-triangle',
      class: 'btn-w'
    },
    E: {
      titulo: this.translate.instant('label.erro'),
      icon: 'iapls far fa-times-circle',
      class: 'btn-e'
    },
    R: {
      titulo: this.translate.instant('label.atualizar_o_site')
    }
  };

  constructor(public dialogRef: AplsDialogRef<AplsAlertaComponent>, @Inject(APLS_DIALOG_DATA) public data: any, private translate: TranslateService) {}

  montaTitulo(): string {
    return !!this.modelo[this.data.tipo].titulo ? this.modelo[this.data.tipo].titulo : '';
  }

  montaIcon(): string {
    return !!this.modelo[this.data.tipo].icon ? this.modelo[this.data.tipo].icon : '';
  }

  montaClasse(): string {
    return !!this.modelo[this.data.tipo].class ? this.modelo[this.data.tipo].class : '';
  }

  callClick(item: botoesAlerta): void {
    // Testa se tem alguma função a ser executada no click
    if (!!item.handler) {
      // Executa função passada como parametro
      item.handler();
      this.dialogRef.close();
    } else {
      this.dialogRef.close();
    }
  }
}
