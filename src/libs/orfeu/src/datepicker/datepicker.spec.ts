import {ENTER, ESCAPE, RIGHT_ARROW, UP_ARROW} from '@angular/cdk/keycodes';
import {Overlay, OverlayContainer, ScrollDispatcher} from '@angular/cdk/overlay';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing';
import {Component, FactoryProvider, Type, ValueProvider, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  DEC,
  JAN,
  JUL,
  JUN,
  APLS_DATE_LOCALE,
  AplsNativeDateModule,
  NativeDateModule,
  SEP,
} from '../core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {AplsInputModule} from '../input';
import {AplsDatepicker} from './datepicker';
import {AplsDatepickerInput} from './datepicker-input';
import {AplsDatepickerToggle} from './datepicker-toggle';
import {APLS_DATEPICKER_SCROLL_STRATEGY, AplsDatepickerIntl, AplsDatepickerModule} from '.';
import {Directionality} from '@angular/cdk/bidi';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('AplsDatepicker', () => {
  const SUPPORTS_INTL = typeof Intl != 'undefined';

  // Creates a test component fixture.
  function createComponent(
    component: Type<any>,
    imports: Type<any>[] = [],
    providers: (FactoryProvider | ValueProvider)[] = [],
    entryComponents: Type<any>[] = []): ComponentFixture<any> {

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        AplsDatepickerModule,
        AplsInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        ...imports
      ],
      providers,
      declarations: [component, ...entryComponents],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [entryComponents]
      }
    }).compileComponents();

    return TestBed.createComponent(component);
  }

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    container.ngOnDestroy();
  }));

  describe('with AplsNativeDateModule', () => {
    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(StandardDatepicker, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should initialize with correct value shown in input', () => {
        if (SUPPORTS_INTL) {
          expect(fixture.nativeElement.querySelector('input').value).toBe('1/1/2020');
        }
      });

      it('open non-touch should open popup', () => {
        expect(document.querySelector('.cdk-overlay-pane.apls-datepicker-popup')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane.apls-datepicker-popup')).not.toBeNull();
      });

      it('open touch should open dialog', () => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelector('.apls-datepicker-dialog apls-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.apls-datepicker-dialog apls-dialog-container'))
            .not.toBeNull();
      });

      it('should open datepicker if opened input is set to true', fakeAsync(() => {
        testComponent.opened = true;
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.apls-datepicker-content')).not.toBeNull();

        testComponent.opened = false;
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.apls-datepicker-content')).toBeNull();
      }));

      it('open in disabled mode should not open the calendar', () => {
        testComponent.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('apls-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('apls-dialog-container')).toBeNull();
      });

      it('disabled datepicker input should open the calendar if datepicker is enabled', () => {
        testComponent.datepicker.disabled = false;
        testComponent.datepickerInput.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
      });

      it('close should close popup', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        const popup = document.querySelector('.cdk-overlay-pane')!;
        expect(popup).not.toBeNull();
        expect(parseInt(getComputedStyle(popup).height as string)).not.toBe(0);

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(parseInt(getComputedStyle(popup).height as string)).toBe(0);
      }));

      it('should close the popup when pressing ESCAPE', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(testComponent.datepicker.opened).toBe(true, 'Expected datepicker to be open.');

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false, 'Expected datepicker to be closed.');
      }));

      it('close should close dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('apls-dialog-container')).not.toBeNull();

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('apls-dialog-container')).toBeNull();
      }));

      it('setting selected via click should update input and close calendar', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('apls-dialog-container')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        let cells = document.querySelectorAll('.apls-calendar-body-cell');
        dispatchMouseEvent(cells[1], 'click');
        fixture.detectChanges();
        flush();

        expect(document.querySelector('apls-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it('setting selected via enter press should update input and close calendar',
        fakeAsync(() => {
          testComponent.touch = true;
          fixture.detectChanges();

          testComponent.datepicker.open();
          fixture.detectChanges();
          flush();

          expect(document.querySelector('apls-dialog-container')).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

          let calendarBodyEl = document.querySelector('.apls-calendar-body') as HTMLElement;

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();
          flush();
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
          fixture.detectChanges();
          flush();

          expect(document.querySelector('apls-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
        }));

      it('clicking the currently selected date should close the calendar ' +
         'without firing selectedChanged', fakeAsync(() => {
        const selectedChangedSpy =
            spyOn(testComponent.datepicker._selectedChanged, 'next').and.callThrough();

        for (let changeCount = 1; changeCount < 3; changeCount++) {
          const currentDay = changeCount;
          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(document.querySelector('apls-datepicker-content')).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, currentDay));

          let cells = document.querySelectorAll('.apls-calendar-body-cell');
          dispatchMouseEvent(cells[1], 'click');
          fixture.detectChanges();
          flush();
        }

        expect(selectedChangedSpy.calls.count()).toEqual(1);
        expect(document.querySelector('apls-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it('pressing enter on the currently selected date should close the calendar without ' +
         'firing selectedChanged', () => {
        const selectedChangedSpy =
            spyOn(testComponent.datepicker._selectedChanged, 'next').and.callThrough();

        testComponent.datepicker.open();
        fixture.detectChanges();

        let calendarBodyEl = document.querySelector('.apls-calendar-body') as HTMLElement;
        expect(calendarBodyEl).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(selectedChangedSpy.calls.count()).toEqual(0);
          expect(document.querySelector('apls-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));
        });
      });

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('should attach popup to native input', () => {
        let attachToRef = testComponent.datepickerInput.getConnectedOverlayOrigin();
        expect(attachToRef.nativeElement.tagName.toLowerCase())
            .toBe('input', 'popup should be attached to native input');
      });

      it('should not throw when given wrong data type', () => {
        testComponent.date = '1/1/2017' as any;

        expect(() => fixture.detectChanges()).not.toThrow();
      });

      it('should clear out the backdrop subscriptions on close', fakeAsync(() => {
        for (let i = 0; i < 3; i++) {
          testComponent.datepicker.open();
          fixture.detectChanges();

          testComponent.datepicker.close();
          fixture.detectChanges();
        }

        testComponent.datepicker.open();
        fixture.detectChanges();

        const spy = jasmine.createSpy('close event spy');
        const subscription = testComponent.datepicker.closedStream.subscribe(spy);
        const backdrop = document.querySelector('.cdk-overlay-backdrop')! as HTMLElement;

        backdrop.click();
        fixture.detectChanges();
        flush();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(testComponent.datepicker.opened).toBe(false);
        subscription.unsubscribe();
      }));

      it('should reset the datepicker when it is closed externally',
        fakeAsync(inject([OverlayContainer], (oldOverlayContainer: OverlayContainer) => {

          // Destroy the old container manually since resetting the testing module won't do it.
          oldOverlayContainer.ngOnDestroy();
          TestBed.resetTestingModule();

          const scrolledSubject = new Subject();

          // Stub out a `CloseScrollStrategy` so we can trigger a detachment via the `OverlayRef`.
          fixture = createComponent(StandardDatepicker, [AplsNativeDateModule], [
            {
              provide: ScrollDispatcher,
              useValue: {scrolled: () => scrolledSubject}
            },
            {
              provide: APLS_DATEPICKER_SCROLL_STRATEGY,
              deps: [Overlay],
              useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close()
            }
          ]);

          fixture.detectChanges();
          testComponent = fixture.componentInstance;

          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(testComponent.datepicker.opened).toBe(true);

          scrolledSubject.next();
          flush();
          fixture.detectChanges();

          expect(testComponent.datepicker.opened).toBe(false);
        }))
      );

      it('should close the datpeicker using ALT + UP_ARROW', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(true);

        const event = createKeyboardEvent('keydown', UP_ARROW);
        Object.defineProperty(event, 'altKey', {get: () => true});

        dispatchEvent(document.body, event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false);
      }));

    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', fakeAsync(() => {
        let fixture = createComponent(MultiInputDatepicker, [AplsNativeDateModule]);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker with no inputs', () => {
      let fixture: ComponentFixture<NoInputDatepicker>;
      let testComponent: NoInputDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(NoInputDatepicker, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should not throw when accessing disabled property', () => {
        expect(() => testComponent.datepicker.disabled).not.toThrow();
      });

      it('should throw when opened with no registered inputs', fakeAsync(() => {
        expect(() => testComponent.datepicker.open()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartAt, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with startView set to year', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewYear>;
      let testComponent: DatepickerWithStartViewYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewYear, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        const firstCalendarCell = document.querySelector('.apls-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent)
            .toBe('JAN', 'Expected the calendar to be in year-view');
      });

      it('should fire yearSelected when user selects calendar year in year view',
        fakeAsync(() => {
          spyOn(testComponent, 'onYearSelection');
          expect(testComponent.onYearSelection).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          const cells = document.querySelectorAll('.apls-calendar-body-cell');

          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onYearSelection).toHaveBeenCalled();
        })
      );
    });

    describe('datepicker with startView set to multiyear', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewMultiYear>;
      let testComponent: DatepickerWithStartViewMultiYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewMultiYear, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;

        spyOn(testComponent, 'onMultiYearSelection');
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        const firstCalendarCell = document.querySelector('.apls-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent)
            .toBe('2016', 'Expected the calendar to be in multi-year-view');
      });

      it('should fire yearSelected when user selects calendar year in multiyear view',
        fakeAsync(() => {
          expect(testComponent.onMultiYearSelection).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          const cells = document.querySelectorAll('.apls-calendar-body-cell');

          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onMultiYearSelection).toHaveBeenCalled();
        })
      );
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithNgModel, [AplsNativeDateModule]);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
        });
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', fakeAsync(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      }));

      it('should update model when date is selected', fakeAsync(() => {
        expect(testComponent.selected).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._select(selected);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.selected).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      }));
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFormControl, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      });

      it('should update formControl when date is selected', () => {
        expect(testComponent.formControl.value).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._select(selected);
        fixture.detectChanges();

        expect(testComponent.formControl.value).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });

      it('should disable toggle when form control disabled', () => {
        expect(testComponent.datepickerToggle.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(testComponent.datepickerToggle.disabled).toBe(true);
      });
    });

    describe('datepicker with apls-datepicker-toggle', () => {
      let fixture: ComponentFixture<DatepickerWithToggle>;
      let testComponent: DatepickerWithToggle;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithToggle, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should remove the underlying SVG icon from the tab order', () => {
        const icon = fixture.debugElement.nativeElement.querySelector('svg');
        expect(icon.getAttribute('focusable')).toBe('false');
      });
    });

    describe('datepicker with custom apls-datepicker-toggle icon', () => {
      it('should be able to override the apls-datepicker-toggle icon', fakeAsync(() => {
        const fixture = createComponent(DatepickerWithCustomIcon, [AplsNativeDateModule]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.apls-datepicker-toggle .custom-icon'))
            .toBeTruthy('Expected custom icon to be rendered.');

        expect(fixture.nativeElement.querySelector('.apls-datepicker-toggle apls-icon'))
            .toBeFalsy('Expected default icon to be removed.');
      }));
    });

    describe('datepicker inside apls-form-field', () => {
      let fixture: ComponentFixture<FormFieldDatepicker>;
      let testComponent: FormFieldDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(FormFieldDatepicker, [AplsNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should float the placeholder when an invalid value is entered', () => {
        testComponent.datepickerInput.value = 'totally-not-a-date' as any;
        fixture.debugElement.nativeElement.querySelector('input').value = 'totally-not-a-date';
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('apls-form-field').classList)
          .toContain('apls-form-field-should-float');
      });
    });

    describe('datepicker with min and max dates and validation', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
      let testComponent: DatepickerWithMinAndMaxValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithMinAndMaxValidation, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker._minDate).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker._maxDate).toEqual(new Date(2020, JAN, 1));
      });

    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFilterAndValidation, [AplsNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should disable filtered calendar cells', () => {
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('apls-dialog-container')).not.toBeNull();

        let cells = document.querySelectorAll('.apls-calendar-body-cell');
        expect(cells[0].classList).toContain('apls-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('apls-calendar-body-disabled');
      });
    });

    describe('datepicker with change and input events', () => {
      let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
      let testComponent: DatepickerWithChangeAndInputEvents;
      let inputEl: HTMLInputElement;

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should fire input and dateInput events when user types input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });

      it('should fire change and dateChange events when user commits typed input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'change');
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });

      it('should fire dateChange and dateInput events when user selects calendar date',
        fakeAsync(() => {
          expect(testComponent.onChange).not.toHaveBeenCalled();
          expect(testComponent.onDateChange).not.toHaveBeenCalled();
          expect(testComponent.onInput).not.toHaveBeenCalled();
          expect(testComponent.onDateInput).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(document.querySelector('apls-dialog-container')).not.toBeNull();

          const cells = document.querySelectorAll('.apls-calendar-body-cell');
          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onChange).not.toHaveBeenCalled();
          expect(testComponent.onDateChange).toHaveBeenCalled();
          expect(testComponent.onInput).not.toHaveBeenCalled();
          expect(testComponent.onDateInput).toHaveBeenCalled();
        })
      );

      it('should not fire the dateInput event if the value has not changed', () => {
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '12/12/2012';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);
      });

    });

    describe('with ISO 8601 strings as input', () => {
      let fixture: ComponentFixture<DatepickerWithISOStrings>;
      let testComponent: DatepickerWithISOStrings;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithISOStrings, [AplsNativeDateModule]);
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should coerce ISO strings', fakeAsync(() => {
        expect(() => fixture.detectChanges()).not.toThrow();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepicker.startAt).toEqual(new Date(2017, JUL, 1));
        expect(testComponent.datepickerInput.value).toEqual(new Date(2017, JUN, 1));
        expect(testComponent.datepickerInput.min).toEqual(new Date(2017, JAN, 1));
        expect(testComponent.datepickerInput.max).toEqual(new Date(2017, DEC, 31));
      }));
    });

    describe('with events', () => {
      let fixture: ComponentFixture<DatepickerWithEvents>;
      let testComponent: DatepickerWithEvents;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithEvents, [AplsNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('should dispatch an event when a datepicker is opened', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(testComponent.openedSpy).toHaveBeenCalled();
      });

      it('should dispatch an event when a datepicker is closed', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        testComponent.datepicker.close();
        flush();
        fixture.detectChanges();

        expect(testComponent.closedSpy).toHaveBeenCalled();
      }));

    });

    describe('datepicker that opens on focus', () => {
      let fixture: ComponentFixture<DatepickerOpeningOnFocus>;
      let testComponent: DatepickerOpeningOnFocus;
      let input: HTMLInputElement;

      it('should not reopen if the browser fires the focus event asynchronously', fakeAsync(() => {
        // Stub out the real focus method so we can call it reliably.
        spyOn(input, 'focus').and.callFake(() => {
          // Dispatch the event handler async to simulate the IE11 behavior.
          Promise.resolve().then(() => dispatchFakeEvent(input, 'focus'));
        });

        // Open initially by focusing.
        input.focus();
        fixture.detectChanges();
        flush();

        // Due to some browser limitations we can't install a stub on `document.activeElement`
        // so instead we have to override the previously-focused element manually.
        (fixture.componentInstance.datepicker as any)._focusedElementBeforeOpen = input;

        // Ensure that the datepicker is actually open.
        expect(testComponent.datepicker.opened).toBe(true, 'Expected datepicker to be open.');

        // Close the datepicker.
        testComponent.datepicker.close();
        fixture.detectChanges();

        // Schedule the input to be focused asynchronously.
        input.focus();
        fixture.detectChanges();

        // Flush out the scheduled tasks.
        flush();

        expect(testComponent.datepicker.opened).toBe(false, 'Expected datepicker to be closed.');
      }));
    });

    describe('datepicker directionality', () => {
      it('should pass along the directionality to the popup', () => {
        const fixture = createComponent(StandardDatepicker, [AplsNativeDateModule], [{
          provide: Directionality,
          useValue: ({value: 'rtl'})
        }]);

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        const overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      });

      it('should update the popup direction if the directionality value changes', fakeAsync(() => {
        const dirProvider = {value: 'ltr'};
        const fixture = createComponent(StandardDatepicker, [AplsNativeDateModule], [{
          provide: Directionality,
          useFactory: () => dirProvider
        }]);

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        let overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('ltr');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();

        dirProvider.value = 'rtl';
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      }));

      it('should pass along the directionality to the dialog in touch mode', () => {
        const fixture = createComponent(StandardDatepicker, [AplsNativeDateModule], [{
          provide: Directionality,
          useValue: ({value: 'rtl'})
        }]);

        fixture.componentInstance.touch = true;
        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        const overlay = document.querySelector('.cdk-global-overlay-wrapper')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      });

    });

  });

  describe('with missing DateAdapter and APLS_DATE_FORMATS', () => {
    it('should throw when created', () => {
      expect(() => createComponent(StandardDatepicker))
        .toThrowError(/AplsDatepicker: No provider found for .*/);
    });
  });

  describe('internationalization', () => {
    let fixture: ComponentFixture<DatepickerWithi18n>;
    let testComponent: DatepickerWithi18n;
    let input: HTMLInputElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(DatepickerWithi18n, [AplsNativeDateModule, NativeDateModule],
        [{provide: APLS_DATE_LOCALE, useValue: 'de-DE'}]);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    }));

    it('should have the correct input value even when inverted date format', fakeAsync(() => {
      if (typeof Intl === 'undefined') {
        // Skip this test if the internationalization API is not supported in the current
        // browser. Browsers like Safari 9 do not support the "Intl" API.
        return;
      }

      const selected = new Date(2017, SEP, 1);
      testComponent.date = selected;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Normally the proper date format would 01.09.2017, but some browsers seem format the
      // date without the leading zero. (e.g. 1.9.2017).
      expect(input.value).toMatch(/0?1\.0?9\.2017/);
      expect(testComponent.datepickerInput.value).toBe(selected);
    }));
  });

  describe('datepicker with custom header', () => {
    let fixture: ComponentFixture<DatepickerWithCustomHeader>;
    let testComponent: DatepickerWithCustomHeader;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(
        DatepickerWithCustomHeader,
        [AplsNativeDateModule],
        [],
        [CustomHeaderForDatepicker]
      );
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    }));

    it('should instantiate a datepicker with a custom header', fakeAsync(() => {
      expect(testComponent).toBeTruthy();
    }));

    it('should find the standard header element', fakeAsync(() => {
      testComponent.datepicker.open();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(document.querySelector('apls-calendar-header')).toBeTruthy();
    }));
  });
});


@Component({
  template: `
    <input [aplsDatepicker]="d" [value]="date">
    <apls-datepicker #d [touchUi]="touch" [disabled]="disabled" [opened]="opened"></apls-datepicker>
  `,
})
class StandardDatepicker {
  opened = false;
  touch = false;
  disabled = false;
  date: Date | null = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d"><input [aplsDatepicker]="d"><apls-datepicker #d></apls-datepicker>
  `,
})
class MultiInputDatepicker {}


@Component({
  template: `<apls-datepicker #d></apls-datepicker>`,
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [value]="date">
    <apls-datepicker #d [startAt]="startDate"></apls-datepicker>
  `,
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [value]="date">
    <apls-datepicker #d startView="year" (monthSelected)="onYearSelection()"></apls-datepicker>
  `,
})
class DatepickerWithStartViewYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: AplsDatepicker<Date>;

  onYearSelection() {}
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [value]="date">
    <apls-datepicker #d startView="multi-year"
        (yearSelected)="onMultiYearSelection()"></apls-datepicker>
  `,
})
class DatepickerWithStartViewMultiYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: AplsDatepicker<Date>;

  onMultiYearSelection() {}
}


@Component({
  template: `
    <input [(ngModel)]="selected" [aplsDatepicker]="d">
    <apls-datepicker #d></apls-datepicker>
  `,
})
class DatepickerWithNgModel {
  selected: Date | null = null;
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
}


@Component({
  template: `
    <input [formControl]="formControl" [aplsDatepicker]="d">
    <apls-datepicker-toggle [for]="d"></apls-datepicker-toggle>
    <apls-datepicker #d></apls-datepicker>
  `,
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
  @ViewChild(AplsDatepickerToggle) datepickerToggle: AplsDatepickerToggle<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d">
    <apls-datepicker-toggle [for]="d"></apls-datepicker-toggle>
    <apls-datepicker #d [touchUi]="touchUI"></apls-datepicker>
  `,
})
class DatepickerWithToggle {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) input: AplsDatepickerInput<Date>;
  touchUI = true;
}


@Component({
  template: `
    <input [aplsDatepicker]="d">
    <apls-datepicker-toggle [for]="d">
      <div class="custom-icon" aplsDatepickerToggleIcon></div>
    </apls-datepicker-toggle>
    <apls-datepicker #d></apls-datepicker>
  `,
})
class DatepickerWithCustomIcon {}


@Component({
  template: `
      <apls-form-field>
        <input aplsInput [aplsDatepicker]="d">
        <apls-datepicker #d></apls-datepicker>
      </apls-form-field>
  `,
})
class FormFieldDatepicker {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate">
    <apls-datepicker-toggle [for]="d"></apls-datepicker-toggle>
    <apls-datepicker #d></apls-datepicker>
  `,
})
class DatepickerWithMinAndMaxValidation {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  date: Date | null;
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [(ngModel)]="date" [aplsDatepickerFilter]="filter">
    <apls-datepicker-toggle [for]="d"></apls-datepicker-toggle>
    <apls-datepicker #d [touchUi]="true"></apls-datepicker>
  `,
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  date: Date;
  filter = (date: Date) => date.getDate() != 1;
}


@Component({
  template: `
    <input [aplsDatepicker]="d" (change)="onChange()" (input)="onInput()"
           (dateChange)="onDateChange()" (dateInput)="onDateInput()">
    <apls-datepicker #d [touchUi]="true"></apls-datepicker>
  `
})
class DatepickerWithChangeAndInputEvents {
  @ViewChild('d') datepicker: AplsDatepicker<Date>;

  onChange() {}

  onInput() {}

  onDateChange() {}

  onDateInput() {}
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [(ngModel)]="date">
    <apls-datepicker #d></apls-datepicker>
  `
})
class DatepickerWithi18n {
  date: Date | null = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max">
    <apls-datepicker #d [startAt]="startAt"></apls-datepicker>
  `
})
class DatepickerWithISOStrings {
  value = new Date(2017, JUN, 1).toISOString();
  min = new Date(2017, JAN, 1).toISOString();
  max = new Date (2017, DEC, 31).toISOString();
  startAt = new Date(2017, JUL, 1).toISOString();
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
  @ViewChild(AplsDatepickerInput) datepickerInput: AplsDatepickerInput<Date>;
}


@Component({
  template: `
    <input [(ngModel)]="selected" [aplsDatepicker]="d">
    <apls-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></apls-datepicker>
  `,
})
class DatepickerWithEvents {
  selected: Date | null = null;
  openedSpy = jasmine.createSpy('opened spy');
  closedSpy = jasmine.createSpy('closed spy');
  @ViewChild('d') datepicker: AplsDatepicker<Date>;
}


@Component({
  template: `
    <input (focus)="d.open()" [aplsDatepicker]="d">
    <apls-datepicker #d="aplsDatepicker"></apls-datepicker>
  `,
})
class DatepickerOpeningOnFocus {
  @ViewChild(AplsDatepicker) datepicker: AplsDatepicker<Date>;
}


@Component({
  template: `
    <input [aplsDatepicker]="ch">
    <apls-datepicker #ch [calendarHeaderComponent]="CustomHeaderForDatepicker"></apls-datepicker>
  `,
})
class DatepickerWithCustomHeader {
  @ViewChild('ch') datepicker: AplsDatepicker<Date>;
}

@Component({
  template: `
    <div>Custom element</div>
    <apls-calendar-header></apls-calendar-header>
  `,
})
class CustomHeaderForDatepicker {}
