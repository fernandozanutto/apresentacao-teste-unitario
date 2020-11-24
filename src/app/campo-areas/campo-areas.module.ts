import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AplsSelectModule, AplsInputModule } from '../../libs/orfeu';
import { AplsPreloaderModule } from '../preloader/preloader.component';
import { CampoAreasComponent } from './campo-areas.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AplsPreloaderModule, AplsSelectModule, AplsInputModule],
  declarations: [CampoAreasComponent],
  exports: [CampoAreasComponent]
})
export class CampoAreasModule {}
