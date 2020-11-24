/**
 * Criador: Thiago Feijó
 * Data: 27/12/2017
 * Descrição: Prototype para o tipo string. Reune qualquer
 * metodo que seja para o tipo string.
 */

interface String {
  removeVirgulaFinal(): string;
  capitalize(): string;
  removerAcentos(): string;
  removerCaracteresEspeciais(): string;
  contem(str: string): boolean;
  igual(str: string): boolean;
  replaceAll(token, newtoken): string;
  removerFormatacaoCasasDecimais(): number;
  isEmpty(): boolean;
}

/**
 * metodo que verifica se ums string é vazio ou null.
 */
String.prototype.isEmpty = function() {
  let string = this.trim();

  return string === null || string === 'null' || string.trim().length === 0;
};

/**
 * Metodo para remover a ultima virgula de uma string
 *
 * Antes de passar pelo metodo:
 * Ex: Maria, Joao, Pedro,
 *
 * Após passar pelo metodo:
 * Ex: Maria, Joao, Pedro
 */
String.prototype.removeVirgulaFinal = function() {
  /**
   * endsWith() pertence ao ES2015
   * Fonte: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
   * trim() pertence ao ES2015
   * Fonte: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/trim
   */
  if (!!this && this.trim().endsWith(',')) {
    return this.substring(0, this.trim().length - 1);
  }
  return this;
};

/**
 * Metodo utilizado para remover TODOS os acentos da String
 */
String.prototype.removerAcentos = function() {
  let stringSemAcentos = this.trim();

  let rExps = [
    { re: /[\xC0-\xC6]/g, ch: 'A' },
    { re: /[\xE0-\xE6]/g, ch: 'a' },
    { re: /[\xC8-\xCB]/g, ch: 'E' },
    { re: /[\xE8-\xEB]/g, ch: 'e' },
    { re: /[\xCC-\xCF]/g, ch: 'I' },
    { re: /[\xEC-\xEF]/g, ch: 'i' },
    { re: /[\xD2-\xD6]/g, ch: 'O' },
    { re: /[\xF2-\xF6]/g, ch: 'o' },
    { re: /[\xD9-\xDC]/g, ch: 'U' },
    { re: /[\xF9-\xFC]/g, ch: 'u' },
    { re: /[\xD1]/g, ch: 'N' },
    { re: /[\xF1]/g, ch: 'n' },
    { re: /\xE7/g, ch: 'c' },
    { re: /\xC7/g, ch: 'C' }
  ];

  for (let i = 0; i < rExps.length; i++) {
    stringSemAcentos = stringSemAcentos.replace(rExps[i].re, rExps[i].ch);
  }

  return stringSemAcentos;
};

/**
 * Método utilizado para remover os carateres especiais da String
 * Regex utilizada na substituição: [^a-zA-Z0-9_\- ]
 */
String.prototype.removerCaracteresEspeciais = function() {
  return this.removerAcentos().replace(/[^a-zA-Z0-9_\- ]/g, '');
};

/**
 * Metodo utilizado para comparar strings
 */
String.prototype.contem = function(str: string) {
  return this.trim()
    .toLocaleLowerCase()
    .removerAcentos()
    .includes(
      str
        .trim()
        .toLocaleLowerCase()
        .removerAcentos()
    );
};

/**
 * Metodo utilizado para comparar strings
 */
String.prototype.igual = function(str: string) {
  return str && this.toLocaleLowerCase().removerAcentos() === str.toLocaleLowerCase().removerAcentos();
};

String.prototype.replaceAll = function(token, newtoken) {
  let string = this;

  if (string != null) {
    while (string.indexOf(token) != -1) {
      string = string.replace(token, newtoken);
    }
  }
  return string;
};

/**
 * Faz o desmascaramento aplicado no arquivo: Number.prototype.formatarCasasDecimais
 * Este metodo transforma a string em number respeitando as pontuacoes
 */
String.prototype.removerFormatacaoCasasDecimais = function() {
  if (typeof this == 'string' || this instanceof String) {
    if (this == null || this == '') {
      return null;
    }

    let moedaStr = this.toString();

    moedaStr = moedaStr.replaceAll('.', '');
    moedaStr = moedaStr.replaceAll(',', '.');

    return Number(moedaStr);
  } else {
    return this;
  }
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
