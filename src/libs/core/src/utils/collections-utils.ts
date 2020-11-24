/**
 * @author Rogério Alves
 * @since 05/12/2018
 */

import { Injectable } from '@angular/core';
import { DateUtils } from './date-utils';

/**
 * Classe utilitária de Coleções
 */
@Injectable({
  providedIn: 'root'
})
export class CollectionsUtils {
  constructor(private dateUtils: DateUtils) {}

  /**
   * Ordena a lista a partir do codigo
   */
  ordenarListaPeloCodigo(objetoA: any, objetoB: any) {
    let itemA = objetoA.codigo
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();
    let itemB = objetoB.codigo
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Ordena a lista a partir do nome
   */
  ordenarListaPeloNome(objetoA: any, objetoB: any) {
    let itemA = objetoA.nome
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();
    let itemB = objetoB.nome
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Ordena a lista a partir da descricao
   */
  ordenarListaPelaDescricao(objetoA: any, objetoB: any) {
    let itemA = objetoA.descricao
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();
    let itemB = objetoB.descricao
      .toUpperCase()
      .removerAcentos()
      .toLowerCase();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Ordena a lista a partir da descricao
   */
  ordenarListaPeloObjectoDescricaoIdioma(objetoA: any, objetoB: any) {
    let itemA = objetoA.descricaoIdioma.descricao.removerAcentos().toLowerCase();

    let itemB = objetoB.descricaoIdioma.descricao.removerAcentos().toLowerCase();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Ordena a lista a partir da propriedade descricaoSemCodigo
   */
  ordenarListaPelaDescricaoSemCodigo(objetoA: any, objetoB: any) {
    let itemA = objetoA.descricaoSemCodigo.toUpperCase().removerAcentos();
    let itemB = objetoB.descricaoSemCodigo.toUpperCase().removerAcentos();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Ordena a lista a partir da descricao
   */
  ordenarListaPelaDescricaoIdioma(objetoA: any, objetoB: any) {
    let idioma = (<any>window).idioma;
    let itemA = objetoA['descricao' + idioma].toUpperCase().removerAcentos();
    let itemB = objetoB['descricao' + idioma].toUpperCase().removerAcentos();

    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
  }

  /**
   * Método utilizado para ordenar a lista de forma crescente
   */
  ordenarListaCrescente(index1: any, index2: any) {
    return index1 - index2;
  }

  /**
   *
   * @param item - Item a ser adicionado. Ex: risco
   * @param lista - lista a qual o item será adicionado. Ex: listaRiscos
   * @param propDataInicio - Nome da Propriedade da Data de Inicio. Ex: 'dataInicial'
   * @param propDataFim - Nome da Propriedade da Data de Inicio. Ex: 'dataFinal'
   * @param isPodeAddDataFim - Flag que informa se pode adicionar outro registro sem data fim
   * @param prop - Identificador que será utilizado para verificar duplicidade. Ex: 'id'
   * @param indiceItemEdicao - Indice do item em edição. Utiliza-se apenas em caso de edição, ao incluir, não é necessário
   * @returns retorna um Array com os seguintes itens:
   *     [0] - Identificador da Verificação
   *          Valores Possíveis:
   *          0 - Pode Incluir
   *          1 - Existe Periodo Conflitante
   *          2 - Ja existe um registro sem data fim (Data Início Antes)
   *          3 - Ja existe um registro sem data fim (Data Início Depois)
   *          4 - Ja existe um registro sem data fim (Data Início Igual)
   *     [1] - Índice Item - Índice com o item, em que ocorreu conflito
   */
  existeRegistroPeriodoConflitante = (
    item: any,
    lista: any,
    propDataInicio: string,
    propDataFim: string,
    isPodeAddDataFim: boolean,
    prop: string = null,
    indiceItemEdicao = -1,
    propComparacao1: any,
    propComparacao2?: any
  ): Array<number> => {
    let isExiste = 0;
    let itemConflito = null;
    let retorno = [];

    if (!lista || !item) return [isExiste, -1];
    if (typeof item[propDataInicio] === 'string') item[propDataInicio] = this.dateUtils.converterDateStrEmDate(item[propDataInicio]);
    if (item[propDataFim] && typeof item[propDataFim] === 'string') item[propDataFim] = this.dateUtils.converterDateStrEmDate(item[propDataFim]);

    this.removerHorasData(item[propDataInicio]);
    this.removerHorasData(item[propDataFim]);

    let novaLista = [...lista];

    if (indiceItemEdicao > -1) novaLista.splice(indiceItemEdicao, 1);

    let isPossuiDataFim = !!item[propDataFim];
    let isPropDiferente = false;
    let valorItemA: any, valorItemB: any;
    let isPossuiItemConflito = false;

    for (let i = 0, elemento; (elemento = novaLista[i]); i++) {
      if (typeof elemento[propDataInicio] === 'string') elemento[propDataInicio] = this.dateUtils.converterDateStrEmDate(elemento[propDataInicio]);
      if (elemento[propDataFim] && typeof elemento[propDataFim] === 'string') elemento[propDataFim] = this.dateUtils.converterDateStrEmDate(elemento[propDataFim]);

      this.removerHorasData(elemento[propDataInicio]);
      this.removerHorasData(elemento[propDataFim]);

      if (prop) {
        valorItemA = this.retornarPropItem(elemento, prop);
        valorItemB = this.retornarPropItem(item, prop);
        isPropDiferente = valorItemA !== valorItemB;
      }

      type DateRange = { [key: string]: Date };
      const { [propDataInicio]: itemDinicio, [propDataFim]: itemDFim }: DateRange = item;
      const { [propDataInicio]: elementoDInicio, [propDataFim]: elementoDFim }: DateRange = elemento;

      /**
       * Verifica se ja ha algum registro sem a data fim,
       * caso exista e seja informado isso na flag 'isPodeAddDataFim'
       * retorna 2;
       */
      if (!isPodeAddDataFim && !elementoDFim && !isPossuiDataFim && !isPropDiferente) {
        if (itemDinicio.comparaDatas(elementoDInicio) === -1) {
          isExiste = 2;
        } else if (itemDinicio.comparaDatas(elementoDInicio)) {
          isExiste = 3;
        } else {
          isExiste = 4;
        }

        if (!itemConflito) itemConflito = elemento;

        continue;
      }

      /**
       * Verifica se o elementoeto possui data de fim
       */
      if (elementoDFim) {
        if (this.dateUtils.dataEstaNoPeriodo(elementoDInicio, elementoDFim, itemDinicio) && !isPropDiferente) {
          isExiste = 1;
          isPossuiItemConflito = true;
        } else if (isPossuiDataFim && this.dateUtils.dataEstaNoPeriodo(elementoDInicio, elementoDFim, itemDFim) && !isPropDiferente) {
          isExiste = 1;
          isPossuiItemConflito = true;
        }
      }

      if (isPossuiDataFim) {
        if (this.dateUtils.dataEstaNoPeriodo(itemDinicio, itemDFim, elementoDInicio) && !isPropDiferente) {
          isExiste = 1;
          isPossuiItemConflito = true;
        } else if (elementoDFim && this.dateUtils.dataEstaNoPeriodo(itemDinicio, itemDFim, elementoDFim) && !isPropDiferente) {
          isExiste = 1;
          isPossuiItemConflito = true;
        }
      }

      if (!isPossuiDataFim && !elementoDFim && !isPropDiferente) {
        isExiste = 1;
        isPossuiItemConflito = true;
      } else if (!elementoDFim && isPossuiDataFim && !isPropDiferente) {
        if (this.dateUtils.dataEstaNoPeriodo(itemDinicio, itemDFim, elementoDInicio)) {
          isExiste = 1;
          isPossuiItemConflito = true;
        } else if (itemDinicio && itemDinicio.comparaDatas(elementoDInicio) === 1) {
          isExiste = 1;
          isPossuiItemConflito = true;
        }
      } else if (elementoDFim && !isPossuiDataFim && !isPropDiferente) {
        if (this.dateUtils.dataEstaNoPeriodo(elementoDInicio, elementoDFim, itemDinicio)) {
          isExiste = 1;
          isPossuiItemConflito = true;
        } else if (itemDinicio && itemDinicio.comparaDatas(elementoDInicio) === -1) {
          isExiste = 2;
          isPossuiItemConflito = true;
        }
      }

      if (isExiste === 1 || isPossuiItemConflito) {
        itemConflito = elemento;
        isPossuiItemConflito = false;
      }

      if (isExiste === 1) {
        break;
      }
    }

    retorno[0] = isExiste;

    if (propComparacao1) {
      retorno[1] = this.retornarIndiceItemPorIdentificador(lista, itemConflito, propComparacao1, propComparacao2, false);
    } else {
      retorno[1] = lista.indexOf(itemConflito);
    }

    return retorno;
  };

  /**
   * Método utilizado para remover as horas das datas
   * @param data - Data que terá as horas removidas
   */
  private removerHorasData(data: Date): void {
    if (!data) {
      return;
    }

    data.setHours(0);
    data.setMilliseconds(0);
    data.setMinutes(0);
    data.setSeconds(0);
  }

  /**
   * Método utilizado para retornar o valor da propriedade de um campo.
   * @param item - Item que Comtém o Atributo.
   * @param prop - Nome do Atributo.
   *        Ex: id
   *        Ex: risco.id
   * Obs: Criei este método para conseguir trabalhar com classes
   */
  public retornarPropItem(item: any, prop: string): any {
    let arrProp = prop.split('.');
    let propItem = null;

    for (let itemProp of arrProp) {
      if (!propItem) {
        propItem = !!item && item.hasOwnProperty(itemProp) ? item[itemProp] : null;
      } else {
        propItem = propItem[itemProp];
      }
    }

    return propItem;
  }

  /**
   * Método utilizado para retornar o índice de um item do FormArray
   * @param listaItens - Lista onde o item se encontra
   * @param itemSelecionado - Item que será recuperado o índice
   * @param campoComparacao1 - Primeiro identificador do item selecionado
   * @param campoComparacao2 -  (Opcional) Segundo identificador do item selecionado
   * @param isTodosCamposValidos -  Informa se os Campos para comparacao (1 e 2) devem ambos serem validos.
   * Caso passar "false", irá considerar se qualquer um dos campos de comparação forem válidos
   * @returns Retorna o índice do item na Lista
   */
  private retornarIndiceItemPorIdentificador(
    listaItens: any,
    itemSelecionado: any,
    campoComparacao1: any,
    campoComparacao2?: any,
    isTodosCamposValidos: Boolean = true
  ): any {
    let isValido: boolean;
    let isValido2: boolean;
    let itemA: any;
    let itemB: any;

    return listaItens.findIndex((item: any) => {
      isValido2 = true;

      if (!!campoComparacao2) {
        itemA = this.retornarPropItem(item, campoComparacao2);
        itemB = this.retornarPropItem(itemSelecionado, campoComparacao2);

        isValido2 = !!itemA && !!itemB ? itemA === itemB : false;
      }

      itemA = this.retornarPropItem(item, campoComparacao1);
      itemB = this.retornarPropItem(itemSelecionado, campoComparacao1);
      isValido = !!itemA && !!itemB ? itemA === itemB : false;
      return isTodosCamposValidos ? isValido && isValido2 : isValido || isValido2;
    });
  }
}
