/**
 * @author Karan Alves Pereira
 * @since 14/03/2019
 */

import { Injectable, ElementRef } from '@angular/core';
import { AplsModal, AplsTableDataSource } from '@apollus-ngx/orfeu';
import { TranslateService } from '@ngx-translate/core';

/**
 * Classe utilitária de table
 */
@Injectable({
  providedIn: 'root'
})
export class TableUtils {
  constructor(private translate: TranslateService, private aplsModal: AplsModal) {}

  /**
   * Disponibiliza o controle de adição de um registro na tabela.
   *
   * @param tabela - Tabela onde será adicionado o registro
   * @param linha - Linha que será adicionada
   * @param mensagemAdicao - Parâmetro opcional. Define a mensagem que será apresentado ao adicionar um item da lista
   */
  adicionarRegistroTabela(tabela: AplsTableDataSource<{}>, linha: any) {
    tabela.data = [...tabela.data, linha];
  }

  /**
   * Disponibiliza o controle de exclusão de um registro na tabela.
   *
   * @param tabela - Tabela onde será excluído o registro
   * @param linha - Linha selecionada para exclusão
   * @param $event - Através dele é obtido a posição em tela para apresentar a modal no local correto
   * @param mensagemExclusao - Parâmetro opcional. Define a mensagem que será apresentado ao excluir um item da lista
   * @param funcaoAdiconalExclusao - Função adicional que será executada junto com a remoção do item da tabela
   *
   */
  excluirRegistroTabela(
    tabela: AplsTableDataSource<{}> | AplsTableDataSource<{}>,
    linha: any,
    $event: { target: ElementRef<any> },
    mensagemExclusao = this.translate.instant('mensagem.registro_excluido_com_sucesso'),
    funcaoAdiconalExclusao?: Function
  ) {
    this.aplsModal.popup($event.target as ElementRef, {
      titulo: this.translate.instant('label.atencao'),
      mensagem: this.translate.instant('mensagem.deseja_realmente_excluir'),
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.cancelar'),
          color: 'light'
        },
        {
          nome: this.translate.instant('label.excluir'),
          handler: () => {
            let index = tabela.data.findIndex((item: any) => item === linha);
            tabela.remove(index);
            funcaoAdiconalExclusao();
            this.aplsModal.toast(mensagemExclusao, 'S');
            tabela.data = tabela.data;
          }
        }
      ]
    });
  }

  /**
   * Exclui registro na tabela por campo.
   *
   * @param tableArray - Lista com as linhas.
   * @param itemExcluido - Linha que contem o valor a ser excluido.
   * @param campoComparacao1 - Campo que será utilizado para verificar a existência do item na lista. Ex: 'id'
   * @param campoComparacao2 - Opcional - Pode ser utilizado para comparar com outro valor a mais na lista.
   */
  excluirItemTabelaPorCampo(
    tableArray: AplsTableDataSource<{}>,
    itemExcluido: any,
    campoComparacao1: string,
    campoComparacao2?: string | number
  ) {
    let itemExcluidoFlag = false;
    let index = tableArray.data.findIndex((itemLista: any) => {
      if (!campoComparacao2 && itemLista[campoComparacao1] === itemExcluido[campoComparacao1]) {
        itemExcluidoFlag = true;
      } else if (
        campoComparacao2 &&
        itemLista[campoComparacao1] === itemExcluido[campoComparacao1] &&
        itemLista[campoComparacao2] === itemExcluido[campoComparacao2]
      ) {
        itemExcluidoFlag = true;
      }
      return itemExcluidoFlag;
    });

    if (index >= 0) {
      tableArray.remove(index);

      tableArray.data = tableArray.data;
    }
  }
}
