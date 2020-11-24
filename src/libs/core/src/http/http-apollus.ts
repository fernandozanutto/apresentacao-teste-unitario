/**
 * Criador: Thiago Feijó
 * Data: 15/12/2017
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Classe usada para realizar os requests dentro do apollus
 */
@Injectable({
  providedIn: 'root'
})
export class HttpApollus extends HttpClient {
  listaCache = {};

  constructor(handler: HttpHandler, public http: HttpClient) {
    super(handler);
  }

  get<T = any>(url: string, params?: any): Observable<T> {
    if (!!params) {
      url += this.serialize(params);
    }
    return this.http.get<T>(url);
  }

  /**
   * Serializador de objetos.
   *
   * EX:
   *
   * Entrada
   * {
   *  "pagina": 1
   *  "filtro": {
   *    "nome": "apollus",
   *    "epi": {"id": 3, "nome: "thiago"}
   *    "modulos": [ "epi", "si", "ghe", 200 ]
   *  }
   * }
   *
   * saida
   * pagina=1&nome=apollus$epi=3&modulos=epi,si,ghe,200
   *
   * @param objeto Qualquer objeto com no maximo um sub nivel e array somente em sub nivel.
   */
  serialize(objeto: any): string {
    const UNIFICA_PROPRIEDADES = (key: string, value: string) => encodeURIComponent(key) + '=' + encodeURIComponent(value);

    // Essa função ficaria melhor com redunce. Fica aqui a proposta de uma feature.
    return Object.keys(objeto)
      .map(key => {
        // Define uma variavel para facilitar o tratamento
        let value = objeto[key];

        // Se esse nivel for um objeto ele deve ter um tratamento diferente
        if (value instanceof Object && !(value instanceof Array)) {
          // Começa a serializar o sub nivel
          return Object.keys(value)
            .map(key => {
              // Caso seja um array cria o serialize no nosso padrão. ex: campo=valor1,valor2,valor3
              if (value[key] instanceof Array) {
                return value[key].length > 0 ? UNIFICA_PROPRIEDADES(key, value[key].join(',')) : '';
              }
              // Caso seja um objeto se considera como um dto
              if (value[key] instanceof Object) {
                return value[key].id ? UNIFICA_PROPRIEDADES(key, value[key].id) : '';
              }

              // Trata como um tipo primitivo
              return !!value[key] ? UNIFICA_PROPRIEDADES(key, value[key]) : '';
            })
            .filter(item => !!item)
            .join('&');
        }
        // Se chegou até aqui precisa ser um tipo primitivo apenas.
        return !!value ? UNIFICA_PROPRIEDADES(key, value) : '';
      })
      .filter(item => !!item)
      .join('&');
  }

  /**
   * Cria uma unica instancia do Observable cacheado sem que ele seja reescrito.
   *
   * Cachea um apenas.
   *
   * @param chave Identificador unico. Padrão kebab-case.
   * @param servico Observable que será cheado.
   */
  cache(chave: string, servico: Observable<any>): Observable<any> {
    if (!this.listaCache.hasOwnProperty(chave)) {
      this.listaCache[chave] = servico.pipe(shareReplay(1));
    }

    return this.listaCache[chave];
  }

  /**
   * Deleta o cache de uma chamada.
   *
   * @param chave Identificador unico. Padrão kebab-case.
   *
   * Item proposto pelo rogério.
   */
  cacheDelete(chave: string) {
    delete this.listaCache[chave];
  }

  /**
   * Remove do cache caso existe uma chave que contenha parte da key
   * @param chave
   */
  cacheDeleteContainKey(chave: string) {
    const keys = this.listCacheKeys();

    // limpa o cache, caso ja tenha sido criado
    for (let k of keys) {
      if (k.contem(chave)) {
        this.cacheDelete(k);
        break;
      }
    }
  }

  /**
   * Lista todas as KEYS do cache
   */
  listCacheKeys(): Array<any> {
    return Object.keys(this.listaCache);
  }
}
