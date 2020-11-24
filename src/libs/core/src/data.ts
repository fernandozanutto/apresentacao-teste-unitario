/**
 * Essa classe não foi desenvolvida para retornar um numero formatado com mascara. Essa classe tem como objetivo criar Objetos data a partir de string's.
 */
export class AplsData {

  // Aqui fica o valor pronto para exibição, não é o valor manipulavel.
  get value(): string {
    return Intl.DateTimeFormat(this._zona, this.opcoes || this._opcoes).format(this._value)
  }
  private _value: Date;

  // Retorna a data sem formatação. Retorna como objeto.
  get date(): Date {
    return this._value;
    //asdasdas
  }

  private _zona = 'pt-BR';

  // Padrão intl
  private _opcoes = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  };

  constructor(public data: string, public opcoes?: Intl.DateTimeFormatOptions) {
    switch (this.descobreFormato()) {
      case 'origemISOString':
        this.origemISOString();
        break;
      case 'origemStringSemHora':
        this.origemStringSemHora();
        break;
      case 'dataBRStringSemHora':
        this.dataBRStringSemHora();
        break;
      case 'dataUSStringSemHora':
        this.dataUSStringSemHora();
        break;
    }
  }

  /**
   * Faz a detecção da formato da data.
   */
  private descobreFormato(): string {
    let dataOrigemISOString = /([0-9]{4})[-]([0-9]{2})[-]([0-9]{2})[T]([0-9]{2})[:]([0-9]{2})[:]([0-9]{2})[Z]/; // YYYY-MM-DDTHH:mm:ssZ
    let dataOrigemStringSemHora = /([0-9]{4})[-]([0-9]{2})[-]([0-9]{2})/; // YYYY-MM-DD
    let dataBRStringSemHora = /^([0-9]|[12]\d|3[0-2])[/]([0-9]|0[1-9]|1[0-2])[/]([0-9]{4})/; // DD/MM/YYYY
    let dataUSStringSemHora = /^([0-9]|0[1-9]|1[0-2])[/]([0-9]|[12]\d|3[0-2])[/]([0-9]{4})/; // MM/DD/YYYY

    if (dataOrigemISOString.test(this.data)) {
      return 'origemISOString';
    }

    if (dataOrigemStringSemHora.test(this.data)) {
      return 'origemStringSemHora';
    }

    if (dataBRStringSemHora.test(this.data)) {
      return 'dataBRStringSemHora';
    }

    if (dataUSStringSemHora.test(this.data)) {
      return 'dataUSStringSemHora';
    }
  }

  /**
   * Valida e atualiza o valor da data.
   * @param novaData Data nova
   */
  validaEAtualiza(novaData: Date) {
    if (novaData && novaData instanceof Date) {
      this._value = novaData;
    }
  }

  /**
   * Resolve a data quando sua origem é de um toISOString();
   * 
   * Considerando também que no backend tem uma pog que remove 3h de uma data sem time zone. Para forçar que a data 
   * seja uma data do time zone pt-BR. Isso na hora de inserir.
   * E depois na hora de consultar é retornado essa data sem time zone. 
   * 
   * Dessa forma fixamos que a data implicitamente será time zone pt-BR(-03:00 horas).
   * 
   * Isso no javascript resulta em um conflito de time zone.
   * Eu crio dizendo que é uma data 00:00 porem essa data é -03:00.
   * 
   * Podiamos incrementar 3h apenas gerando o efeito contrario.
   * Porem é um metodo pouco robusto e muito frágil.
   * 
   * Então apenas editamos a data com seu valor em string ainda, para quando chegar no new Date() a data possua um time zone.
   * 
   * @author Thiago
   */
  origemISOString() {     
    this._value = new Date(this.data);
  }

  origemStringSemHora() {
    this._value = new Date(this.data);
  }

  dataBRStringSemHora() {
    this._value = new Date(this.data.replace(new RegExp(/([0-9]{2})[/]([0-9]{2})[/]([0-9]{4})/), '$2/$1/$3'));
  }

  dataUSStringSemHora() {
    this._value = new Date(this.data);
  }

  defineZona(ref: string) {
    this._zona = ref;
  }

  

}
