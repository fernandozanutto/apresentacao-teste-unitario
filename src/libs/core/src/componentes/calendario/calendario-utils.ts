import { addDays, addMinutes, endOfDay, getDaysInMonth, startOfDay, startOfWeek } from 'date-fns';
import { cor_dia_concorrido, cor_dia_lotado, cor_dia_moderado, cor_dia_tranquilo, cor_dia_vazio } from './calendario.constantes';

export interface HorarioIntervalo {
  diaHorario: Date;
  dia: string;
  horarioInicial: string;
  horarioFinal: string;
  intervaloMinuto: number;
}

export abstract class AplsCalendarioUtils {
  static QUANTIDADE_DIAS_NA_SEMANA = 7;
  static INICIO_SEMANA = 0;

  private static cloneDate = (date: Date) => new Date(date.getTime());

  private static retornaTodosOsDiasDoMes(date: Date) {
    const daysInMonth = getDaysInMonth(date);
    const days = [];
    for (let index = 1; index <= daysInMonth; index++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), index));
    }
    return days;
  }

  public static retornaSemanasDoMes(date: Date, { firstDayOfWeek = 0, forceSixRows = false } = {}): Date[] {
    let days = this.retornaTodosOsDiasDoMes(date);
    let daysInMonth = days.length;
    let week = [];
    let weeks = [];

    // build weeks array
    days.forEach(day => {
      if (week.length > 0 && day.getDay() === firstDayOfWeek) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
      if (days.indexOf(day) === days.length - 1) {
        weeks.push(week);
      }
    });

    // unshift days to start the first week
    const firstWeek = weeks[0];
    for (let index = this.QUANTIDADE_DIAS_NA_SEMANA - firstWeek.length; index > 0; index--) {
      const outsideDate = this.cloneDate(firstWeek[0]);
      outsideDate.setDate(firstWeek[0].getDate() - 1);
      firstWeek.unshift(outsideDate);
      daysInMonth++;
    }

    // push days until the end of the last week
    const lastWeek = weeks[weeks.length - 1];
    for (let index = lastWeek.length; index < this.QUANTIDADE_DIAS_NA_SEMANA; index++) {
      const outsideDate = this.cloneDate(lastWeek[lastWeek.length - 1]);
      outsideDate.setDate(lastWeek[lastWeek.length - 1].getDate() + 1);
      lastWeek.push(outsideDate);
      daysInMonth++;
    }

    // handle six rows if we need to
    if (forceSixRows && daysInMonth < 42) {
      let lastDayOfMonth = weeks[weeks.length - 1][6];
      let lastWeek = [];
      let index = 1;
      while (daysInMonth < 42) {
        let lastDayOfMonthClone = this.cloneDate(lastDayOfMonth);
        let day = new Date(lastDayOfMonthClone.setDate(lastDayOfMonthClone.getDate() + index));
        if (lastWeek.length > 0 && day.getDay() === firstDayOfWeek) {
          weeks.push(lastWeek);
          lastWeek = [];
        }
        lastWeek.push(day);
        daysInMonth++;
        index++;
      }
      // push last week after finishing loop
      weeks.push(lastWeek);
    }

    return weeks;
  }

  public static retornaDiasDaSemana(date: Date): Date[] {
    let startDay = startOfWeek(date);
    startDay = addDays(startDay, this.INICIO_SEMANA);

    const days = [startDay];

    for (let index = 1; index < this.QUANTIDADE_DIAS_NA_SEMANA; index++) {
      days.push(addDays(startDay, index));
    }

    return days;
  }

  public static retornaHorariosdoDia(day: Date, startInterval: number, endInterval: number, interval: number): HorarioIntervalo[] {
    const hoursResult: HorarioIntervalo[] = [];

    let startHour = startOfDay(day);
    startHour = addMinutes(startHour, startInterval - interval);

    const endHour = addMinutes(startOfDay(day), endInterval);

    for (let index = interval; ; index = index + interval) {
      const newHour = addMinutes(startHour, index);
      if (newHour >= endHour || newHour > endOfDay(day)) {
        if (newHour > endHour) hoursResult.pop();

        break;
      }

      const { dia, horario: horarioInicial } = this.mapDateToDiaHorario(newHour);

      const { horario: horarioFinal } = this.mapDateToDiaHorario(new Date(newHour).addMinutos(interval));

      hoursResult.push({ diaHorario: newHour, intervaloMinuto: interval, horarioFinal, dia, horarioInicial });
    }

    return hoursResult;
  }

  public static definirCorDia(percentual: number): string {
    if (percentual === 0) return cor_dia_vazio;
    if (percentual === 100) return cor_dia_lotado;
    if (percentual >= 1 && percentual <= 33) return cor_dia_tranquilo;
    if (percentual >= 34 && percentual <= 66) return cor_dia_moderado;
    if (percentual >= 67 && percentual <= 99) return cor_dia_concorrido;
  }

  public static converterDiaSemanaBackEnd(diaSemanaFront: number): string {
    switch (diaSemanaFront) {
      case 0:
        return 'DOMINGO';
      case 1:
        return 'SEGUNDA';
      case 2:
        return 'TERCA';
      case 3:
        return 'QUARTA';
      case 4:
        return 'QUINTA';
      case 5:
        return 'SEXTA';
      case 6:
        return 'SABADO';
    }
  }

  public static converterHorarioStringParaMinutos(horarioString: string): number {
    const [hora, minuto] = horarioString.split(':');
    return +hora * 60 + +minuto;
  }

  public static converterHorarioMinutosParaString(horarioMinutos: number): string {
    return `${Math.floor(horarioMinutos / 60)
      .toString()
      .padStart(2, '0')}:${(horarioMinutos % 60).toString().padStart(2, '0')}`;
  }

  public static mapDateToDiaHorario(data: Date): { dia: string; horario: string } {
    const MM = data.getMonth() + 1;
    const dd = data.getDate();
    const yyyy = data.getFullYear();
    const hh = data.getHours();
    const ss = data.getMinutes();
    const dia = `${yyyy}-${MM < 10 ? '0' + MM : MM}-${dd < 10 ? '0' + dd : dd}`;
    const horario = `${hh < 10 ? '0' + hh : hh}:${ss < 10 ? '0' + ss : ss}`;
    return { dia, horario };
  }
}
