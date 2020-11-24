import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AplsResponse, formatarResponseParaAsync, HttpLoader, I18nUtils } from '@apollus-ngx/core';
import { OperatorFunction } from 'rxjs';
import { EpiService, PessoasService } from '@apollus/modulos/cadastro';
import { isArray } from 'util';

@Injectable()
export class GestaoEpiRelatoriosControllerEvent {
  gerarRelatorioEntregaEpiEvt: EventEmitter<Event> = new EventEmitter();
  gerarRelatorioEntregaEpiIndividualEvt: EventEmitter<Event> = new EventEmitter();

  constructor(private httpLoader: HttpLoader, private epiService: EpiService, private pessoasService: PessoasService) {}

  limparEventos() {
    this.gerarRelatorioEntregaEpiEvt.observers = [];
    this.gerarRelatorioEntregaEpiIndividualEvt.observers = [];
  }

  /**
   * lista Epi pela familia selecionada
   * @param input Nome/Matricula do Funcionário utilizado como Filtro
   */
  public listarEpiPorFamilia(input: any, familiasSelecionadas) {
    let listaFamilia = [];
    if (familiasSelecionadas) {
      familiasSelecionadas.forEach(element => {
        listaFamilia.push(element.id);
      });
    }
    let key = null;
    key = `${input}`;
    this.httpLoader.ignora(key);
    let servico = this.epiService.listarPorCodigoDescricaoFamilia('PT', input, listaFamilia).pipe(map(formatarResponseParaAsync), this.tratarResponseEpiPorFamilia());

    return servico;
  }

  private tratarResponseEpiPorFamilia(): OperatorFunction<AplsResponse, AplsResponse> {
    return map((response: any) => {
      if (response) {
        response = response.map(epi => {
          let i = 0;
          return {
            id: epi[i++],
            codigo: epi[i++],
            descricao: epi[i++]
          };
        });
      }
      return response;
    });
  }

  /**
   * lista lideres por nome ou matricula e areas
   * @param input Nome/Matricula do Funcionário utilizado como Filtro
   */
  public listarLider(form: FormGroup, input: any) {
    const { area1, area2 } = form.value;
    let area1List: any = null,
      area2List: any = null;

    if (!!area1) {
      area1List = isArray(area1) ? area1.map((area: any) => area.id) : [area1.id];
    }

    if (!!area2) {
      area2List = isArray(area2) ? area2.map((area: any) => area.id) : [area2.id];
    }

    let key = null;
    key = `${input}/${area1}`;
    this.httpLoader.ignora(key);

    const servico = this.pessoasService.listarCatalogoLiderVinculadosAreas(input, area1List, area2List).pipe(map(this.formatarLider));

    return servico;
  }

  private formatarLider(response): any[] {
    if (!response.objetoResposta) return [];

    return response.objetoResposta;
  }

  /**
   * Retorna o Funcionário a partir das Areas 1 ou 2 selecionadas, além de pesquisar por nome/matricula
   * @param input Nome/Matricula do Funcionário utilizado como Filtro
   */
  public listarFuncionarioPorArea1Area2(form: FormGroup, listaArea1, input: any, ativo = false) {
    let area1 = form.get('area1').value;
    let area2 = form.get('area2').value;
    let nivel = 0;
    let area: any = [0];

    if (!!area2) {
      area = [area2.id];
      nivel = 2;
    } else if (!!area1) {
      area1.forEach(element => {
        area.push(element.id);
      });
      nivel = 1;
    } else {
      area = listaArea1.map(area => area.id);
    }

    let key = null;
    key = `${nivel}/${area.join(',')}/${input}`;
    this.httpLoader.ignora(key);
    let servico = this.pessoasService
      .buscarPessoaPelaMatriculaNomeAreasPortal(nivel, area, input)
      .pipe(map(formatarResponseParaAsync), this.tratarResponsePessoaPelaMatriculaNomeAreasPortal(this, ativo), map(this.ordenarLista));

    return servico;
  }

  private tratarResponsePessoaPelaMatriculaNomeAreasPortal(response: any, ativo: boolean): OperatorFunction<AplsResponse, AplsResponse> {
    return map((response: any) => {
      if (response) {
        response = response.map(funcionario => {
          return {
            matricula: funcionario[0],
            matriculaManual: funcionario[1],
            nome: funcionario[2],
            status: funcionario[9]
          };
        });
      }
      return response;
    });
  }

  /**
   * Método utilizado para ordenar a lista de Usuários
   * @param response
   */
  private ordenarLista(response: any) {
    let retorno = [];
    let itemA, itemB;
    retorno = response.sort((funcA: any, funcB: any) => {
      itemA = funcA.nome.toLowerCase();
      itemB = funcB.nome.toLowerCase();
      return itemA > itemB ? 1 : itemA < itemB ? -1 : 0;
    });

    return retorno;
  }
}
