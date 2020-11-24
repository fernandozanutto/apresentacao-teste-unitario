import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AplsDisableFormControllerDirective } from './apls-disable-form-controller.directive';

@NgModule({
  declarations: [AplsDisableFormControllerDirective],
  exports: [AplsDisableFormControllerDirective],
  imports: [
    CommonModule
  ]
})
export class FormControllerModule { }
