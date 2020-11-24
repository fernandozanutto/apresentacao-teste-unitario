/**
 * @license
 * Copyright Apollus EHS Solution All Rights Reserved.
 */

import { AbstractControl } from "@angular/forms";

/**
 * esta implementacao controla algum input que necessite fazer o tratamento de edicao em andamento quando 
 * o usuario clicar no botao salvar
 * 
 * Exemplo de uso: new FormControl('', edicaoAndamentoValidator);
 * 
 * @param control 
 */
export function edicaoAndamentoValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined &&  control.value !== null && control.value !== '' ) {
        return { 'edicaoAndamento': true };
    }
    return null;
}