import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {AplsProgressSpinnerModule, AplsProgressSpinner} from '.';


describe('AplsProgressSpinner', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AplsProgressSpinnerModule],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        ProgressSpinnerWithValueAndBoundMode,
        ProgressSpinnerWithColor,
        ProgressSpinnerCustomStrokeWidth,
        ProgressSpinnerCustomDiameter,
        SpinnerWithColor,
        ProgressSpinnerWithStringValues,
      ],
    }).compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of zero for the value attribute', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));
    expect(progressElement.componentInstance.value).toBe(0);
  });

  it('should set the value to 0 when the mode is set to indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));
    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(progressElement.componentInstance.value).toBe(50);
    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);
  });

  it('should retain the value if it updates while indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(50);

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);

    fixture.componentInstance.value = 75;
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(75);
  });

  it('should clamp the value of the progress between 0 and 100', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));
    let progressComponent = progressElement.componentInstance;

    progressComponent.value = 50;
    expect(progressComponent.value).toBe(50);

    progressComponent.value = 0;
    expect(progressComponent.value).toBe(0);

    progressComponent.value = 100;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = 999;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = -10;
    expect(progressComponent.value).toBe(0);
  });

  it('should default to a stroke width that is 10% of the diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
    const spinner = fixture.debugElement.query(By.directive(AplsProgressSpinner));

    fixture.componentInstance.diameter = 67;
    fixture.detectChanges();

    expect(spinner.componentInstance.strokeWidth).toBe(6.7);
  });

  it('should allow a custom diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
    const spinner = fixture.debugElement.query(By.css('apls-progress-spinner')).nativeElement;
    const svgElement = fixture.nativeElement.querySelector('svg');

    fixture.componentInstance.diameter = 32;
    fixture.detectChanges();

    expect(parseInt(spinner.style.width))
        .toBe(32, 'Expected the custom diameter to be applied to the host element width.');
    expect(parseInt(spinner.style.height))
        .toBe(32, 'Expected the custom diameter to be applied to the host element height.');
    expect(parseInt(svgElement.style.width))
        .toBe(32, 'Expected the custom diameter to be applied to the svg element width.');
    expect(parseInt(svgElement.style.height))
        .toBe(32, 'Expected the custom diameter to be applied to the svg element height.');
    expect(svgElement.getAttribute('viewBox'))
        .toBe('0 0 25.2 25.2', 'Expected the custom diameter to be applied to the svg viewBox.');
  });

  it('should allow a custom stroke width', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const circleElement = fixture.nativeElement.querySelector('circle');
    const svgElement = fixture.nativeElement.querySelector('svg');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(parseInt(circleElement.style.strokeWidth)).toBe(40, 'Expected the custom stroke ' +
      'width to be applied to the circle element as a percentage of the element size.');
    expect(svgElement.getAttribute('viewBox'))
      .toBe('0 0 130 130', 'Expected the viewBox to be adjusted based on the stroke width.');
  });

  it('should expand the host element if the stroke width is greater than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.apls-progress-spinner');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('100px');
  });

  it('should not collapse the host element if the stroke width is less than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.apls-progress-spinner');

    fixture.componentInstance.strokeWidth = 5;
    fixture.detectChanges();

    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('100px');
  });

  it('should set the color class on the apls-spinner', () => {
    let fixture = TestBed.createComponent(SpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-spinner'));

    expect(progressElement.nativeElement.classList).toContain('apls-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('apls-accent');
    expect(progressElement.nativeElement.classList).not.toContain('apls-primary');
  });

  it('should set the color class on the apls-progress-spinner', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('apls-progress-spinner'));

    expect(progressElement.nativeElement.classList).toContain('apls-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('apls-accent');
    expect(progressElement.nativeElement.classList).not.toContain('apls-primary');
  });

  it('should remove the underlying SVG element from the tab order explicitly', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg').getAttribute('focusable')).toBe('false');
  });

  it('should handle the number inputs being passed in as strings', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithStringValues);
    const spinner = fixture.debugElement.query(By.directive(AplsProgressSpinner));
    const svgElement = spinner.nativeElement.querySelector('svg');

    fixture.detectChanges();

    expect(spinner.componentInstance.diameter).toBe(37);
    expect(spinner.componentInstance.strokeWidth).toBe(11);
    expect(spinner.componentInstance.value).toBe(25);

    expect(spinner.nativeElement.style.width).toBe('37px');
    expect(spinner.nativeElement.style.height).toBe('37px');
    expect(svgElement.style.width).toBe('37px');
    expect(svgElement.style.height).toBe('37px');
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 38 38');
  });

  it('should update the element size when changed dynamically', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    let spinner = fixture.debugElement.query(By.directive(AplsProgressSpinner));
    spinner.componentInstance.diameter = 32;
    fixture.detectChanges();
    expect(spinner.nativeElement.style.width).toBe('32px');
    expect(spinner.nativeElement.style.height).toBe('32px');
  });
});


@Component({template: '<apls-progress-spinner></apls-progress-spinner>'})
class BasicProgressSpinner {}

@Component({template: '<apls-progress-spinner [strokeWidth]="strokeWidth"></apls-progress-spinner>'})
class ProgressSpinnerCustomStrokeWidth {
  strokeWidth: number;
}

@Component({template: '<apls-progress-spinner [diameter]="diameter"></apls-progress-spinner>'})
class ProgressSpinnerCustomDiameter {
  diameter: number;
}

@Component({template: '<apls-progress-spinner mode="indeterminate"></apls-progress-spinner>'})
class IndeterminateProgressSpinner { }

@Component({
  template: '<apls-progress-spinner [value]="value" [mode]="mode"></apls-progress-spinner>'
})
class ProgressSpinnerWithValueAndBoundMode {
  mode = 'indeterminate';
  value = 50;
}

@Component({template: `<apls-spinner [color]="color"></apls-spinner>`})
class SpinnerWithColor { color: string = 'primary'; }

@Component({template: `<apls-progress-spinner value="50" [color]="color"></apls-progress-spinner>`})
class ProgressSpinnerWithColor { color: string = 'primary'; }

@Component({
  template: `
    <apls-progress-spinner value="25" diameter="37" strokeWidth="11"></apls-progress-spinner>
  `
})
class ProgressSpinnerWithStringValues { }
