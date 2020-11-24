import { Injectable } from "@angular/core";

/**
 * Classe para controle de loader personalizado.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpLoader {
  listRequests = [];
  listUrlsIgnoradas = [];
  splash = document.getElementById('splashLoader');

  ignora(url: any) {
    if(!!url && url.length > 0) {
      const index = this.listUrlsIgnoradas.findIndex(item => url.indexOf(item) != -1);

      if (index === -1) {
        this.listUrlsIgnoradas.push(url);
      }
    }
  }

  remove(url: any) {
    if(!!url && url.length > 0) {
      const index = this.listUrlsIgnoradas.findIndex(item => url.indexOf(item) != -1);

      if (index !== -1) {
        this.listUrlsIgnoradas.splice(index, 1);
      }
    }
  }

  verifica(url: any) {
    return this.listRequests.findIndex(item => url.indexOf(item) != -1) == -1
  }

  mostrarLoader(url: any) {
    const index = this.listRequests.indexOf(url);
    const indexUrlIgnorada = this.listUrlsIgnoradas.findIndex(item => url.indexOf(item) != -1);

    if (index == -1 && indexUrlIgnorada == -1) {
      this.listRequests.push(url);
      this.splash.style.display = 'flex';
    }
  }

  finalizarLoader(url?: any) {
    // Caso não tenha url deve apenas verificar se tem request em adamento
    if (!url) {
      if (this.listRequests.length == 0) {
        this.splash.style.display = 'none';
      }
      return false;
    }
    const index = this.listRequests.indexOf(url);
    
    if (index != -1) {
      if (this.listRequests.length == 1 && this.splash.style.display != 'none') {
        this.splash.style.display = 'none';
      }
      this.listRequests.splice(index, 1);
    }

    const indexUrlIgnorada = this.listUrlsIgnoradas.findIndex(item => url.indexOf(item) != -1);
    if (indexUrlIgnorada != -1) {
      this.listUrlsIgnoradas.splice(indexUrlIgnorada, 1);
    }
  }
  
}