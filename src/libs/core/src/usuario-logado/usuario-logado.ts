/**********************************************************
 * Criador: Thiago Feijó                                  *
 * Data: 21/12/2017                                       *
 * Descrição: Classe responsavel por gerenciar cookies.   *
 * *******************************************************/

import { EventEmitter, Injectable } from '@angular/core';
import { AplsCookie } from '../cookie';
import { AplsUnload } from '../unload';
import { StorageUtils } from '../utils/storage-utils';
import { AplsCache } from '../cache';
import { ssoKeys } from '@apollus/sso-keys';
import { environment } from '@apollus/environments';

export interface token {
  token_type: string;
  access_token: string;
  id_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioLogado {
  /**
   * Evento disparado para executar o logoff.
   */
  evtLogoff = new EventEmitter();

  /**
   * Evento disparado ao recalcular o tempo para expirar seção.
   */
  evtTempoSecao = new EventEmitter();

  /**
   * Mantem salvo o interval para checagem de seção.
   */
  private intervalo: any;

  /**
   * Salvar o usuario que está logado.
   */
  usuario: any;

  constructor(private aplsUnload: AplsUnload, private storageUtils: StorageUtils, public aplsCache: AplsCache) {}

  /**
   * Retorna o token do usuario logado.
   */
  get token(): token {
    if (this._token) {
      return this._token;
    } else {
      let cookieToken = this.storageUtils.retornarObjJSON('token');

      if (!!cookieToken) {
        try {
          this._token = cookieToken;
          return this._token;
        } catch (err) {
          return undefined;
        }
      }

      return undefined;
    }
  }
  _token: token;

  /**
   * Recupera o usuario que está logado.
   */
  recuperaUsuario(): Promise<any> {
    return new Promise(
      function(resolve, reject) {
        let startSessao = AplsCookie.get('startSessao');
        const cookieUser = AplsCookie.get('user');

        if (!!startSessao && startSessao != 'null' && !!cookieUser) {
          // Recupera dados do usuario logado
          this.usuario = JSON.parse(decodeURIComponent(cookieUser));
          this.usuario.login = this.usuario.username.split(':')[0];
          let idioma = this.usuario.idioma.toUpperCase();
          (<any>window).idioma = idioma;
          (<any>window).idiomaRegiao = idioma === 'PT' ? 'pt-BR' : idioma === 'EN' ? 'en-US' : 'es-ES';

          resolve(this.usuario);
        } else {
          reject();
        }
      }.bind(this)
    );
  }

  /**
   * Método utilizado para retornar um objeto do tipo PerfilModuloUsuario com os perfis que ele tem acesso
   */
  retornarPerfilModuloUsurio(idModulo: number): Promise<any> {
    return new Promise(
      function(resolve: any) {
        let perfilModuloUsuario = this.aplsCache.get('perfilModulo-' + idModulo);
        resolve(perfilModuloUsuario);
      }.bind(this)
    );
  }

  /**
   * Método utilizado para retornar a hierarquia conforme o idioma do usuário logado
   */
  retornarHierarquiaIdioma(): Promise<any> {
    return new Promise(
      function(resolve: any) {
        let hierarquia = (<any>window).hierarquia;

        if (!hierarquia) {
          hierarquia = this.storageUtils.retornarObjJSON('hierarquia');
          (<any>window).hierarquia = hierarquia;
        }

        if (!!hierarquia) {
          hierarquia.descricao = hierarquia['descricao' + (<any>window).idioma];
          hierarquia.hierarquiaFilha.descricao = hierarquia.hierarquiaFilha['descricao' + (<any>window).idioma];
          hierarquia.hierarquiaFilha.hierarquiaFilha.descricao = hierarquia.hierarquiaFilha.hierarquiaFilha['descricao' + (<any>window).idioma];
        }

        resolve(hierarquia);
      }.bind(this)
    );
  }

  /**
   * Método utilizado para retornar um objeto do tipo PerfilModuloUsuario com os perfis que ele tem acesso
   */
  retornarDataAtual(): Promise<any> {
    return new Promise(
      function(resolve) {
        let dataAtual = (<any>window).dataAtual;

        if (!dataAtual) {
          dataAtual = this.aplsCache.get('dataAtual');
        }

        if (!!dataAtual) {
          dataAtual = new Date(dataAtual);
        }

        resolve(dataAtual);
      }.bind(this)
    );
  }

  /**
   * Inicia interval que realizará a checagem da seção.
   * @param tempo Tempo em milésimos para checagem
   */
  initVerificador(tempo = 1000 * 60) {
    if (!!this.intervalo) {
      clearInterval(this.intervalo);
    }
    this.intervalo = setInterval(this.verificaSecao.bind(this), tempo);
    this.verificaSecao();
  }

  /**
   * Função que realiza a checagem da seção do usuário.
   */
  private verificaSecao() {
    var startSessao = AplsCookie.get('startSessao');
    if (!!startSessao) {
      // Salva tempo seção
      var dataLocal = this.storageUtils.retornar('relogio_sessao');

      if (!!dataLocal) {
        var toTime = new Date(new Date().toUTCString());
        var fromTime = new Date(dataLocal);

        var differenceTravel = toTime.getTime() - fromTime.getTime();
        var dtDiferenca = Math.trunc(Math.abs(((differenceTravel % 86400000) % 3600000) / 60000));

        if (dtDiferenca > 0) {
          this.evtTempoSecao.emit(dtDiferenca);
          return false;
        }
      }
    }

    // Chama pelo logoff que removerá dados em seção
    // this.logoff();
    this.evtLogoff.emit();
  }

  /**
   * Essa função zera o timer do cookie.
   */
  restart() {
    let minSessao = 44;
    var dt = new Date();
    dt.setTime(dt.getTime() + minSessao * 60 * 1000);
    AplsCookie.atualiza('startSessao', dt);

    this.storageUtils.adicionar('relogio_sessao', dt.toUTCString());
  }

  /**
   * Método utilizado para efetuar o processo de autenticação no sistema
   * @param token token do Usuário
   */
  login(token: any) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 44 * 60 * 1000);

    AplsCookie.set('startSessao', '44', {
      expires: expires
    });

    this.storageUtils.adicionar('token', token);
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; secure';
  }

  /**
   * Faz limpeza dos cookies.
   */
  private removerSessao() {
    this.aplsUnload.desbloqueia();
    this.storageUtils.deletar('relogio_sessao');
    this.storageUtils.deletar('token');
    this.storageUtils.deletar('empresa');
    this.storageUtils.deletar('hierarquia');

    AplsCookie.delete('user');
    AplsCookie.delete('startSessao');
  }

  recuperarEmpresa(): string {
    let host = document.location.host;

    if (host != null && host.indexOf('localhost') == -1 && host.indexOf('127.0.0.1') == -1) {
      if (host.indexOf('www.') >= 0) {
        host = host.substr(host.indexOf('www.') + 4);
        host = host.substr(0, host.indexOf('.'));
      } else {
        host = host.substr(0, host.indexOf('.'));
      }

      if (host.toUpperCase() == 'AMAZON' || host.toUpperCase() == 'MICROSERVICOS' || host.toUpperCase() == 'DESENVOLVIMENTO') {
        return 'APOLLUS';
      } else {
        return host.toUpperCase();
      }
    } else {
      return 'APOLLUS';
    }
  }

  /**
   * realiza o logoff na aplicação
   * @param  redirectURI uri para onde deve ser jogado o usuário após a limpeza de cookies
   * @param  logoffSSO boolean para determinar se deve deslogar do SSO ou não
   * @param  action callback para ser executado após a limpeza de cookies, caso não seja login com SSO
   */
  logoff(redirectUri?: string, logoffSSO?: boolean, action?: () => void): void {
    if (logoffSSO && this.logoffSSO(redirectUri)) {
      return;
    }

    this.removerSessao();
    if (action) {
      action();
    }
    if (redirectUri) {
      window.location.href = redirectUri;
    }
  }

  /**
   * tentar realizar o logoff no SSO caso possua
   * @return possui ou não logoff SSO
   */
  private logoffSSO(redirectUri: string): boolean {
    const token2 = this.token;
    if (!redirectUri) redirectUri = window.location.href;

    if (this.verificarSSO(this.recuperarEmpresa()) && token2) {
      this.removerSessao();
      window.location.href = `${environment.url_security}${environment.base_token_url}/openid-connect/logout?id_token_hint=${token2.id_token}&post_logout_redirect_uri=${redirectUri}`;
      return true;
    }

    return false;
  }

  retornarInfoSSO(empresa: string) {
    if (ssoKeys[empresa]) {
      return ssoKeys[empresa];
    } else {
      return {
        clientId: '',
        clientSecret: ''
      };
    }
  }

  verificarSSO(empresa: string): boolean {
    return ssoKeys[empresa] != undefined && ssoKeys[empresa].possuiSSO;
  }
}
