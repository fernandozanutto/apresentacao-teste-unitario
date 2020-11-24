/**
   * Exceção que poderá ser utilizada para interromper a execução do código typescript. 
   * 
   * ***Exemplo Exceção:***
    ```
    new ApollusException('Teste exception');
    ```   
    * Ao executar essa instrução o sistema irá apresentar um toast com o tipo alerta de acordo com o parâmetro de entrada que foi enviado
   */
export class ApollusException extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.stack += " - ApollusException";
  }
}

/**
 * Utilizado no HttpsRequestInterceptor para interromper a execução do código quando houver um erro 404 de http
 */
export class Http404Exception extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.stack += " - Http404Exception";
  }
}

/**
 * Utilizado no HttpsRequestInterceptor para interromper a execução do código quando houver um erro 200 de http
 */
export class Http200Exception extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.stack += " - Http200Exception";
  }
}

/**
 * Utilizado no HttpsRequestInterceptor para interromper a execução do código quando houver um erro 500 de http
 */
export class Http500Exception extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.stack += " - Http500Exception";
  }
}
