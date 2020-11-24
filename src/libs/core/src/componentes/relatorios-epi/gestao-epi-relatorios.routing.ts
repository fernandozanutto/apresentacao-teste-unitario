import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RelatoriosEntregaEpiComponent } from './paginas/relatorios-entrega-epi/gestao-epi-relatorios-entrega-epi.component';
import { RelatoriosHomeComponent } from './paginas/relatorios-home/gestao-epi-relatorios-home.component';
import { RelatoriosRaizComponent } from './paginas/relatorios-raiz/gestao-epi-relatorios-raiz.component';
import { RelatoriosEntregaEpiIndividualComponent } from './paginas/relatorios-entrega-epi-individual/gestao-epi-relatorios-entrega-epi-individual.component';
import { RelatoriosWrapperGuard } from '@apollusepi/modulos/portal-epi/telas/relatorios-wrapper/relatorios-wrapper.guard';

const routes = [
  {
    path: '',
    canActivate: [RelatoriosWrapperGuard],
    component: RelatoriosRaizComponent,
    children: [
      {
        path: '',
        component: RelatoriosHomeComponent,
        children: [
          {
            path: '',
            redirectTo: 'entrega-epi-geral'
          },
          {
            path: 'entrega-epi-geral',
            component: RelatoriosEntregaEpiComponent
          },
          {
            path: 'entrega-epi-individual',
            component: RelatoriosEntregaEpiIndividualComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelatoriosRoutes {}
