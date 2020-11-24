import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { UsuarioLogado } from './usuario-logado';

@Injectable({
  providedIn: 'root'
})
export class LogadoGuard implements CanActivate {
  constructor(protected aplsUsuarioLogado: UsuarioLogado) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // TODO: Fazer validação se as informações estão integras ainda
    return !!this.aplsUsuarioLogado.token;
  }
}
