import { FormGroup } from '@angular/forms';
import { AplsTitle } from '@apollus-ngx/orfeu';

import { Usuario } from '../interfaces';
import { UsuarioLogado } from '../usuario-logado';

export class Tela {
  usuario: Usuario;
  aplsUsuarioLogado: UsuarioLogado;

  /**
   * Nessa propriedade voce pode inserir o nome de todas as propriedades que não teram
   * sua inscrição checada.
   */
  blackListSubscribes: Array<any> = [];

  /**
   * Deve ser preenchida no constructor para ser usada no ngOnInit ou em qualquer
   * lugar do template.
   */
  titulo: String;

  constructor(
    protected aplsRota: AplsTitle,
    ) {
    if (!this.usuario && !!this.aplsUsuarioLogado) {
      this.usuario = this.aplsUsuarioLogado.usuario;
    }
  }

  ngOnInit() {
    // Seta o titulo da tela no titule do html para ficar visivel na aba do navegador.
    if (typeof this.titulo === 'string') {
      this.aplsRota.set(this.titulo);
    }
  }

  /**
   * Essa função fica disponivel no template também para não ter que fazer concatenação no template que não é tão performatico.
   */
  descricao() {
    return `descricao${(<any>window).idioma}`;
  }

  ngOnDestroy() {
    // Pesquisa nas propriedade se tem alguem inscrito em algum evento.
    for (let prop in this) {
      const property = <any>this[prop];
      if (this.blackListSubscribes.indexOf(prop) !== -1) {
        if (property && typeof property.unsubscribe === 'function') {
          property.unsubscribe();
        }
      }
    }
  }

  // Marca campo por campo do form
  marcarFormGroupTocado(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        control.controls.forEach(c => this.marcarFormGroupTocado(c));
      }
    });
  }

  // Desmarca campo por campo do form
  marcarFormGroupIntocado(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsUntouched();

      if (control.controls) {
        control.controls.forEach(c => this.marcarFormGroupIntocado(c));
      }
    });
  }
}
