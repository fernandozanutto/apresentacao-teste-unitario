import {NgModule} from '@angular/core';
import {AplsProgressSpinner, AplsSpinner} from './progress-spinner';


@NgModule({
  exports: [
    AplsProgressSpinner,
    AplsSpinner,
  ],
  declarations: [
    AplsProgressSpinner,
    AplsSpinner
  ],
})
class AplsProgressSpinnerModule {}

export {AplsProgressSpinnerModule};
