import { Injectable, EventEmitter } from '@angular/core';

/********************************************************************************
 * Aplica uma verificacao quando o usuario tenta alterar a Rota.
 * SE UNLOAD_BLOQUEIA: o sistema abre uma modal informando que ele podera perder as alteracoes nao salvas
 * @autor Thiago
 * @comment Fabiel
 ********************************************************************************/

export const UNLOAD_BLOQUEIA = new EventEmitter();

export const UNLOAD_DESBLOQUEIA = new EventEmitter();

@Injectable({
  providedIn: 'root'
})
export class AplsUnload {

  travaSaidaPagina = false;

  constructor() {
    window.addEventListener('beforeunload', $event => {
      if (this.travaSaidaPagina) {
        // Avisa que precisa confirmar para sair.
        $event.returnValue = true;
      } else {
        // Libera reload da pagina.
        delete $event.returnValue;
      }
    });

    UNLOAD_BLOQUEIA.subscribe(() => this.bloqueia());
    UNLOAD_DESBLOQUEIA.subscribe(() => this.desbloqueia());
  }

  bloqueia() {
    this.travaSaidaPagina = true;
  }

  desbloqueia() {
    this.travaSaidaPagina = false;
  }
}
