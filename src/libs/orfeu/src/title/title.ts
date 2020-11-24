/**********************************************************
 * Criador: Thiago Feijó                                  *
 * Data: 21/12/2017                                       *
 * Descrição: Classe responsavel por gerenciar cookies.   *
 * *******************************************************/

import { Injectable, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AplsTitle {
  evtTitleChange: EventEmitter<string> = new EventEmitter();

  constructor(private title: Title) {}

  get(): string {
    return this.title.getTitle();
  }

  set(titulo: string): void {
    this.title.setTitle(`Apollus - ${titulo}`);
    this.evtTitleChange.emit(titulo);
  }
}
