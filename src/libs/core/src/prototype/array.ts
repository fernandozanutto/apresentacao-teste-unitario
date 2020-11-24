/**********************************************************
 * Criador: Thiago Feijó                                  *
 * Data: 27/12/2017                                       *
 * *******************************************************/

interface Array<T> {
  isEmpty(): boolean;
  ordenar(chave: string): Array<T>;
  max(chave?: string): any;
  min(chave?: string): any;
}

/**
 * Retorna true se o array for vazio
 */
Array.prototype.isEmpty = function() {
  return !!(this.length < 1);
};

/**
 * Adiciona um ou mais itens
 */
Array.prototype.ordenar = function(chave: string): Array<any> {
  let array = this as Array<any>;

  return array.sort(function(a, b) {
    let valueA = a[chave].toLowerCase();
    let valueB = b[chave].toLowerCase();

    let comparatorResult = 0;
    if (valueA != null && valueB != null) {
      // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
      if (valueA > valueB) {
        comparatorResult = 1;
      } else if (valueA < valueB) {
        comparatorResult = -1;
      }
    } else if (valueA != null) {
      comparatorResult = 1;
    } else if (valueB != null) {
      comparatorResult = -1;
    }

    return comparatorResult;
  });
};

/**
 * Retorna o valor máximo de um array, recebendo a chave ou não.
 * Dependendo do tipo de dados que for enviar para este método pode ser necessário uma tratativa anterior a chamada para que
 * o método possa funcionar devidamente
 * @param chave refere-se a key do array que será devolvido.
 */
Array.prototype.max = function(chave: string) {
  const select = (a: any, b: any) => ((chave ? a[chave] : a) >= (chave ? b[chave] : b) ? a : b);
  return this.reduce(select, {});
};

/**
 * Retorna o valor mínimo de um array, recebendo a chave ou não.
 * Dependendo do tipo de dados que for enviar para este método pode ser necessário uma tratativa anterior a chamada para que
 * o método possa funcionar devidamente
 * @param chave refere-se a key do array que será devolvido.
 */
Array.prototype.min = function(chave: string) {
  const select = (a: any, b: any) => ((chave ? a[chave] : a) <= (chave ? b[chave] : b) ? a : b);
  return this.reduce(select, {});
};
