/**
 * @license
 * Copyright Apollus EHS Solution Rights Reserved.
 *
 * Para compreenção desse arquivo é necessario ler os comentarios no cdk do angular.
 */

import { _isNumberValue } from '@angular/cdk/coercion';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, combineLatest, merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export class AplsTableDataSource<T> extends DataSource<T> {
  private readonly _data: BehaviorSubject<T[]>;

  private readonly _renderData = new BehaviorSubject<T[]>([]);

  private readonly _filter = new BehaviorSubject<string>('');

  _renderChangesSubscription = Subscription.EMPTY;

  filteredData: T[];

  get data() {
    return this._data.value;
  }
  set data(data: T[]) {
    this._data.next(data);
    this.tratarExibicaoMensagemSemRegistros(data);
  }

  get filter(): string {
    return this._filter.value;
  }
  set filter(filter: string) {
    this._filter.next(filter);
  }

  get sort() {
    return this._sort;
  }
  set sort(sort) {
    this._sort = sort;
    this._updateChangeSubscription();
  }
  private _sort: any;

  get paginator() {
    return this._paginator;
  }
  set paginator(paginator) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }
  private _paginator: any;

  get idTabelaHTML(): string {
    return this._idTabelaHTML || '';
  }
  set idTabelaHTML(v: string) {
    this._idTabelaHTML = v;
  }
  private _idTabelaHTML: string;

  get mensagemSemRegistros(): string {
    switch ((<any>window).idioma.toLowerCase()) {
      case 'pt':
        return 'Sem registros para listar.';
      case 'es':
        return 'No hay registros para listar.';
      case 'en':
        return 'No records to list.';
    }
  }

  set mensagemSemRegistros(v: string) {
    this._mensagemSemRegistros = v;
  }
  private _mensagemSemRegistros: string;

  get cssClassesMensagemSemRegistro(): string {
    return this._cssClassesMensagemSemRegistro || 'alert alert-default mt-3 text-center';
  }
  set cssClassesMensagemSemRegistro(v: string) {
    this._cssClassesMensagemSemRegistro = v;
  }
  private _cssClassesMensagemSemRegistro: string;

  /**
   * Data accessor function that is used for accessing data properties for sorting through
   * the default sortData function.
   * This default function assumes that the sort header IDs (which defaults to the column name)
   * matches the data's properties (e.g. column Xyz represents data['Xyz']).
   * May be set to a custom function for different behavior.
   * @param data Data object that is being accessed.
   * @param sortHeaderId The name of the column that represents the data.
   */
  sortingDataAccessor: (data: T, sortHeaderId: string) => string | number = (data: T, sortHeaderId: string): string | number => {
    const value: any = this.retornarPropItem(data, sortHeaderId);
    if (value) {
      return _isNumberValue(value) ? Number(value) : typeof value === 'string' ? value : value.valueOf();
    }
    return value;
  };

  /**
   * Gets a sorted copy of the data array based on the state of the MatSort. Called
   * after changes are made to the filtered data or when sort changes are emitted from MatSort.
   * By default, the function retrieves the active sort and its direction and compares data
   * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
   * of data ordering.
   * @param data The array of data that should be sorted.
   * @param sort The connected MatSort that holds the current sort state.
   */
  sortData: (data: T[], sort: any) => T[] = (data: T[], sort): T[] => {
    const active = sort.active;
    const direction = sort.direction;
    if (!active || direction == '') {
      return data;
    }

    return data.sort((a, b) => {
      let valueA = this.sortingDataAccessor(a, active);
      let valueB = this.sortingDataAccessor(b, active);

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come first.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction == 'asc' ? 1 : -1);
    });
  };

  /**
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has
   * at least one occurrence in that string. By default, the filter string has its whitespace
   * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
   * filter matching.
   * @param data Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   * @returns Whether the filter matches against the data
   */
  filterPredicate: (data: T, filter: string) => boolean = (data: T, filter: string): boolean => {
    // Transform the data into a lowercase string of all property values.
    const accumulator = (currentTerm: any, key: any) => currentTerm + data[key];
    const dataStr: string = Object.keys(data)
      .reduce(accumulator, '')
      .toLowerCase()
      .removerAcentos();

    // Transform the filter by converting it to lowercase and removing whitespace.
    const transformedFilter = filter
      .trim()
      .toLowerCase()
      .removerAcentos();

    return dataStr.indexOf(transformedFilter) != -1;
  };

  /**
   *
   * @param initialData Dados iniciais a serem listados na table
   * @param idTabelaHTML Id da tabela no HTML, será usado par a exibição da mensagem sem registros
   * @param mensagemSemRegistros Mensagem de exibição caso não haja registros.
   */
  constructor(initialData: T[] = [], idTabelaHTML: string = undefined, mensagemSemRegistros: string = undefined) {
    super();
    this._data = new BehaviorSubject<T[]>(initialData);
    this._updateChangeSubscription();

    this.idTabelaHTML = idTabelaHTML;
    this.mensagemSemRegistros = mensagemSemRegistros;

    this.tratarExibicaoMensagemSemRegistros(initialData);
  }

  private tratarExibicaoMensagemSemRegistros(data: T[]): void {
    setTimeout(() => {
      if (!data || !data.length) {
        this.adicionarMensagemSemRegistros();
      } else {
        this.removerMensagemSemRegistros();
      }
    }, 1);
  }

  private adicionarMensagemSemRegistros() {
    const table = document.querySelector(this.idTabelaHTML ? `#${this.idTabelaHTML}` : 'table');

    if (table && !document.getElementById(`alerta-sem-registtros${this.idTabelaHTML}`)) {
      table
        .getElementsByTagName('tbody')
        .item(0)
        .insertAdjacentHTML(
          'beforebegin',
          `<div id="alerta-sem-registtros${this.idTabelaHTML}" class="${this.cssClassesMensagemSemRegistro}" role="alert">
            ${this.mensagemSemRegistros}
          </div>`
        );
    }
  }

  private removerMensagemSemRegistros() {
    if (document.getElementById(`alerta-sem-registtros${this.idTabelaHTML}`)) {
      document.getElementById(`alerta-sem-registtros${this.idTabelaHTML}`).remove();
    }
  }

  /**
   * Remove item do dataSource e atualiza os inscritos.
   * @param index Item que deve ser removido.
   * @returns void
   */
  remove(index: number): void {
    if (index > -1) {
      this.data.splice(index, 1);
      this._updateChangeSubscription();
    } else {
      throw 'É necessario ser um index maior que -1.';
    }
  }

  /**
   * Subscribe to changes that should trigger an update to the table's rendered rows. When the
   * changes occur, process the current state of the filter, sort, and pagination along with
   * the provided base data and send it to the table for rendering.
   */
  _updateChangeSubscription() {
    // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
    // The events should emit whenever the component emits a change or initializes, or if no
    // component is provided, a stream with just a null event should be provided.
    // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
    // pipeline can progress to the next step. Note that the value from these streams are not used,
    // they purely act as a signal to progress in the pipeline.
    const sortChange: Observable<any | null> = this._sort ? merge<any>(this._sort.sortChange, this._sort.initialized) : observableOf(null);
    const pageChange: Observable<any | null> = this._paginator ? merge<any>(this._paginator.page, this._paginator.initialized) : observableOf(null);

    const dataStream = this._data;
    // Watch for base data or filter changes to provide a filtered set of data.
    const filteredData = combineLatest(dataStream, this._filter).pipe(map(([data]) => this._filterData(data)));
    // Watch for filtered data or sort changes to provide an ordered set of data.
    const orderedData = combineLatest(filteredData, sortChange).pipe(map(([data]) => this._orderData(data)));
    // Watch for ordered data or page changes to provide a paged set of data.
    const paginatedData = combineLatest(orderedData, pageChange).pipe(map(([data]) => this._pageData(data)));
    // Watched for paged data changes and send the result to the table to render.
    this._renderChangesSubscription.unsubscribe();
    this._renderChangesSubscription = paginatedData.subscribe(data => this._renderData.next(data));
  }

  /**
   * Returns a filtered data array where each filter object contains the filter string within
   * the result of the filterTermAccessor function. If no filter is set, returns the data array
   * as provided.
   */
  _filterData(data: T[]) {
    // If there is a filter string, filter out data that does not contain it.
    // Each data object is converted to a string using the function defined by filterTermAccessor.
    // May be overridden for customization
    this.filteredData = !this.filter
      ? data
      : data.filter(obj => {
          return this.filterPredicate(obj, this.filter);
        });

    if (this.paginator) {
      this._updatePaginator(this.filteredData.length);
    }

    return this.filteredData;
  }

  /**
   * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
   * data array as provided. Uses the default data accessor for data lookup, unless a
   * sortDataAccessor function is defined.
   */
  _orderData(data: T[]): T[] {
    if (!data) {
      return null;
    }

    // If there is no active sort or direction, return the data without trying to sort.
    if (!this.sort) {
      return data;
    }

    return this.sortData(data.slice(), this.sort);
  }

  /**
   * Returns a paged splice of the provided data array according to the provided MatPaginator's page
   * index and length. If there is no paginator provided, returns the data array as provided.
   */
  _pageData(data: T[]): T[] {
    if (!this.paginator) {
      return data;
    }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice().splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the paginator's last page. Values are changed in a resolved promise to
   * guard against making property changes within a round of change detection.
   */
  _updatePaginator(filteredDataLength: number) {
    Promise.resolve().then(() => {
      if (!this.paginator) {
        return;
      }

      this.paginator.length = filteredDataLength;

      // If the page index is set beyond the page, reduce it to the last page.
      if (this.paginator.pageIndex > 0) {
        const lastPageIndex = Math.ceil(this.paginator.length / this.paginator.pageSize) - 1 || 0;
        this.paginator.pageIndex = Math.min(this.paginator.pageIndex, lastPageIndex);
      }
    });
  }

  /**
   * Used by the MatTable. Called when it connects to the data source.
   * @docs-private
   */
  connect() {
    return this._renderData;
  }

  /**
   * Used by the MatTable. Called when it is destroyed. No-op.
   * @docs-private
   */
  disconnect() {}

  /**
   * Método utilizado para retornar o valor da propriedade de um campo.
   * @param item - Item que Comtém o Atributo.
   * @param prop - Nome do Atributo.
   *        Ex: id
   *        Ex: risco.id
   * Obs: Criei este método para conseguir trabalhar com classes
   */
  private retornarPropItem(item: any, prop: string): any {
    let arrProp = prop.split('.');
    let propItem = null;

    for (let itemProp of arrProp) {
      if (!propItem) {
        propItem = !!item && item.hasOwnProperty(itemProp) ? item[itemProp] : null;
      } else {
        propItem = propItem[itemProp];
      }
    }

    return propItem;
  }
}
