/**
 * @author Karan Alves Pereira
 * @since 12/03/2019
 */

import { Injectable } from '@angular/core';

/**
 * Classe utilitária de i18n
 */
@Injectable({
  providedIn: 'root'
})
export class I18nUtils {
  idioma = (<any>window).idioma;

  /**
   * Busca a descrição do array de acordo com o idioma do usuário logado
   *
   * @param array
   * @param posicaoPT
   * @param posicaoEN
   * @param posicaoES
   *
   * @return Retorna uma string com a descrição internacionalizada
   */
  public buscarDescricaoI18n(array: any[], posicaoPT: number, posicaoEN: number, posicaoES: number): string {
    let referenciaArray = this.idioma === 'PT' ? posicaoPT : this.idioma === 'EN' ? posicaoEN : posicaoES;
    return array[referenciaArray];
  }

  /**
   * Busca a descrição de um DTO
   */
  public buscarDescricaoI18nDTO(objeto): string {
    return this.idioma === 'PT' ? objeto.descricaoPT : this.idioma === 'EN' ? objeto.descricaoEN : objeto.descricaoES;
  }

  /**
   * Busca a descrição do campo passado por parâmetro de acordo com a internacionalização
   * 
   * @param objeto Objeto que vai buscar o valor
   * @param nomeCampo Nome do campo no DTO
   */
  public buscarCampoI18nDTO(objeto, nomeCampo: string): string {
    return objeto[`${nomeCampo}${this.idioma}`];
  }
}
