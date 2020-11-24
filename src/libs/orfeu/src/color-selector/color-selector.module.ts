import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AplsColorSelectorComponent, AplsColorSelectorPaletteComponent } from './components';

@NgModule({
  imports: [CommonModule],
  declarations: [AplsColorSelectorComponent, AplsColorSelectorPaletteComponent],
  exports: [AplsColorSelectorComponent, AplsColorSelectorPaletteComponent]
})
export class AplsColorSelectorModule {}
