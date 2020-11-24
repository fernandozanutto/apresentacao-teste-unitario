/**********************************************************
 * Criador: Thiago Feijó                                  *
 * Data: 21/12/2017                                       *
 * Descrição: Classe responsavel por gerenciar cookies.   *
 * *******************************************************/

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AplsCookie {
  /**
   * Faz leitura dos cookies e retorna o valor a partir da chava
   * @param name chave para encontrar o valor no registro do cookie
   */
  static get(name: string) {
    const app = window['app'] ? window['app'] + '_' : '';

    const nameEQ = `${app}${name}` + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  /**
   * Seta valor em cookie
   * @param name Chave para identificar cookie
   */
  static set(name, value, options = null) {
    const app = window['app'] ? window['app'] + '_' : '';

    options = options || {};

    var str = encodeURIComponent(`${app}${name}`) + '=' + encodeURIComponent(value) + '; Path=/';
    const isSecure = this.isDesenvolvimento() ? '' : 'secure';
    str += !!options.expires ? ';expires=' + options.expires.toUTCString() : '; ' + isSecure;

    var cookieLength = str.length + 1;
    if (cookieLength > 4096) {
      console.warn("Cookie '" + `${app}${name}` + "' possibly not set or overflowed because it was too large (" + cookieLength + ' > 4096 bytes)!');
    }

    document.cookie = str;
  }

  /**
   * Atualiza time do cooke
   * @param name Chave para identificar cookie
   */
  static atualiza(name, expires) {
    const app = window['app'] ? window['app'] + '_' : '';

    const isSecure = this.isDesenvolvimento() ? '' : 'secure';
    document.cookie = `${`${app}${name}`}=${this.get(name)}; Path=/; expires=${expires.toUTCString()}; ${isSecure}`;
  }

  /**
   * Seta por cima do atual um cookie com data de expiração mais antiga que a data atual
   * assim ele se algo elimina
   * @param name Chave para identificar cookie
   */
  static delete(name) {
    const app = window['app'] ? window['app'] + '_' : '';
    document.cookie = `${app}${name}` + '=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  static isDesenvolvimento() {
    const url = document.URL;
    let isDev = true;

    if (url != null && url.indexOf('localhost') === -1 && url.indexOf('127.0.0.1') === -1) {
      isDev = false;
    }

    return isDev;
  }
}
