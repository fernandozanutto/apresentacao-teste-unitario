/**
 * Aqui fica as interfaces de uso comum dentro do apollus-ngx.
 *
 * Para interfaces:
 * -Saiba usar prefixo.
 * -Nunca use i como um prefixo.
 *
 * Para este arquivo:
 * -Não forme grupos de interface. Todas devem ser expecificas e de uso comum.
 * -Não use prefixo para sub categorizar interfaces.
 *
 * @create 29/06/2018
 * @author Thiago
 */

/**
 * Define a interface de usuario do apollus.
 *
 * Esse dado fica guardado no cookie.
 */
export interface Usuario {
  lteraSenha: boolean;
  codigoArea1: string;
  codigoArea2: any; // TODO: Typar essa valiavel
  email: string;
  empresaSecurity: {
    nomeEmpresa: string;
    cor: string;
  };
  enabled: boolean;
  id: number;
  idArea1: number;
  idArea2: number;
  idioma: string;
  matricula: number;
  matriculaManual: string;
  nome: string; // Criada em tempo de execução, não vem do cache
  nomeArea1: string;
  nomeArea2: string;
  password: string;
  portalSecurity: {
    portal: string;
  };
  ultimoLogin: string;
  username: string;
}

/**
 * Essa interface possui um tipo como any, pois cada tela deve
 * obrigatoriamente criar uma interface de filtros da tela.
 */
export interface ParametrosListaPaginado {
  pagina: number;
  maxResultados: number;
  order?: string;
  sort?: string;
  filtro?: any;
}

/**
 * Essa é a interface base para todas tela de lista.
 */
export interface AplsGrid {
  id: number;
  revisor?: string;
  dataAtualizacao?: string;
}

/**
 * Resposta padrão da apollus.
 * Toda resposta de requisição ao server é formatada assim.
 *
 * Diferente disso ocorreu um http erro.
 */
export interface AplsResponse<T = any> {
  erro: boolean;
  mensagem: string;
  mensagemCausa: string;
  objetoResposta: AplsObjetoResposta<T>;
  parametros: any;
  tipoAlerta: 'I' | 'S' | 'E' | 'A';
}

export type AplsObjetoResposta<T = any> = ObjetoListaPaginado<T> | Array<T> | T;

/**
 * Define o objeto esperado para o objetoResposta esperado na
 * requisição de lista paginado das telas de lista.
 */
export interface ObjetoListaPaginado<T = any> {
  dados: Array<any>;
  maxResultados: number;
  pagina: number;
  parametros: number;
  totalPaginas: number;
}

/**
 * Define a interface de usuario do apollus.
 *
 * Esse dado fica guardado no cookie.
 */
export interface Usuario {
  lteraSenha: boolean;
  codigoArea1: string;
  codigoArea2: any; // TODO: Typar essa valiavel
  email: string;
  empresaSecurity: {
    nomeEmpresa: string;
    cor: string;
  };
  enabled: boolean;
  id: number;
  idArea1: number;
  idArea2: number;
  idioma: string;
  matricula: number;
  matriculaManual: string;
  nome: string; // Criada em tempo de execução, não vem do cache
  nomeArea1: string;
  nomeArea2: string;
  password: string;
  portalSecurity: {
    portal: string;
  };
  ultimoLogin: string;
  username: string;
}

type StatusValues = 'A' | 'I' | 'A,I' | 'C';

export type Status = StatusValues | { status: StatusValues };

export interface ArquivoAnexo {
  id: number;
  arquivo: string;
}
