import { Subject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export class AplsPopupRef {
  constructor(private _onEvento$: Subject<boolean>) {}

  public onSalvar(): Observable<boolean> {
    return this._onEvento$.asObservable().pipe(
      filter(v => v),
      take(1)
    );
  }

  public onCancelar(): Observable<boolean> {
    return this._onEvento$.asObservable().pipe(
      filter(v => !v),
      take(1)
    );
  }

  public aoFechar(): Observable<boolean> {
    return this._onEvento$.asObservable().pipe(take(1));
  }
}
