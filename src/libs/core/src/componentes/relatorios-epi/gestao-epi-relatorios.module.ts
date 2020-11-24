import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AplsSectionModule, AplsSideMenuModule, InputStatusModule, CampoAreasModule, AplsPreloaderModule, AplsCommonModule } from '@apollus/common';
import { RelatoriosRoutes } from './gestao-epi-relatorios.routing';
import { RelatoriosRaizComponent } from './paginas/relatorios-raiz/gestao-epi-relatorios-raiz.component';
import { RelatoriosHomeComponent } from './paginas/relatorios-home/gestao-epi-relatorios-home.component';
import { AplsMenuBoxModule, AplsInputModule, AplsSelectModule, AplsNativeDateModule, AplsDatepickerModule, AplsCheckboxModule, AplsButtonModule } from 'libs/orfeu';
import { RelatoriosEntregaEpiComponent } from './paginas/relatorios-entrega-epi/gestao-epi-relatorios-entrega-epi.component';
import { EntregarEpiUtils } from '@apollusepi/modulos/portal-epi/telas/entregar-epi/paginas/entregar-epi-utils/entregar-epi-utils';
import { PessoaServicoModule, FamiliaServicoModule, EpiServicoModule, AreaServicoModule } from '@apollus/modulos/cadastro';
import { EntregarEpiControllerEvent } from '@apollusepi/modulos/portal-epi/telas/entregar-epi/paginas/entregar-epi-cadastro/entregar-epi-controller-event';
import { JustificativaServicoModule } from '@apollusepi/modulos/portal-epi/servicos/justificativa';
import { EntregaEpiServicoModule } from '@apollusepi/modulos/portal-epi/servicos/entrega-epi';
import { GestaoEpiRelatoriosControllerEvent } from './gestao-epi-relatorios-controller-event';
import { GrupoRiscoServicoModule } from '@apollus/modulos/si';
import { GheServicoModule } from '@apollus/modulos/hoe';
import { DistribuidorServicoModule } from '@apollus/modulos/so/servicos/distribuidor';
import { PontoDistribuicaoServicoModule } from '@apollus/modulos/so/servicos/ponto-distribuicao';
import { RelatoriosEntregaEpiIndividualComponent } from './paginas/relatorios-entrega-epi-individual/gestao-epi-relatorios-entrega-epi-individual.component';
import { CampoMatriculaFuncionarioModule } from '@apollus/common/componentes/campo-matricula-funcionario';
import { ConfirmacaoAssinaturaSelectModule } from '@apollus/common/componentes/select/confirmacao-assinatura/confirmacao-assinatura-select.module';
import { EstadoEntregaEpiItemSelectModule } from '@apollus/common/componentes/select/estado-entrega-epi-item/estado-entrega-epi-item-select.module';
import { DataInicioFimModule } from '@apollus/common/componentes/data-inicio-fim/data-inicio-fim.module';
import { FamiliaSelectModule } from '@apollus/common/componentes/select/familia/familia-select.module';
import { EpiSelectModule } from '@apollus/common/componentes/select/epi/epi-select.module';
import { RelatoriosWrapperGuard } from '@apollusepi/modulos/portal-epi/telas/relatorios-wrapper/relatorios-wrapper.guard';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    RelatoriosRoutes,
    AplsInputModule,
    InputStatusModule,
    AplsSelectModule,
    AplsSectionModule,
    AplsSideMenuModule,
    AplsMenuBoxModule,
    CampoAreasModule,
    AplsPreloaderModule,
    AplsDatepickerModule,
    AplsNativeDateModule,
    AplsCheckboxModule,
    AplsButtonModule,
    PessoaServicoModule,
    FamiliaServicoModule,
    JustificativaServicoModule,
    EntregaEpiServicoModule,
    EpiServicoModule,
    GrupoRiscoServicoModule,
    GheServicoModule,
    PontoDistribuicaoServicoModule,
    DistribuidorServicoModule,
    AreaServicoModule,
    AplsCommonModule,
    CampoMatriculaFuncionarioModule,
    ConfirmacaoAssinaturaSelectModule,
    EstadoEntregaEpiItemSelectModule,
    DataInicioFimModule,
    FamiliaSelectModule,
    EpiSelectModule,
    TranslateModule
  ],
  declarations: [RelatoriosRaizComponent, RelatoriosHomeComponent, RelatoriosEntregaEpiComponent, RelatoriosEntregaEpiIndividualComponent],
  providers: [EntregarEpiUtils, EntregarEpiControllerEvent, GestaoEpiRelatoriosControllerEvent, RelatoriosWrapperGuard]
})
export class RelatoriosModule {}
