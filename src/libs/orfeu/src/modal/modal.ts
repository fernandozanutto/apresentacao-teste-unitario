import {
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  ScrollStrategy,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ElementRef, Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, Observable } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { AplsDialog, AplsDialogRef } from '../dialog';
import { AplsAlertaComponent, DataAlerta } from './alerta/alerta.component';
import { AplsFotosComponent } from './fotos/fotos.component';
import { AplsPopupComponent, APLS_POPUP_DATA, PopupOpcoes } from './popup/popup.component';
import { TranslateService } from '@ngx-translate/core';
import { AplsPopupRef } from './modal.models';

export const SCROLL_THROTTLER_MS = 20;

export const APLS_POPUP_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('apls-popup-scroll-strategy');

export function APLS_POPUP_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLER_MS });
}

export const APLS_POPUP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: APLS_POPUP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APLS_POPUP_SCROLL_STRATEGY_FACTORY
};

export type ToastrType = 'A' | 'S' | 'E' | 'I';

@Injectable({
  providedIn: 'root'
})
export class AplsModal {
  /**
   * Guarda a referencia quando um dialoger é aberto.
   */
  dialogRef: any;

  /**
   * Guarda a referencia quando tem aberto um popup.
   */
  popupInstance: any;

  /**
   * Guarda para que posição o popup pode abrir.
   */
  position = 'above';

  _overlayRef: OverlayRef | null;

  evtBackdropClick: Subscription;

  private readonly _destroyed = new Subject<void>();

  constructor(
    public aplsDialog: AplsDialog,
    private toastrService: ToastrService,
    private _overlay: Overlay,
    private _injector: Injector,
    @Inject(APLS_POPUP_SCROLL_STRATEGY) private _scrollStrategy,
    private translate: TranslateService
  ) {}

  dialog(component, data, panelClass: string[], width: string = '800px'): AplsDialogRef<any> {
    let dialogRef = this.aplsDialog.open(component, {
      width: width,
      disableClose: true,
      panelClass: panelClass,
      data: data,
      autoFocus: false
    });

    return dialogRef;
  }

  /**
   * Adiciona toast na tela.
   * @param mensagem Texto da mensagem
   * @param titulo Titulo do toastr
   * @param tipoAlerta Tipo do toastr.(A = Amarelo, S = Verde, E = Vermelho, I = Azul)
   * @param timeout Tempo de permanência na tela. Default 3000
   */
  toast(mensagem: string, tipoAlerta: ToastrType = 'A', timeout: number = 3500) {
    let tipoToast = { S: 'success', E: 'error', A: 'warning', I: 'info' };

    this.toastrService[tipoToast[tipoAlerta]](mensagem, this.buscarTitulo(tipoAlerta), {
      timeOut: timeout
    });
  }

  /**
   * Retorna o título de acordo com o tipo de alerta
   */
  private buscarTitulo(tipoAlerta: ToastrType): string {
    let titulo: string;

    //TODO: verificar questão do i18n
    switch (tipoAlerta) {
      case 'A': {
        // titulo = 'Atenção';
        titulo = this.translate.instant('label.atencao');
        break;
      }
      case 'S': {
        titulo = this.translate.instant('label.sucesso');
        break;
      }
      case 'E': {
        titulo = this.translate.instant('label.erro');
        break;
      }
      case 'I': {
        titulo = this.translate.instant('label.informacao');
        break;
      }
    }

    return titulo;
  }

  /**
   * Constroi um popup a partir de um objeto js.
   *
   * É chamado apenas via codigo. Porem existe um outro component, não herdado e sem vinculo que pode fazer popup no template.
   * Sem necessidade de codigo TS. Procure na pasta componentes.
   */
  popup(elementRef: ElementRef, config: PopupOpcoes) {
    // Prepara overlay
    const overlayRef = this.criaOverlay(elementRef);
    this._detach();

    if (!!config.enableClose) {
      this.evtBackdropClick = overlayRef.backdropClick().subscribe(() => {
        this._detach();
      });
    }

    // Prepara as configs para o component popup
    config.origem = (elementRef.nativeElement || elementRef).getBoundingClientRect().top;
    config.fnFechar = this._detach.bind(this);

    // Prepara para criar o DI
    const injectionTokens = new WeakMap<any, any>([[APLS_POPUP_DATA, config]]);

    // Cria o DI
    const injector = new PortalInjector(this._injector, injectionTokens);

    // Criar o component com o DI e sem viewContainer
    let _portal = new ComponentPortal(AplsPopupComponent, undefined, injector);

    // Coloca component na tela e salva a referencia
    this.popupInstance = overlayRef.attach(_portal).instance;
  }

  /**
   *  Constrói um popup de aviso com mensagem customisada, pedindo ao usuário que confirme ou cancele.
   *  Retorna um umbjeto AplsPopupRef
   * @param elementRef
   */
  public popupAviso(elementRef: ElementRef, mensagem: string): AplsPopupRef {
    const subject = new Subject<boolean>();
    this.popup(elementRef, {
      titulo: this.translate.instant('label.atencao'),
      mensagem: mensagem,
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.cancelar'),
          color: 'light',
          handler: () => {
            subject.next(false);
            subject.complete();
          }
        },
        {
          nome: this.translate.instant('label.confirmar'),
          handler: () => {
            subject.next(true);
            subject.complete();
          }
        }
      ]
    });

    return new AplsPopupRef(subject);
  }

  /**
   *  Constrói um popup que pede ao usuário confirmar a alteração, retorna um umbjeto AplsPopupRef
   * @param elementRef
   */
  public popupConfirmarAlteracao(elementRef: ElementRef): AplsPopupRef {
    return this.popupAviso(elementRef, this.translate.instant('mensagem.informacaoes_atencao_confirmar_alteracao'));
  }

  /**
   *  Constrói um popup de informações, retorna um umbjeto AplsPopupRef
   * @param elementRef
   */
  public popupSalvarInformacoes(elementRef: ElementRef): AplsPopupRef {
    const subject = new Subject<boolean>();
    this.popup(elementRef, {
      titulo: this.translate.instant('label.atencao'),
      mensagem: this.translate.instant('mensagem.informacaoes_nao_salva_deseja_salvar'),
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.fechar_sem_salvar'),
          color: 'light',
          handler: () => {
            subject.next(false);
            subject.complete();
          }
        },
        {
          nome: this.translate.instant('label.salvar_e_fechar'),
          handler: () => {
            subject.next(true);
            subject.complete();
          }
        }
      ]
    });

    return new AplsPopupRef(subject);
  }

  /**
   * Constrói um popup de confirmacao de exclusão, retorna um umbjeto AplsPopupRef
   * @param elementRef
   */
  public popupConfimaExclusao(elementRef: ElementRef): AplsPopupRef {
    const subject = new Subject<boolean>();
    this.popup(elementRef, {
      titulo: this.translate.instant('label.atencao'),
      mensagem: this.translate.instant('mensagem.deseja_realmente_excluir'),
      tipo: 'A',
      botoes: [
        {
          nome: this.translate.instant('label.cancelar'),
          color: 'light',
          handler: () => {
            subject.next(false);
            subject.complete();
          }
        },
        {
          nome: this.translate.instant('label.excluir'),
          handler: () => {
            subject.next(true);
            subject.complete();
          }
        }
      ]
    });
    return new AplsPopupRef(subject);
  }

  /**
   * Deve receber um objecto dataAlert para criar o alerta.
   * @param data Objeto dataAlerta para construção do alerta.
   */
  alert(data: DataAlerta, width: string = '400px') {
    if (!!this.dialogRef) {
      return false;
    }

    this.dialogRef = this.aplsDialog.open(AplsAlertaComponent, {
      width: width,
      disableClose: true,
      data: data
    });

    this.dialogRef.afterClosed().subscribe(result => {
      delete this.dialogRef;
    });

    return this.dialogRef;
  }

  /**
   * @param data Array de url's das fotos a serem exibidas
   */
  fotos(data: Array<string>, width: string = '400px') {
    if (!!this.dialogRef) {
      return false;
    }

    this.dialogRef = this.aplsDialog.open(AplsFotosComponent, {
      width: width,
      data: data
    });

    this.dialogRef.afterClosed().subscribe(result => {
      delete this.dialogRef;
    });

    return this.dialogRef;
  }

  finalizaPopup() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
    }

    this.popupInstance = null;
  }

  criaOverlay(elementRef: ElementRef): OverlayRef {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(elementRef)
      .withFlexibleDimensions(true)
      .withViewportMargin(8);

    strategy.withLockedPosition();

    this._overlayRef = this._overlay.create({
      direction: 'ltr',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: strategy,
      panelClass: '',
      scrollStrategy: this._scrollStrategy()
    });

    this._updatePosition();

    this._overlayRef
      .detachments()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    return this._overlayRef;
  }

  /** Detaches the currently-attached tooltip. */
  _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();

      if (!!this.evtBackdropClick && !!this.evtBackdropClick.unsubscribe && typeof this.evtBackdropClick.unsubscribe === 'function') {
        this.evtBackdropClick.unsubscribe();
      }
    }

    this.popupInstance = null;
  }

  /** Updates the position of the current tooltip. */
  _updatePosition() {
    const position = this._overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    position.withPositions([
      { ...origin.main, ...overlay.main },
      { ...origin.fallback, ...overlay.fallback }
    ]);
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): { main: OverlayConnectionPosition; fallback: OverlayConnectionPosition } {
    const isLtr = true;
    const position = this.position;
    let overlayPosition: OverlayConnectionPosition;

    if (position == 'above') {
      overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
    } else if (position == 'below') {
      overlayPosition = { overlayX: 'center', overlayY: 'top' };
    } else if (position == 'before' || (position == 'left' && isLtr) || (position == 'right' && !isLtr)) {
      overlayPosition = { overlayX: 'end', overlayY: 'center' };
    } else if (position == 'after' || (position == 'right' && isLtr) || (position == 'left' && !isLtr)) {
      overlayPosition = { overlayX: 'start', overlayY: 'center' };
    }

    const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

    return {
      main: overlayPosition,
      fallback: { overlayX: x, overlayY: y }
    };
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
   */
  _getOrigin(): { main: OriginConnectionPosition; fallback: OriginConnectionPosition } {
    const isLtr = true;
    const position = this.position;
    let originPosition: OriginConnectionPosition;

    if (position == 'above' || position == 'below') {
      originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
    } else if (position == 'before' || (position == 'left' && isLtr) || (position == 'right' && !isLtr)) {
      originPosition = { originX: 'start', originY: 'center' };
    } else if (position == 'after' || (position == 'right' && isLtr) || (position == 'left' && !isLtr)) {
      originPosition = { originX: 'end', originY: 'center' };
    }

    const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);

    return {
      main: originPosition,
      fallback: { originX: x, originY: y }
    };
  }

  /** Inverts an overlay position. */
  _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'above' || this.position === 'below') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return { x, y };
  }
}
