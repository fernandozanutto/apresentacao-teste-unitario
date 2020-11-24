import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AplsProgressBar} from './progress-bar';

@NgModule({
  imports: [CommonModule],
  exports: [AplsProgressBar],
  declarations: [AplsProgressBar],
})
export class AplsProgressBarModule {}
