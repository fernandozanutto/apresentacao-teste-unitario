/**
 * Criador: Thiago Feijó                                  
 * Data: 21/12/2017                                       
 * Descrição: Classe responsavel por gerenciar valores me 
 * memoria, mantendo valores salvos somente em tempo de   
 * execução. Pode receber qualquer valor, se qualquer tipo
 * ou classe.                                             
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AplsCache {
  cache = {};

  constructor() {}

  /**
   * Retorna o valor em memoria
   * @param chave Key para localizar o valor
   */
  get(chave: any) {
    return this.cache[chave];
  }

  /**
   * Salva um valor em um objeto. Aceita qualquer tipo
   * @param chave Key para localizar valor
   * @param valor Valor a ser salvo
   */
  set(chave: any, valor: any) {
    this.cache[chave] = valor;
  }

  /**
   * Detala o valor em memoria
   * @param chave Key para deletar o valor
   */
  delete(chave: any) {
    delete this.cache[chave];
  }

  /**
   * Testa cache
   */
  test(chave: any) {
    return !!this.cache[chave];
  }
}
