/**
 * @author Rogério Alves
 * @since 31/01/2019
 */

import { Injectable } from '@angular/core';

/**
 * Classe utilitária de Storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageUtils {
  private _app = window['app'] ? window['app'] + '_' : '';

  /**
   * Método utilizado para adicionar um item no Storage
   * @param identificador - Identificador do Item
   * @param item - Item que será armazenado
   */
  adicionar(identificador: string, item: any): void {
    try {
      //sessionStorage.setItem(identificador, item);
      localStorage.setItem(`${this._app}${identificador}`, item);
    } catch (error) {
      console.log('Erro', error.message);
    }
  }

  /**
   * Método utilizado para retornar um item do Storage
   * @param identificador - Identificador do Item
   * OBS: Não é necessário fazer parse do Item
   */
  retornar(identificador: string): any {
    try {
      //let retorno = sessionStorage.getItem(identificador);
      let retorno = localStorage.getItem(`${this._app}${identificador}`);
      return retorno;
    } catch (error) {
      console.log('Erro', error.message);
    }
  }

  /**
   * Método utilizado para retornar um item do Storage
   * @param identificador - Identificador do Item
   * OBS: Não é necessário fazer parse do Item
   */
  retornarObjJSON(identificador: string): any {
    try {
      //let retorno = JSON.parse(decodeURIComponent(sessionStorage.getItem(identificador)));
      let retorno = JSON.parse(decodeURIComponent(localStorage.getItem(`${this._app}${identificador}`)));
      return retorno;
    } catch (error) {
      console.log('Erro', error.message);
    }
  }

  /**
   * Método utilizado para deletar um item do Storage
   * @param identificador - Identificador do Item
   */
  deletar(identificador: string): void {
    try {
      //sessionStorage.removeItem(identificador);
      localStorage.removeItem(`${this._app}${identificador}`);
    } catch (error) {
      console.log('Erro', error.message);
    }
  }
}
