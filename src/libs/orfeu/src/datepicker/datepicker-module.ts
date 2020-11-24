import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AplsInputModule } from '../input';
import { AplsDialogModule } from '../dialog';
import { AplsCalendar, AplsCalendarHeader } from './calendar';
import { AplsCalendarBody } from './calendar-body';
import { AplsDatepicker, AplsDatepickerContent, APLS_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './datepicker';
import { AplsDatepickerInput } from './datepicker-input';
import { AplsDatepickerIntl } from './datepicker-intl';
import { AplsDatepickerToggle, AplsDatepickerToggleIcon } from './datepicker-toggle';
import { AplsMonthView } from './month-view';
import { AplsMultiYearView } from './multi-year-view';
import { AplsYearView } from './year-view';
import { AplsButtonModule } from '../button/public-api';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, AplsButtonModule, AplsDialogModule, OverlayModule, A11yModule, PortalModule, AplsInputModule, TranslateModule],
  exports: [
    AplsCalendar,
    AplsCalendarBody,
    AplsDatepicker,
    AplsDatepickerContent,
    AplsDatepickerInput,
    AplsDatepickerToggle,
    AplsDatepickerToggleIcon,
    AplsMonthView,
    AplsYearView,
    AplsMultiYearView,
    AplsCalendarHeader
  ],
  declarations: [
    AplsCalendar,
    AplsCalendarBody,
    AplsDatepicker,
    AplsDatepickerContent,
    AplsDatepickerInput,
    AplsDatepickerToggle,
    AplsDatepickerToggleIcon,
    AplsMonthView,
    AplsYearView,
    AplsMultiYearView,
    AplsCalendarHeader
  ],
  providers: [AplsDatepickerIntl, APLS_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
  entryComponents: [AplsDatepickerContent, AplsCalendarHeader]
})
export class AplsDatepickerModule {}
