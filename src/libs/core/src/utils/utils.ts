import { BACKSPACE } from '@angular/cdk/keycodes';

export var inst = 0;

/**
 * Essa função é passada no operador map do RxJS.
 * @param response Observable<response> Esse valor da função http do angular. Necessario ter "_body" em seu conteudo
 */
export function formatarResponse(response) {
  let retorno = response;

  if (!response.hasOwnProperty('objetoResposta')) {
    retorno = response._body;
    if (response.status == 200 || response.status == 201) {
      if (typeof retorno === 'string') {
        retorno = JSON.parse(retorno);
        retorno.objetoResposta = retorno.objetoResposta || [];
      }
    }
  }

  if (!retorno) {
    retorno = response;
  }

  return retorno;
}

/**
 * Essa função formata a resposta e retorna uma promise.
 * @param response Observable<response> Esse valor da função http do angular. Necessario ter "_body" em seu conteudo
 */
export function formatarResponseParaPromise(response: Response) {
  return response.json();
}

/**
 * Essa função é passada para o operador map do RxJS. Deixa o response pronto para funcionar com pipe async.
 * @param response Observable<response> Esse valor da função http do angular. Necessario ter "_body" em seu conteudo
 */
export function formatarResponseParaAsync(response) {
  let retorno;

  if (!response.objetoResposta) {
    retorno = response._body;
    if (response.status == 200 || response.status == 201) {
      retorno = JSON.parse(retorno).objetoResposta || [];
    }
  } else {
    retorno = response.objetoResposta || [];
  }

  if (!retorno) {
    retorno = response;
  }

  return retorno;
}

/**
 * [DEPRECATECATED]
 */
export function mostrarLoader() {}

/**
 * [DEPRECATECATED]
 */
export function finalizarLoader(response?) {}

/**
 * Monta areas em lista para select catalogo.
 */
export function formatarArea1(areas: any) {
  return {
    id: areas.area.id,
    status: areas.area.status,
    codigo: areas.area.codigo,
    descricao: `${areas.area.codigo} - ${areas.area.descricao}`,
    descricaoSemCodigo: areas.area.descricao
  };
}

/**
 * Monta areas em lista para select catalogo.
 */
export function formatarListaArea(areas: any) {
  return areas.map((area: any) => {
    return {
      id: area.id,
      codigo: area.codigo,
      descricao: `${area.codigo} - ${area.descricao} ${area.status == 'A' ? '' : '(INATIVO)'}`,
      descricaoSemCodigo: area.descricao
    };
  });
}

/**
 * Monta areas em lista para select catalogo quando a lista possui inativos.
 */
export function formatarArea1Inativos(objetoResposta) {
  return objetoResposta.map((area: any) => {
    return {
      id: area.id,
      codigo: area.codigo,
      descricao: `${area.codigo} - ${area.descricao} ${area.status == 'A' ? '' : '(INATIVO)'}`,
      descricaoSemCodigo: area.descricao
    };
  });
}

/**
 * Recupera a distancia de um elemento até o top da página
 * ignorando o parent do elemento
 */
export function pegaOffsetTop(elem: any) {
  let offsetTop = 0;
  offset: do {
    if (!elem.offsetParent) {
      break offset;
    }
    if (!isNaN(elem.offsetTop)) {
      offsetTop += elem.offsetTop;
    }
  } while ((elem = elem.offsetParent));
  return offsetTop;
}

/**
 * Essa função é construida para trabalhar em paralelo com a diretiva InputMascara.
 *
 * Quando for keydown a propriedade $event.target.value não terá o valor com o caracter digitado ainda.
 *
 * Então só é feito um teste se ta acessentando ou não caracters para saber qual mascara de telefone usar.
 *
 * FEATURE: Fazer i18n de mascaras telefonicas.
 *
 * @param $event Evento do keydown.
 */
export function formatoNumeroFone($event) {
  var valorInput = $event.target.value;

  if (valorInput == null) {
    return '(99) 99999-9999';
  }

  var length = valorInput.length;

  if ($event.type == 'keydown') {
    if ($event.keyCode === BACKSPACE) {
      length--;
    } else {
      // Aqui pode ter uma possivel verificação de shift, alt ou ctrl
      length++;
    }
  }

  return length < 15 ? '(99) 9999-9999' : '(99) 99999-9999';
}

/**
 * Dispara evento de resize.
 * Suporta ie 11
 */
export function resize() {
  if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
    // ie
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  } else {
    // outros
    window.dispatchEvent(new Event('resize'));
  }
}

/**
 * Faz a ordenacao do atributo DESCRICAO.
 * objeto.descricao
 *
 * @param a
 * @param b
 */
export function sortDescricaoObjecto(a, b) {
  let A = a.descricao == null ? '' : a.descricao.removerAcentos().toLowerCase();
  let B = b.descricao == null ? '' : b.descricao.removerAcentos().toLowerCase();

  return A > B ? 1 : A < B ? -1 : 0;
}

/**
 * Faz a ordenacao do atributo codigo e DESCRICAO.
 * objeto.descricao
 *
 * @param a
 * @param b
 */
export function sortCodigoDescricaoObjecto(a: any, b: any) {
  let aa = a.codigo.toLowerCase() + ' - ' + a.descricao.removerAcentos().toLowerCase();
  let bb = b.codigo.toLowerCase() + ' - ' + b.descricao.removerAcentos().toLowerCase();

  return aa > bb ? 1 : aa < bb ? -1 : 0;
}

/**
 * Faz a ordenacao do atributo codigo e DESCRICAO. Caso tenha alguma descricao Undefined joga para a final da lista
 * objeto.descricao
 *
 * @param a
 * @param b
 */
export function sortCodigoDescricaoUndefinedObjecto(a: any, b: any) {
  if (!a.descricao || !b.descricao) return 1;

  let aa = a.codigo.toLowerCase() + ' - ' + a.descricao.removerAcentos().toLowerCase();
  let bb = b.codigo.toLowerCase() + ' - ' + b.descricao.removerAcentos().toLowerCase();

  return aa > bb ? 1 : aa < bb ? -1 : 0;
}

/**
 * Gera um UID com 6 posições, exemplo: 33XWO5
 */
export const generateUID = () => {
  let firstPart: string | number = (Math.random() * 46656) | 0;
  let secondPart: string | number = (Math.random() * 46656) | 0;

  firstPart = `000${firstPart.toString(36)}`.slice(-3);
  secondPart = `000${secondPart.toString(36)}`.slice(-3);
  return `${firstPart}${secondPart}`;
};
