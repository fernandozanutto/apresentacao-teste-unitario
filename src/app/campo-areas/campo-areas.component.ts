import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AplsCache, CollectionsUtils, formatarResponseParaAsync, HttpApollus, UsuarioLogado } from '@apollus-ngx/core';
import { PerfilEnum, StatusEnum } from '@apollus/common/enums';
import { Areas, AreaService } from '@apollus/modulos';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pairwise, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'apls-campo-areas',
  templateUrl: './campo-areas.component.html'
})
export class CampoAreasComponent implements OnInit {
  public labelHierarquia1 = 'labelHierarquia1';
  public listaArea1 = [];

  public labelHierarquia2 = 'labelHierarquia2';
  public listaArea2$: any = null;

  public labelHierarquia3 = 'labelHierarquia3';
  public listaArea3$: any = null;

  public hasListaArea1Customizada = false;

  @Input() public formControlArea1: FormControl;
  @Input() public area1Multiple = false;
  @Input() public exibirLabelHierarquia1 = true;
  @Output() changeArea1: EventEmitter<any> = new EventEmitter();

  @Input() public formControlArea2: FormControl;
  @Input() public area2Multiple = false;
  @Input() public exibirLabelHierarquia2 = true;
  @Output() changeArea2: EventEmitter<any> = new EventEmitter();

  @Input() public formControlArea3: FormControl;
  @Input() public area3Multiple = false;
  @Input() public exibirLabelHierarquia3 = true;
  @Output() changeArea3: EventEmitter<any> = new EventEmitter();

  @Input() public somenteAtivos = true;

  _area1PermissoesAceitas: PerfilEnum[] = [];
  _area1PermissoesNegadas: PerfilEnum[] = [];

  @Input()
  public set area1PermissoesAceitas(permissoes: PerfilEnum[]) {
    if (permissoes && permissoes.length != this._area1PermissoesAceitas.length && JSON.stringify(this._area1PermissoesAceitas) != JSON.stringify(permissoes)) {
      this._area1PermissoesAceitas = permissoes;
      this.tratarCarregamentoArea1();
    }
  }
  public get area1PermissoesAceitas() {
    return this._area1PermissoesAceitas;
  }

  @Input()
  public set area1PermissoesNegadas(permissoes: PerfilEnum[]) {
    if (permissoes && permissoes.length != this._area1PermissoesNegadas.length && JSON.stringify(this._area1PermissoesNegadas) != JSON.stringify(permissoes)) {
      this._area1PermissoesNegadas = permissoes;
      this.tratarCarregamentoArea1();
    }
  }
  public get area1PermissoesNegadas() {
    return this._area1PermissoesNegadas;
  }

  /**
   * Setter.
   * Sobrescreve o comportamento padrão da listagem area1 por uma lista customizada.
   * @param v Array de Areas.
   */
  @Input()
  public set listaCustomizadaArea1(v: Areas[]) {
    if (v && !this._listaCustomizadaArea1v.length) {
      this._listaCustomizadaArea1v = [...v];
      this.listaArea1 = [...v];
      this.hasListaArea1Customizada = Array.isArray(v);
      this.tratarCarregamentoArea1();
    } else if (v && !v.every(({ id }) => !!this._listaCustomizadaArea1v.find(({ id: cId }) => id === cId))) {
      this._listaCustomizadaArea1v = [...v];
      this.listaArea1 = [...v];
      this.hasListaArea1Customizada = Array.isArray(v);
      this.tratarCarregamentoArea1();
    }
  }

  _listaCustomizadaArea1v: Areas[] = [];

  private INATIVO: string;

  public get tamanhoColuna() {
    return !this.formControlArea2 ? 12 : this.formControlArea3 ? 4 : 6;
  }

  constructor(
    private usuarioLogado: UsuarioLogado,
    private aplsCache: AplsCache,
    private collectionsUtils: CollectionsUtils,
    private httpApollus: HttpApollus,
    private areaService: AreaService,
    private translate: TranslateService
  ) {
    this.INATIVO = this.translate.instant('label.status_inativo');
  }

  ngOnInit() {
    this.carregarLabelsHierarquias();
    this.tratarCarregamentoArea1();
    this.criarEventoAlteracaoArea1();

    if (this.formControlArea2) {
      this.criarEventoAlteracaoArea2();
    }

    if (this.formControlArea3) {
      this.criarEventoAlteracaoArea3();
    }

    this.resetarCamposArea1();
  }

  /**
   * Busca qual item esta marcado para exibição.
   * Considerando a chave ID.
   * @param a Record, item, linha. Opção de um select.
   * @param b Valor setado.
   */
  public compararPorID = (a: any, b: any): boolean => {
    if (!b) return false;

    return a.id == b.id;
  };

  /**
   * Método utilizado para filtrar os registros a partir do que for digitando no Campo de Select
   * @param item
   * @param filtro
   */
  public filtrarArea(item: any, filtro: any): boolean {
    if (!filtro) return true;
    return item.descricao
      .removerAcentos()
      .toLowerCase()
      .includes(filtro.removerAcentos().toLowerCase());
  }

  /**
   * Método utilizado para carregar as hierarquias do sistema
   */
  private async carregarLabelsHierarquias() {
    const hierarquia = await this.usuarioLogado.retornarHierarquiaIdioma();

    this.labelHierarquia1 = hierarquia.descricao;
    this.labelHierarquia2 = hierarquia.hierarquiaFilha.descricao;

    if (this.formControlArea3) {
      this.labelHierarquia3 = hierarquia.hierarquiaFilha.hierarquiaFilha.descricao;
    }
  }

  /**
   * Método utilizado para tratar o carregamento da lista de área 1
   */
  private tratarCarregamentoArea1(): void {
    if (!this.hasListaArea1Customizada) {
      this.listaArea1 = [...this.aplsCache.get('listaAreasPermissao')];
    }

    // verificar se existe alguma restrição com a permissão do usuário com as
    // áreas que devem aparecer (pode ser aceita ou negada)
    if (this.area1PermissoesAceitas.length > 0) {
      this.listaArea1 = [
        ...this.aplsCache.get('listaAreasPermissao').filter(permissao => this.area1PermissoesAceitas.indexOf(this.aplsCache.get('perfilLista')[permissao.id]) !== -1)
      ];
    } else if (this.area1PermissoesNegadas.length > 0) {
      this.listaArea1 = [
        ...this.aplsCache.get('listaAreasPermissao').filter(permissao => this.area1PermissoesNegadas.indexOf(this.aplsCache.get('perfilLista')[permissao.id]) === -1)
      ];
    }

    if (this.somenteAtivos) {
      this.listaArea1 = this.listaArea1.filter(item => item.status === StatusEnum.ATIVO);
    } else {
      this.listaArea1 = this.listaArea1.map(item => ({
        ...item,
        descricao: this.buscarDescricaoArea(item)
      }));
    }

    if (this.listaArea1 != null) {
      // debugger;
      this.listaArea1.sort(this.collectionsUtils.ordenarListaPelaDescricao);

      setTimeout(() => {
        if (this.listaArea1.length === 1) {
          this.formControlArea1.patchValue(this.listaArea1[0], { emitEvent: true });
        }
      }, 1);
    }
  }

  private compararValorDiferentePorId(el1, el2) {
    const ambosArrays = Array.isArray(el1) && Array.isArray(el2);
    const peloMenosUmArray = Array.isArray(el1) || Array.isArray(el2);

    if (el1 && el2) {
      if (ambosArrays) {
        if (el1.length != el2.length) {
          return false;
        }

        for (let i = 0; i < el1.length; i++) {
          if (el1[i].id != el2[i].id) {
            return false;
          }
        }
      } else if (peloMenosUmArray) {
        return false;
      }

      return el1.id == el2.id;
    }

    return false;
  }

  /**
   * Metodo utilizado para criar o evento de alteracao da Area1
   */
  private criarEventoAlteracaoArea1(): void {
    this.formControlArea1.valueChanges.pipe(distinctUntilChanged(this.compararValorDiferentePorId), startWith(null), pairwise()).subscribe(([areas1Antigas, areas1]) => {
      if (this.changeArea1) this.changeArea1.emit({ event: event, area1: areas1 });

      const areas1ArrayVazioOuMaiorQueUm = (Array.isArray(areas1) && !areas1.length) || (!!areas1 && areas1.length > 1);

      if (!areas1 || areas1ArrayVazioOuMaiorQueUm) {
        this.resetarCamposArea1();
      } else {
        if (this.formControlArea2) {
          this.listaArea2$ = this.listarAreasPeloNivelId(Array.isArray(areas1) ? areas1[0].id : areas1.id, 2).pipe(
            tap(lista => {
              if (this.formControlArea2.value && !this.listaTemValor(this.formControlArea2.value, lista)) this.resetarCamposArea1();
              this.formControlArea2.enable({ emitEvent: true });
              if (this.formControlArea3 && !!this.formControlArea3.value && !areas1Antigas && !areas1) {
                // tem área 3, tinha valor lá mas não tinha valor nesse campo
                this.resetarCamposArea2();
              }
            })
          );
        }
      }
    });
  }

  private listaTemValor(valor: Areas | Areas[], novaLitas: Areas[]): boolean {
    if (Array.isArray(valor)) {
      const idLista: number[] = valor.map(({ id }) => id);
      return !!novaLitas.find(({ id }) => idLista.includes(id));
    } else {
      return !!novaLitas.find(({ id }) => valor.id === id);
    }
  }

  /**
   * Metodo utilizado para criar o evento de alteracao da Area2
   */
  private criarEventoAlteracaoArea2(): void {
    this.formControlArea2.valueChanges.pipe(distinctUntilChanged(this.compararValorDiferentePorId), startWith(null), pairwise()).subscribe(([areas2Antigas, areas2]) => {
      if (this.changeArea2) this.changeArea2.emit(areas2);

      if (this.formControlArea3) {
        const areas2ArrayVazioOuMaiorQueUm = (Array.isArray(areas2) && !areas2.length) || (!!areas2 && areas2.length > 1);
        if (!areas2 || areas2ArrayVazioOuMaiorQueUm) {
          this.resetarCamposArea2();
        } else {
          this.formControlArea3.enable({ emitEvent: false });
          this.listaArea3$ = this.listarAreasPeloNivelId(Array.isArray(areas2) ? areas2[0].id : areas2.id, 3);
        }
      }
    });
  }

  /**
   * Metodo utilizado para criar o evento de alteracao da Area3
   */
  private criarEventoAlteracaoArea3(): void {
    this.formControlArea3.valueChanges.subscribe(areas3 => {
      if (this.changeArea3) this.changeArea3.emit(areas3);
      if (!this.formControlArea2.disabled && !!this.formControlArea2.value) {
        setTimeout(() => {
          this.formControlArea3.enable({ emitEvent: false });
        }, 0);
      }
    });
  }

  /**
   * Retorna uma lista de areas de acordo com o id passado por parametro
   * @param idArea - ID Area
   */
  private listarAreasPeloNivelId(idArea: any, nivel = 0): Observable<any> {
    const status = this.somenteAtivos ? 'A' : 0;
    return this.httpApollus.cache(
      `areas-${status}-${nivel}-${idArea}`,
      this.areaService.listarAreasPeloNivelId(nivel, idArea, status).pipe(map(formatarResponseParaAsync), map(this.tratarResponseListaArea.bind(this)))
    );
  }

  private tratarResponseListaArea(response: any) {
    let LISTA = response.map((area: any) => ({
      id: area.id,
      descricao: `${area.codigo} - ${area.descricao} ${area.status === StatusEnum.INATIVO ? `(${this.INATIVO})` : ''}`,
      status: area.status
    }));

    LISTA.sort(this.collectionsUtils.ordenarListaPelaDescricao);

    return LISTA;
  }

  /**
   * Resetar campo Area 1
   */
  private resetarCamposArea1() {
    if (this.formControlArea2) {
      this.formControlArea2.patchValue(null, { emitEvent: false });
      this.formControlArea2.disable({ emitEvent: false });

      this.resetarCamposArea2();
    }
  }

  /**
   * Resetar campo Area 1
   */
  private resetarCamposArea2() {
    if (this.formControlArea3) {
      this.formControlArea3.patchValue(null, { emitEvent: false });
      this.formControlArea3.disable({ emitEvent: false });
    }
  }

  public buscarDescricaoArea(area): string {
    if (!area) return '';

    const inativo = area.status === StatusEnum.INATIVO ? `(${this.translate.instant('label.status_inativo')})` : '';

    return `${area.descricao} ${inativo}`;
  }
}
