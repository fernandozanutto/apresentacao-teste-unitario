/**
 * @author Karan Alves Pereira
 * @since 19/11/2018
 */

import { Injectable } from "@angular/core";

/**
 * Classe utilitária de Strings
 */
@Injectable({
  providedIn: 'root'
})
export class StringUtils {


  /**
   * Método que recebe uma string de entrada e verifica se for nulo ou undefined retorna uma string vazia
   * @param str 
   */
  tratarValorNulo(str: string): string {
    if (!str || str == undefined) {
      str = '';
    }

    return str;
  }

  /**
   * Método que recebe uma string de entrada e verifica se for nulo ou undefined ou vazia retorna true ou false
   * @param str 
   */
  isNullEmpty(string: string): boolean {
    return string === null || string === 'null' || string.trim().length === 0;
  }


}