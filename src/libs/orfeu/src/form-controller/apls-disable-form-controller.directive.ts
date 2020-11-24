import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * @author Carlos Ramos
 *
 * Directive that allows control over the disable and enable functionality without
 * restricting the form field ability of receiving a value in it's form object.
 */

/**
 * The directive must be used in an element with a formcontrol,
 * like ngModel or reactiveform. It receives a boolean to control it's behavior.
 * ex:
 * <input aplsInput  [aplsDisableControll]="isDisabled" formControlName="userName" />
 */
@Directive({
  selector: '[aplsDisableControll], aplsDisableControll'
})
export class AplsDisableFormControllerDirective {
  @Input() set aplsDisableControll(v: boolean) {
    this.ngControll.control[v === true ? 'disable' : 'enable']({ emitEvent: false });
  }
  constructor(private ngControll: NgControl) {}
}
