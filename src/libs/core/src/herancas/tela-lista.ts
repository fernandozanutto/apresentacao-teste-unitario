/**
 * @author Thiago
 * @criacao 26/06/2018
 * @description Componentes da tela de lista devem extender dessa classe.
 */

import { isDevMode } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AplsTableDataSource, AplsSort, AplsSortable, Sort, AplsTitle } from '@apollus-ngx/orfeu';

import { ParametrosListaPaginado, AplsResponse } from '../interfaces';
import { AplsCache } from '../cache';
import { Tela } from './tela';
import { environment } from '@apollus/environments';

export class TelaLista extends Tela {
  // Lista de colunas que devem ficar visiveis
  colunasVisiveis: Array<string>;

  // Tamanho das colunas do grid
  colunasTamanho;

  /**
   * Função que retorna o serviço de listagem paginada.
   */
  servicoLista: Function;

  /**
   * Recebe o data source responsavel pela listagem.
   *
   * Não é um Obeservable com pipe async pois na resposta do servidor, dentro do AplsResponse
   * existem dados importantes para a tela que não podem ser acessados usando async, então a
   * requisição fica manual para poder controlar esses valores.
   */
  listaPrincipal = new AplsTableDataSource();

  /**
   * Form que será populado com os filtros
   */
  formGridFiltro: FormGroup;

  /**
   * Controles da tela de lista.
   */
  controles: any = {
    pagina: 1,
    totalPaginas: 0,
    maxResultados: 20,
    ordenacao: '',
    campoOrdenacao: '',
    revisor: '',
    data: '',
    mudancaFiltro: false,
    /**
     * Variavel para controlar se ngOnInit já foi executado.
     */
    permiteAutoFiltro: false
  };

  /**
   * Funciona como identificador único para a tela.
   *
   * Usado como chave para guardar o cache da página.
   */
  NomeModulo;

  /**
   * Caminho de acesso a tela de cadastro.
   */
  urlCadastro;

  constructor(public aplsTitle: AplsTitle, public aplsCache: AplsCache, public router?: Router) {
    super(aplsTitle);
  }

  ngOnInit() {
    super.ngOnInit();
    /**
     * Verifica se a tela possui cache para restaurar.
     * Salva dado por dado da tela em cache e carrega.
     */
    let cache = this.aplsCache.get(this.NomeModulo);

    if (cache) {
      this.aplsCache.delete(this.NomeModulo);

      for (const key in cache.controles) {
        if (cache.controles.hasOwnProperty(key)) {
          this.controles[key] = cache.controles[key];
        }
      }

      for (const key in cache.filtros) {
        if (cache.filtros.hasOwnProperty(key) && cache.filtros[key]) {
          this.formGridFiltro.patchValue(cache.filtros);
          break;
        }
      }

      if (cache.lista) {
        this.listaPrincipal.data = cache.lista;
      }
    }

    // Verifica se tem formGridFiltro e se inscreve no valueChanges para registrar alteração no filtro
    if (!!this.formGridFiltro) {
      this.formGridFiltro.valueChanges.subscribe(d => {
        this.controles.mudancaFiltro = true;
      });
    }
  }

  ngOnDestroy() {
    let cacheTela = {
      filtros: this.formGridFiltro.value,
      controles: this.controles,
      lista: this.listaPrincipal.data
    };
    this.aplsCache.set(this.NomeModulo, cacheTela);

    super.ngOnDestroy();
  }

  /**
   * Assim que o AplsSort é iniciado ele ira disparar esse evento.
   *
   * É necessario adicionar no template como um output para 'aplsSortInit'.
   * @param sort Ref AplsSort
   */
  sortInit(sort: AplsSort) {
    if (!!sort && !!this.controles.ordenacao && !!this.controles.campoOrdenacao) {
      sort.sort(<AplsSortable>{
        id: this.controles.campoOrdenacao,
        start: this.controles.ordenacao
      });
    } else {
      this.controles.permiteAutoFiltro = true;
    }
  }

  /**
   * É necessario adicionar no template como um output para 'aplsSortChange'.
   *
   * Ou chamar via codigo usando a interface 'Sort'.
   * @param $event Espera uma propriedade do tipo 'Sort'.
   */
  mudaOrdenacao($event: Sort) {
    this.controles.ordenacao = $event.direction;
    this.controles.campoOrdenacao = $event.active;
    if (this.controles.permiteAutoFiltro) {
      this.btnListar();
    } else {
      this.controles.permiteAutoFiltro = true;
    }
  }

  /**
   * Evento chamado pelo paginador ao receber alteração.
   * Não passa parametros pois o paginador usa a propriedade 'controles' para funcionar.
   */
  evtAtualiza(): void {
    this.btnListar(false);
  }

  /**
   * Ação de listar padrão da tela de lista.
   *
   * Necessario setar o serviço.
   */
  btnListar(limparPagina = true) {
    if (!!this.servicoLista) {      
      
      if (limparPagina) {
        this.controles.pagina = 1;
      }

      // Confirma se tem form de filtro
      let filtros = !!this.formGridFiltro ? this.formGridFiltro.value : {};

      

      // Checa se o form de filtro está setado e se está valido.
      if (!!this.formGridFiltro && this.formGridFiltro.invalid) {
        this.onFiltroInvalid();
        return;
      }

      // Ciclo para permitir modelagens do filtro antes do envio.
      filtros = this.onTratarFiltros(filtros);

      let parametrosTela: ParametrosListaPaginado = {
        pagina: this.controles.pagina,
        maxResultados: this.controles.maxResultados,
        filtro: filtros
      };

      if (!!this.controles.ordenacao) {
        parametrosTela.order = this.controles.campoOrdenacao;
      }

      if (!!this.controles.campoOrdenacao) {
        parametrosTela.sort = this.controles.ordenacao;
      }

      

      // Prepara o serviço e executa na sequencia.
      this.onAdicionaPipes(parametrosTela).subscribe((resp: AplsResponse) => {
        if (!resp.erro) {
          this.onListaRetornoSucesso(resp);
        } else {
          this.onListaRetornoErro(resp);
        }
      });
      
    } else {
      if (!environment.production) {
        throw Error('É necessario definir o valor de "servicoLista" para usar a função btnListar herdada.');
      }
    }
  }

  // Limpa o form do filtro e seta sem mudança.
  btnLimpaFiltro() {
    this.formGridFiltro.reset({}, { emitEvent: false });
    this.controles.mudancaFiltro = false;
  }

  /**
   * Botão que envia para a tela de cadastro.
   */
  btnNovo(): void {
    if (this.urlCadastro && this.router) {
      this.router.navigate([this.urlCadastro], { skipLocationChange: true });
    }
  }

  // Ação de duplo click da lista.
  dblVisualizar(linha): void {
    this.visualizaRegistro(linha);
  }

  // Botão de ação do grid.
  btnVisualizar(linha): void {
    this.visualizaRegistro(linha);
  }

  // Função que envia para tela de cadastro.
  visualizaRegistro(linha): void {
    if (linha && linha.id != undefined && linha.id != null && this.urlCadastro && this.router) {
      this.router.navigate([this.urlCadastro], {
        queryParams: { id: linha.id },
        queryParamsHandling: 'merge',
        skipLocationChange: true
      });
    }
  }

  /**
   * [LIFECYCLE]
   * Será chamado toda vez que precisar retornar o serviço da tela.
   * Foi construido assim pois quando extendermos a classe podemos ter acesso direto ao Observable do serviço
   * antes de chamar o subscribe.
   *
   * [IMPORTANTE]
   * Dentro dessa função provavelmente você fará algum map, ou filtro, ou mesmo ordenação. Porem você precisa retornar a
   * resposta da requisição inteira.
   */
  onAdicionaPipes(data): Observable<AplsResponse> {
    return this.servicoLista(data);
  }

  /**
   * [LIFECYCLE]
   * Será chamado caso o filtro estiver inválido.
   * Essa função permanece vazia pois deverá ser implementada na tela.
   */
  onFiltroInvalid() {
    if (!!this.formGridFiltro) {
      this.marcarFormGroupTocado(this.formGridFiltro);
    }
  }

  /**
   * [LIFECYCLE]
   * Será chamado quando o servico de listagem tiver sucesso no http response e dentro do
   * AplsResponse erro estiver como false.
   */
  onListaRetornoSucesso(resp: AplsResponse) {
    if (!!this.formGridFiltro) {
      this.marcarFormGroupIntocado(this.formGridFiltro);
    }
    this.listaPrincipal.data = resp.objetoResposta.dados;
    this.controles.totalPaginas = resp.objetoResposta.totalPaginas;
  }

  /**
   * [LIFECYCLE]
   * Será chamado quando o servico de listagem tiver erro no http response e dentro do
   * AplsResponse erro estiver como true.
   */
  onListaRetornoErro(resp: AplsResponse) {
    if (!!this.formGridFiltro) {
      this.marcarFormGroupTocado(this.formGridFiltro);
    }
  }

  /**
   * [LIFECYCLE]
   * Será chamado antes de se comunicar com a api.
   * Deve tratar o valor do form para realizar o envio.
   */
  onTratarFiltros(form) {
    return form;
  }
}
