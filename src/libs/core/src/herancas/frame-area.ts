import { isDevMode, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';

import { Constructor } from './constructor';
import { formatarResponse, formatarResponseParaAsync, formatarArea1Inativos } from '../utils';
import { environment } from '@apollus/environments';

export interface FrameArea {
  lbArea1: string;
  lbArea2: string;
  lbArea3: string;
  areaService: any;
  listaArea1$: any;
  gheService: any;
  formFrame: FormGroup;
  listaAreas: Array<any>;
  evtResetaForm: EventEmitter<any>;
  inicializarAreas(): void;
  filtrarArea(item: any, filtro: any): boolean;
}

export function adicionaClasseArea<T extends Constructor<{}>>(base: T): Constructor<FrameArea> & T {
  return class extends base {
    formFrame: FormGroup;
    lbArea1: string = '';
    lbArea2: string = '';
    lbArea3: string = '';
    areaService: any;
    gheService: any;
    listaAreas;
    listaArea1$;
    listaGHE$;

    /**
     * Não deve ser populado por essa classe.
     */
    evtResetaForm;

    constructor(...args: any[]) {
      super(...args);
    }

    inicializarAreas() {
      this.iniciaHierarquia();
      this.inicializarTodasAreas1();
    }

    iniciaHierarquia() {
      if (this.areaService) {
        this.areaService.http.cache('hierarquia', this.areaService.retornarHierarquia().pipe(map(formatarResponse))).subscribe((resp) => {
          let hierarquia = resp.objetoResposta;
          this.lbArea1 = hierarquia['descricao' + (<any>window).idioma];
          this.lbArea2 = hierarquia.hierarquiaFilha['descricao' + (<any>window).idioma];
          this.lbArea3 = hierarquia.hierarquiaFilha.hierarquiaFilha['descricao' + (<any>window).idioma];
        });

        this.evtResetaForm.subscribe(() => {
          this.listaGHE$ = null;
        });
      } else {
        if (!environment.production) {
          throw new Error('Para usar o "FrameArea" você precisa adicionar o serviço "AreaService".');
        }
      }
    }

    inicializarTodasAreas1() {
      this.listaArea1$ = this.areaService.http.cache(
        'area-1-0-0',
        this.areaService.listarAreasPeloNivelId(1, 0, 0).pipe(map(formatarResponseParaAsync), map(formatarArea1Inativos))
      );
    }

    filtrarArea(item: any, filtro: any): boolean {
      if (!filtro) {
        return true;
      }

      return item.descricao.toLowerCase().indexOf(filtro.toLowerCase()) !== -1;
    }
  };
}
