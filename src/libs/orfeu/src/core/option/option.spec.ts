import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {AplsOption, AplsOptionModule} from '.';

describe('AplsOption component', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AplsOptionModule],
      declarations: [OptionWithDisable]
    }).compileComponents();
  }));

  it('should complete the `stateChanges` stream on destroy', () => {
    const fixture = TestBed.createComponent(OptionWithDisable);
    fixture.detectChanges();

    const optionInstance: AplsOption =
        fixture.debugElement.query(By.directive(AplsOption)).componentInstance;
    const completeSpy = jasmine.createSpy('complete spy');
    const subscription = optionInstance._stateChanges.subscribe(undefined, undefined, completeSpy);

    fixture.destroy();
    expect(completeSpy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  describe('ripples', () => {
    let fixture: ComponentFixture<OptionWithDisable>;
    let optionDebugElement: DebugElement;
    let optionNativeElement: HTMLElement;
    let optionInstance: AplsOption;

    beforeEach(() => {
      fixture = TestBed.createComponent(OptionWithDisable);
      fixture.detectChanges();

      optionDebugElement = fixture.debugElement.query(By.directive(AplsOption));
      optionNativeElement = optionDebugElement.nativeElement;
      optionInstance = optionDebugElement.componentInstance;
    });

    it('should show ripples by default', () => {
      expect(optionNativeElement.querySelectorAll('.apls-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially');

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.apls-ripple-element').length)
        .toBe(1, 'Expected one ripple to show up after a fake click.');
    });

    it('should not show ripples if the option is disabled', () => {
      expect(optionNativeElement.querySelectorAll('.apls-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      dispatchFakeEvent(optionNativeElement, 'mousedown');
      dispatchFakeEvent(optionNativeElement, 'mouseup');

      expect(optionNativeElement.querySelectorAll('.apls-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up after click on a disabled option.');
    });

  });

});

@Component({
  template: `<apls-option [disabled]="disabled"></apls-option>`
})
class OptionWithDisable {
  disabled: boolean;
}
