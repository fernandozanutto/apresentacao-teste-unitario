/**********************************************************
 * Criador: Thiago Feijó                                  *
 * Data: 27/12/2017                                       *
 * *******************************************************/

interface Date {
  estaValida(): boolean;
  addMinutos(minutos): Date;
  addDias(dias): Date;
  comparaDatas(dateFinal: Date, considerarDia?: boolean, considerarHoras?: boolean): Number;
  dataEstaNoPeriodo(dateFinal: Date, dataRef: Date, considerarDia: boolean, considerarHoras: boolean): boolean;
  removerHorasMinutosSegundos(): Date;
  nativeISOString(): string;
}

/**
 * Incrementa minutos a uma data hora existente.
 */
Date.prototype.addMinutos = function(minutos): Date {
  return new Date(this.setMinutes(this.getMinutes() + minutos));
};

/**
 * Incrementa dias a uma data hora existente.
 */
Date.prototype.addDias = function(dias): Date {
  return new Date(this.setDate(this.getDate() + dias));
};

/**
 * Compara datas e retorna se a data é maior, igual ou menor.
 * @param date1 = data 1
 * @param date2 = data 2
 * @param considerarDia Flag que indica se a função deve considerar os dias na comparação
 * @returns 1 = Data 1 MAIOR = DEPOIS /
 * 			0 = datas iguais /
 * 			-1 = Data 1 MENOR = ANTES
 */
Date.prototype.comparaDatas = function(dateFinal: Date, considerarDia = true, considerarHoras = false): Number {
  let dt1 = new Date(this.getTime());
  let dt2 = new Date(dateFinal.getTime());

  if (!considerarDia) {
    dt1.setDate(1);
    dt2.setDate(1);
  }

  /**
   * Quando não deve considerar hora, ele força que a hora sejá 0, para ser igual nas duas variaveis.
   */
  if (!considerarHoras) {
    dt1.setHours(0);
    dt1.setMilliseconds(0);
    dt1.setMinutes(0);
    dt1.setSeconds(0);

    dt2.setHours(0);
    dt2.setMilliseconds(0);
    dt2.setMinutes(0);
    dt2.setSeconds(0);
  }

  if (dt1.getTime() > dt2.getTime()) {
    return 1;
  } else if (dt1.getTime() == dt2.getTime()) {
    return 0; //alert("As datas são iguais.");
  } else {
    return -1; //alert("Data 2 é menor que a data 1.");
  }
};

/**
 * Função responsável por verificar se a data está no período informado. Pode-se considerar dias e horas.
 * Data a ser verificada.
 *
 * @param dateInicial = Data inicial do período
 * @param dateFinal = Data final do período
 * @param considerarDia = Deve considerar dias?
 * @param considerarHoras = Deve considerar horas?
 *
 * Exemplo:
 * dataEstaNoPeriodo(riscoAtual.dataInicio, riscoAtual.dataFim, riscoParam.dataInicio, true, false)
 */
Date.prototype.dataEstaNoPeriodo = function(dateInicial: Date, dateFinal: Date, considerarDia: boolean, considerarHoras: boolean): boolean {
  let dtI = dateInicial;
  let dtF = dateFinal;
  let dtR = this;

  if (!considerarDia) {
    dtI.setDate(1);
    dtF.setDate(1);
    dtR.setDate(1);
  }

  if (!considerarHoras) {
    dtI.setHours(0);
    dtI.setMilliseconds(0);
    dtI.setMinutes(0);
    dtI.setSeconds(0);

    dtF.setHours(0);
    dtF.setMilliseconds(0);
    dtF.setMinutes(0);
    dtF.setSeconds(0);

    dtR.setHours(0);
    dtR.setMilliseconds(0);
    dtR.setMinutes(0);
    dtR.setSeconds(0);
  }

  return dtI.getTime() <= dtR.getTime() && dtF.getTime() >= dtR.getTime();
};

Date.prototype.estaValida = function() {
  return this.getTime() === this.getTime();
};

/**
 * Método utilizado para remover as horas, minutos e segundos de uma data
 */
Date.prototype.removerHorasMinutosSegundos = function() {
  return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0, 0);
};

/**
 * Overwrite Date toISOString method to consider DateDate application pattern.
 * In the case of the new Front-end application, this one, is a Date with the 00 hours referencing UTC 0, or, one set to midnight 00:00:00
 */

/**
 * First wee create a proxi method to host the native toISOString implementation.
 * The original method will be used in case the date object don't match the target pattern.
 */
Date.prototype.nativeISOString = Date.prototype.toISOString;

/**
 * By last, toISOString  is overwritten. In case the Date object matches the pattern the method will return a string,
 * with year first, followed by month and then by day, yyyy-mm-dd.
 */
Date.prototype.toISOString = function() {
  const isTimeZero = this.getHours() === 0 && this.getMinutes() === 0 && this.getSeconds() === 0 && this.getMilliseconds() === 0;
  const offsetCompensation = this.getTimezoneOffset() > 0 ? this.getHours() + this.getTimezoneOffset() / 60 - 24 : this.getHours() + this.getTimezoneOffset() / 60;
  const isTimeZeroToOffset = offsetCompensation === 0 && this.getMilliseconds() === 0;
  const isDateDate = isTimeZero || isTimeZeroToOffset;
  if (!isDateDate) {
    return this.nativeISOString();
  } else {
    const mm = this.getMonth() + 1;
    const dd = this.getDate();
    const yyyy = this.getFullYear();
    return yyyy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd);
  }
};
