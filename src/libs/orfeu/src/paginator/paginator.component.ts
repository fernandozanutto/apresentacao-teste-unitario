import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'apls-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class AplsPaginatorComponent implements OnInit {
  // Guarda a pagina atual
  page = 0;
  itensPorPagina = new FormControl();

  // Guarda o numero total de paginas
  lastpage = 0;

  /**
   * Retorna mudança no paginador.
   */
  @Output() change = new EventEmitter();

  @Input() registro: any;

  @Input() reduzido = false;

  constructor() {}

  ngOnInit() {
    this.itensPorPagina.patchValue(this.registro.maxResultados);
    this.itensPorPagina.valueChanges.subscribe(res => {
      this.itemPorPagina(res);
      this.restart(1);
    });
  }

  itemPorPagina(item) {
    this.registro.maxResultados = item;
  }

  calculaPaginador() {
    this.lastpage = this.registro.totalPaginas > 0 ? Math.ceil(this.registro.totalPaginas / this.registro.maxResultados) : 0;
    return this.lastpage;
  }

  /**
   * Reinicia o contador.
   */
  restart(pagina?: number) {
    if (!!pagina) {
      this.registro.pagina = pagina;
    } else {
      this.registro.pagina = 0;
    }

    this.change.emit({ page: this.registro.pagina });
  }

  /**
   * Função chamada pelo botão de retorno
   */
  btnBack() {
    if (this.registro.pagina > 1) {
      this.change.emit({ page: --this.registro.pagina });
    }
  }

  /**
   * Função chamada pelo botão de avançar.
   */
  btnNext() {
    if (this.registro.pagina < this.lastpage) {
      this.change.emit({ page: ++this.registro.pagina });
    }
  }
}
