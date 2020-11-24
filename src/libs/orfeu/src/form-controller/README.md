# Apls Disable FormController Directive

This directive allows control over the disable and enable functionality without restricting the form field ability of receiving a value in it's form object.

### How to use

The directive must be used in an element with a formcontrol, like ngModel or reactiveform. It receives a boolean to control it's behavior.

#### Methods

aplsDisableControll ( v : `boolean` ) : `void`

#### ex:

`<input aplsInput [aplsDisableControll]="isDisabled" formControlName="userName" />`
