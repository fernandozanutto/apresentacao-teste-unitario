import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AplsCommonModule } from '@apollus/common';
import { AplsButtonModule } from '@apollus-ngx/orfeu';
import { ColetaBiometriaComponent } from './coleta-biometria.component';
import { BiometriaServicoModule } from '../biometria-servico.module';
import { TranslateModule } from '@ngx-translate/core';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustHtml(url);
  }
}

@NgModule({
  declarations: [ColetaBiometriaComponent, SafeHtmlPipe],
  imports: [AplsCommonModule, AplsButtonModule, BiometriaServicoModule, TranslateModule],
  entryComponents: [ColetaBiometriaComponent]
})
export class ColetaBiometriaModule {}
