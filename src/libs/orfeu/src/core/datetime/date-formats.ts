import {InjectionToken} from '@angular/core';

export type AplsDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
  }
};

export const APLS_DATE_FORMATS = new InjectionToken<AplsDateFormats>('apls-date-formats');
