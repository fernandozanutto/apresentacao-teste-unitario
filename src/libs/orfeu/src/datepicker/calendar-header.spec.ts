import {Direction, Directionality} from '@angular/cdk/bidi';
import {AplsDatepickerModule} from './datepicker-module';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AplsDatepickerIntl} from './datepicker-intl';
import {DEC, FEB, JAN, AplsNativeDateModule} from '../core';
import {Component} from '@angular/core';
import {AplsCalendar} from './calendar';
import {By} from '@angular/platform-browser';
import {yearsPerPage} from './multi-year-view';

describe('AplsCalendarHeader', () => {
  let dir: { value: Direction };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AplsNativeDateModule,
        AplsDatepickerModule,
      ],
      declarations: [
        // Test components.
        StandardCalendar,
      ],
      providers: [
        AplsDatepickerIntl,
        {provide: Directionality, useFactory: () => dir = {value: 'ltr'}}
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar', () => {
    let fixture: ComponentFixture<StandardCalendar>;
    let testComponent: StandardCalendar;
    let calendarElement: HTMLElement;
    let periodButton: HTMLElement;
    let prevButton: HTMLElement;
    let nextButton: HTMLElement;
    let calendarInstance: AplsCalendar<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendar);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(AplsCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton = calendarElement.querySelector('.apls-calendar-period-button') as HTMLElement;
      prevButton = calendarElement.querySelector('.apls-calendar-previous-button') as HTMLElement;
      nextButton = calendarElement.querySelector('.apls-calendar-next-button') as HTMLElement;

      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should be in month view with specified month active', () => {
      expect(calendarInstance.currentView).toBe('month');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should toggle view when period clicked', () => {
      expect(calendarInstance.currentView).toBe('month');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('month');
    });

    it('should go to next and previous month', () => {
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, FEB, 28));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 28));
    });

    it('should go to previous and next year', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      (calendarElement.querySelector('.apls-calendar-body-active') as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('year');

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2018, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go to previous and next multi-year range', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017 + yearsPerPage, JAN, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));
    });

    it('should go back to month view after selecting year and month', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('multi-year');
      expect(calendarInstance.activeDate).toEqual(new Date(2017, JAN, 31));

      let yearCells = calendarElement.querySelectorAll('.apls-calendar-body-cell');
      (yearCells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('year');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, JAN, 31));

      let monthCells = calendarElement.querySelectorAll('.apls-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe('month');
      expect(calendarInstance.activeDate).toEqual(new Date(2016, DEC, 31));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });

  });
});

@Component({
  template: `
    <apls-calendar
        [startAt]="startDate"
        [(selected)]="selected"
        (yearSelected)="selectedYear=$event"
        (monthSelected)="selectedMonth=$event">
    </apls-calendar>`
})
class StandardCalendar {
  selected: Date;
  selectedYear: Date;
  selectedMonth: Date;
  startDate = new Date(2017, JAN, 31);
}
