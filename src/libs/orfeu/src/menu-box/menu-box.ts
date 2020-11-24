import { Component, ViewEncapsulation, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export type ColumnsNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Classe Menu Objeto - garante que o menu irá receber os parametros corretos para renderização do componente na tela.
 * @param descricao: nome do menu
 * @param icon: icone do sistema
 * @param permissao: booleano true ou false, define qual será a classe css que será utilizada no botão
 * @param rota: define qual rota será apontada ao clicar no menu quando estiver ativo.
 * @param eventomenu: recebe evento disparado ao clicar no menu quando for enviado.
 * Exemplo com rotas: new MenuObjeto('Entregar EPI', 'fas fa-cart-plus', this.usuarioDistribuidor.permissao1, '/entregar-epi/cadastro/')
 * Exemplo com evento Menu: new MenuObjeto('Entregar EPI', 'fas fa-cart-plus', this.usuarioDistribuidor.permissao1, '', this.abrirModalConfiguracao)
 */
export class MenuObjeto {
  constructor(
    public descricao: String,
    public icon: String,
    public permissao: Boolean,
    public rota: String,
    public eventoMenu?: EventEmitter<any>,
    public clicked: boolean = false
  ) {}
}

@Component({
  selector: 'apls-menu-box',
  templateUrl: 'menu-box.html',
  styleUrls: ['menu-box.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AplsMenuBox implements OnInit{
  /**
   * Array de objetos que vem da tela pai.
   */
  @Input() menuArray: Array<MenuObjeto>;
  @Input() menuColumns: ColumnsNumber = 3;

  /**
   * Esta varável define o tamanho do container pai, para casos em que sejam necessarios poucos itens de menu e é preciso 
   * diminuir o tamanho deles. A unidade de medida é %.
   */
  @Input() parentContainerSize: String;

  parentContainerSizeVal;
  constructor(private router: Router) {}

  ngOnInit(){
    this.parentContainerSizeVal = this.parentContainerSize+'%';    
  }
  /**
   * Método responsável pela navegaçao através do menu
   * @param rota
   * @param permissao
   */
  btnNavegarRota(itemMenu: MenuObjeto) {
    const { rota, permissao, eventoMenu } = itemMenu;

    if (permissao) {
      if (eventoMenu) {
        eventoMenu.emit();
      } else {
        itemMenu.clicked = true;
        this.router.navigate([rota]);
      }
    }
  }
}
