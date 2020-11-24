import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { HttpLoader } from './http-loader';
import { UsuarioLogado } from '../usuario-logado';
import { AplsModal } from '@apollus-ngx/orfeu';
import { StorageUtils } from '../utils/storage-utils';
import { Http500Exception, Http200Exception, Http404Exception } from '../exception/apollus-exception';
import { i18nApollus } from '@apollus/common/servicos/i18n/public-api';
import { TranslateService } from '@ngx-translate/core';

/**
 * Classe manipulada pelo angular para adicionar os interceptors
 */
@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {
  constructor(
    public httpLoader: HttpLoader,
    public usuarioLogado: UsuarioLogado,
    private aplsModal: AplsModal,
    private translate: TranslateService,
    private storageUtils?: StorageUtils
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // debugger;
    // Adiciona headers se não tiver ainda
    if (!req.headers.get('authorization')) {
      let header = new HttpHeaders();

      header = header.append('Accept', 'application/json');

      if (!req.headers.get('Content-Type')) {
        header = header.append('Content-Type', 'application/json');
      }

      if (this.usuarioLogado.token) {
        const token = this.usuarioLogado.token.token_type + ' ' + this.usuarioLogado.token.access_token;
        header = header.append('authorization', token);
      }

      var authReq = req.clone({
        headers: header
      });
    } else {
      var authReq = req.clone({});
    }

    // Função para loader
    if (this.httpLoader.verifica(req.method + req.url)) {
      this.httpLoader.mostrarLoader(req.method + req.url);
    }

    return next
      .handle(authReq)
      .do(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.finalizarRequest(req.method + req.url);

            if (event.body && event.body.erro) {
              let mensagemRetorno = null;

              if (!!event.body.parametros) {
                let param = {};

                for (let index = 0; index < event.body.parametros.length; index++) {
                  param['label' + (index + 1)] = event.body.parametros[index];
                }

                mensagemRetorno = this.translate.instant('backend.' + event.body.mensagem, param);
              } else {
                mensagemRetorno = this.translate.instant('backend.' + event.body.mensagem);
              }

              this.aplsModal.toast(mensagemRetorno ? mensagemRetorno : this.translate.instant('mensagem.erro_interceptor'), event.body.tipoAlerta);

              throw new Http200Exception(`${event.body.mensagem} - ${event.body.mensagemCausa}`);
            }
          }
        },
        (error: HttpErrorResponse) => {
          this.finalizarRequest(req.method + req.url);

          if (error.status === 401) {
            if (!document.location.href.contem('/login')) {
              this.usuarioLogado.logoff(document.location.origin, true);
            }
          } else if (error.status === 404) {
            this.aplsModal.toast(this.translate.instant('mensagem.erro_interceptor'), 'E');
            throw new Http404Exception(`${error.status}: ${error.error.error} - ${error.error.exception}`);
          } else if (error.status === 500) {
            this.aplsModal.toast(this.translate.instant('mensagem.erro_interceptor'), 'E');
            throw new Http500Exception(`${error.status}: ${error.error.error} - ${error.error.exception}`);
          }
        }
      )
      .finally(() => {
        this.finalizarRequest(req.method + req.url);
      });
  }

  finalizarRequest(url) {
    this.httpLoader.finalizarLoader(url);
    this.usuarioLogado.restart();
  }
}
