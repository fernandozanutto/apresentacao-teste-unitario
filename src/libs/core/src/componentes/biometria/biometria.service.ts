import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpLoader } from '@apollus-ngx/core';

@Injectable()
export class BiometriaService {
  path_raiz = '';
  constructor(public http: HttpClient, private httpLoader: HttpLoader) {
    this.path_raiz = 'http://localhost:8118/api/biometria';
  }

  async coletarDigital() {
    this.httpLoader.ignora(`${this.path_raiz}/coletar-digital`);
    return this.http.get(`${this.path_raiz}/coletar-digital`).toPromise();
  }

  async compararDigital(digitaisLista: string[]) {
    this.httpLoader.ignora(`${this.path_raiz}/comparar-digital`);
    return this.http.post(`${this.path_raiz}/comparar-digital`, digitaisLista).toPromise();
  }
}
