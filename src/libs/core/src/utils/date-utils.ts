/**
 * @author Rogério Alves
 * @since 14/11/2018
 */

import { Injectable } from '@angular/core';

/**
 * Classe utilitária de Datas
 */
@Injectable({
  providedIn: 'root'
})
export class DateUtils {
  idioma = (<any>window).idioma;
  idiomaRegiao = (<any>window).idiomaRegiao;

  DATA_IGUAL = 0;
  DATA_MAIOR = 1;
  DATA_MENOR = -1;

  /**
   * Metodo utilizado para formatar a data de acordo com idioma informado
   *
   * @param data Exemplo Entrada: 2018-10-15T12:27:53Z
   * @return Exemplo Saída: 15/10/2018 09:27:53
   */
  formatarDataComHoraMinuto(data: string): string {
    if (!data) {
      return '';
    }

    const formato = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    };

    const novaData = new Date(data);
    const userTimezoneOffset = novaData.getTimezoneOffset();
    return new Intl.DateTimeFormat(this.idiomaRegiao, formato).format(new Date(novaData.getTime() + userTimezoneOffset));
  }

  /**
   * Metodo utilizado para formatar a data de acordo com idioma informado
   *
   * @param data Exemplo Entrada: 2018-10-15T12:27:53Z
   * @param idioma Exemplo Entrada: pt-BR
   * @return Exemplo Saída: 15/10/2018 09:27:53
   */
  formatarDataComHoraMinutoSemSegundos(data: string, idioma: string): string {
    if (!data) {
      return '';
    }

    const formato = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    };

    const novaData = new Date(data);
    const userTimezoneOffset = novaData.getTimezoneOffset();
    return new Intl.DateTimeFormat(this.idiomaRegiao, formato).format(new Date(novaData.getTime() + userTimezoneOffset));
  }

  /**
   * Método que irá retornar uma data formatada no seguinte padrão: dd/mm/yyyy hh:mm:ss
   *
   * @param data Exemplo Entrada: 2018-10-15T12:27:53Z
   * @return Exemplo Saída: 15/10/2018
   */
  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const formato = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour12: false
    };

    const novaData = new Date(data);
    const userTimezoneOffset = novaData.getTimezoneOffset() * 60000;
    return new Intl.DateTimeFormat(this.idiomaRegiao, formato).format(new Date(novaData.getTime() + userTimezoneOffset));
  }

  /**
   * Converte uma data string para date.
   * Ignora HH:MM:SS
   * @param dataStr Exemplo Entrada: 2018-10-15 | 01/01/2018
   */
  converterDateStrEmDate = function(dataStr, time = 10) {
    if (!dataStr || new String(dataStr).length < 10) return null;

    if (typeof dataStr === 'string') {
      let dtArray: any;

      if (dataStr.search('T') > -1) {
        return new Date(dataStr);
      } else if (dataStr.search('-') > -1) {
        dtArray = dataStr.split('-');
      } else if (dataStr.search('/') > -1) {
        dtArray = dataStr.split('/');
      }

      if (!!dtArray && dtArray.length == 3) {
        const mes = parseInt(dtArray[1]) - 1;
        const dia = parseInt(dtArray[2].toString().substring(0, 2));
        const ano = parseInt(dtArray[0]);
        return new Date(ano, mes, dia, time, time, time); // forca tempo para não ter problema em gmt
      }
    } else if (!isNaN(dataStr.getTime())) {
      return new Date(dataStr);
    }
  };

  /**
   * Converte uma data string para date.
   * Ignora HH:MM:SS
   * @param dataStr Exemplo Entrada: 2018-10-15 | 01/01/2018
   */
  converterDateEmDateDtr = function(currentDt: Date) {
    if (currentDt == null || currentDt == undefined) {
      return '';
    }

    var mm = currentDt.getMonth() + 1;

    var dd = currentDt.getDate();

    var yyyy = currentDt.getFullYear();

    return (dd < 10 ? '0' + dd : dd) + '/' + (mm < 10 ? '0' + mm : mm) + '/' + yyyy;
  };

  converterDateEmDateAgenda = function(currentDt: Date) {
    if (!currentDt) return '';

    var mm = currentDt.getMonth() + 1;

    var dd = currentDt.getDate();

    var yyyy = currentDt.getFullYear();

    return `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`;
  };

  /**
   * Função responsável por verificar se a data está no período informado. Pode-se considerar dias e horas.
   * @param dateInicial = Data inicial do período
   * @param dateFinal = Data final do período
   * @param dataRef = Data a ser verificada
   * @param considerarDia = Deve considerar dias?
   * @param considerarHoras = Deve considerar horas?
   *
   * Exemplo:
   * dataEstaNoPeriodo(riscoAtual.dataInicio, riscoAtual.dataFim, riscoParam.dataInicio, true, false)
   */
  dataEstaNoPeriodo(dateInicial, dateFinal, dataRef, considerarDia = true, considerarHoras = false): boolean {
    let dtI = new Date(dateInicial.getTime());
    let dtF = new Date(dateFinal.getTime());
    let dtR = new Date(dataRef.getTime());

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
  }

  /**
   * Função responsável por comparar duas datas. Podendo levar em consideração os dias ou não.
   *
   * @param date1 = data 1
   * @param date2 = data 2
   * @param considerarDia Flag que indica se a função deve considerar os dias na comparação
   * @returns {Boolean} 1 = Data 1 MAIOR = DEPOIS /
   * 					  0 = datas iguais /
   * 					 -1 = Data 1 MENOR = ANTES
   */
  compararDatas(date1, date2, considerarDia, considerarHoras): number {
    try {
      var dt1 = new Date(date1.getTime());
      var dt2 = new Date(date2.getTime());

      if (!considerarDia) {
        dt1.setDate(1);
        dt2.setDate(1);
      }

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
    } catch (error) {}
  }

  /**
   * Método utilizado para somar ou subtrair dias de uma data
   * @param data - Data que terá o dia adicionado/subtraído
   * @param dias - Quantidade de Dias que serão adicionados/removidos
   * Ex: Somar 5 dias somarDias(data, 5)
   *     Subtrair 5 dias somarDias(data, -5)
   */
  somarDias(data: Date, dias: number) {
    let novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  tratarAsUTC = function(date: Date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  };

  /**
   * Calcula o total de dias no periodo
   */
  totalDiasNoPeriodo = function(startDate: Date, endDate: Date) {
    startDate.setHours(0);
    startDate.setMilliseconds(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    endDate.setHours(0);
    endDate.setMilliseconds(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);

    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const dif = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (this.compararDatas(endDate, startDate, true, false) == -1) {
      return dif * -1;
    }

    return dif;
  };

   /**
   * Método utilizado para obter uma data de qualquer GMT em UTC, em texto. Geralmente utilizado para setar data no datepicker
   * @param data - Data em qualquer GMT.
   * @returns {string} Data UTC
   */
  obterDataUTCEmTexto(data: Date | string | number): string {
    const novaData = new Date(data);
    return novaData.getUTCFullYear() + '-' + ('0' + (novaData.getUTCMonth() + 1)).slice(- 2) + '-' + ('0' + novaData.getUTCDate()).slice(- 2);
  }

}
