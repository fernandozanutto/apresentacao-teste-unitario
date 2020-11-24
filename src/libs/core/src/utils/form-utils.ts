/**
 * @author Rogério Alves
 * @since 24/01/2019
 */

import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormArray, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';

import { formatarResponseParaAsync } from './utils';
import { dataForm } from './constantes';
import { CollectionsUtils } from './collections-utils';
import { isArray } from 'util';

/**
 * Classe utilitária de Forms
 */
@Injectable({
  providedIn: 'root'
})
export class FormUtils {
  constructor(private formBuilder: FormBuilder, private collectionsUtils: CollectionsUtils) {}

  /**
   * Método utilizado para marcar os FormControls do FormGroup como tocado
   * Obs: Isso é necessário para marcar os campos como obrigatórios
   * @param formGroup formGroup
   */
  marcarFormGroupTocado(formGroup: FormGroup) {
    for (const field in formGroup.controls) {
      // 'field' is a string
      const control: any = formGroup.get(field);
      if (!!control) {
        control.markAsTouched();

        if (control.controls) {
          if (isArray(control.controls)) {
            control.controls.forEach((c: any) => this.marcarFormGroupTocado(c));
          } else {
            this.marcarFormGroupTocado(control);
          }
        }
      }
    }
  }

  /**
   * Método utilizado para marcar os FormControls do FormGroup como não tocado
   * Obs: Isso é necessário para desmarcar os campos como obrigatórios
   * @param formGroup formGroup
   */
  marcarFormGroupIntocado(formGroup: FormGroup) {
    for (const field in formGroup.controls) {
      // 'field' is a string
      const control: any = formGroup.get(field);
      if (!!control) {
        control.markAsUntouched();

        if (control.controls && isArray(control.controls)) {
          if (isArray(control.controls)) {
            control.controls.forEach((c: any) => this.marcarFormGroupIntocado(c));
          } else {
            this.marcarFormGroupIntocado(control);
          }
        }
      }
    }
  }

  /**
   * Método utilizado para atualizar a obrigatoriedade do Campo no FormGroup
   * @param formGroup - FormGroup que contém o campo
   * @param identificador - Identificador do FormControl
   * @param isObrigatorio - Flag que informa se o campo vai ser ou não obrigatório
   */
  atualizarObrigatoriedadeCampo(formGroup: FormGroup, identificador: string, isObrigatorio: boolean): void {
    let formControl = formGroup.get(identificador);
    if (!!formControl) {
      formControl.setValidators(isObrigatorio ? Validators.required : null);
      formControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  /**
   * Método utilizado para atualizar a obrigatoriedade dos Campos no FormGroup
   * @param formGroup - FormGroup que contém o campo
   * @param identificadores - Array de Identificadores do FormControl
   * @param isObrigatorio - Flag que informa se o campo vai ser ou não obrigatório
   */
  atualizarObrigatoriedadeCampos(formGroup: FormGroup, identificadores: string[], isObrigatorio: boolean): void {
    identificadores.forEach(identificador => this.atualizarObrigatoriedadeCampo(formGroup, identificador, isObrigatorio));
  }

  /**
   * Método utilizado para adicionar um FormGroup dentro de um FormAray
   *
   * @param itemAdicionado - Objeto que será adicionado no FormArray. Ex: {id: 1, descricao: 'Cargo'}
   * @param campoFormGroup  - Campo que informa em qual FormAray será adicionado o Item. Ex: 'areas'
   * @param formGroup - Form principal, onde o FormArray está adicionado. Ex: this.formCadastro
   *
   * @returns Retorna uma lista com os valores do FormArray
   */
  adicionarItemFormArray(itemAdicionado: any, campoFormGroup: string, formGroup: FormGroup) {
    let formGroupAdicionar = this.formBuilder.group({});
    let listaItens = formGroup.get(campoFormGroup) as FormArray;

    if (listaItens instanceof FormControl) {
      listaItens = this.formBuilder.array([]);
    }

    if (typeof itemAdicionado === 'string') {
      listaItens.push(new FormControl(itemAdicionado));
    } else {
      for (let propRetorno in itemAdicionado) {
        formGroupAdicionar.addControl(propRetorno, new FormControl(itemAdicionado[propRetorno]));
      }

      listaItens.push(formGroupAdicionar);
    }

    return listaItens.value;
  }

  /**
   * Método utilizado para adicionar um FormGroup dentro de um FormAray
   *
   * @param itemAdicionado - Objeto que será adicionado no FormArray. Ex: {id: 1, descricao: 'Cargo'}
   * @param formArray - Form Array, onde o item será adicionado.
   *
   * @returns Retorna uma lista com os valores do FormArray
   */
  adicionarItemFormArray2(itemAdicionado: any, formArray: FormArray) {
    let formGroupAdicionar = this.formBuilder.group({});
    for (let propRetorno in itemAdicionado) {
      formGroupAdicionar.addControl(propRetorno, new FormControl(itemAdicionado[propRetorno]));
    }
    formArray.push(formGroupAdicionar);

    return formArray.value;
  }

  /**
   * @Deprecated - Para evitar algum tipo de erro por conta de referência, prefira utilizar o "excluirItemFormArrayPorIdentificador"
   *
   * Método utilizado para excluir um item do FormArray
   * @param identificador - Propriedade que informa em qual FormAray será removido o Item
   * @param itemSelecionado - Item que será excluído
   * @param formGroup - Form principal, onde o FormArray está adicionado
   * @returns Retorna uma lista com os valores do FormArray
   */
  excluirItemFormArray(identificador: string, itemSelecionado: any, formGroup: FormGroup): any {
    let listaItens: any = formGroup.get(identificador) as FormArray;
    let index = this.retornarIndiceItemFormArray(identificador, itemSelecionado, formGroup);
    listaItens.removeAt(index, { emitEvent: false });
    itemSelecionado = null;

    return listaItens.value;
  }

  /**
   * Método utilizado para excluir um item do FormArray
   *
   * @param identificadorFormArray - Propriedade que informa em qual FormAray será removido o Item
   * @param itemSelecionado - Item que será excluído
   * @param formGroup - Form principal, onde o FormArray está adicionado
   * @param campoComparacao1 - Identificador de item selecionado
   * @param campoComparacao2 - (Opcional) Identificador de item selecionado
   * @param validarCamposComparacaoJuntos - (Default false) Caso seja informado como true o retorno do índice do objeto será considerado de acordo com a pesquisa dos 2 campos (campoComparacao1 E campoComparacao2). Por default a pesquisa funciona com OU
   *
   * @returns Retorna uma lista com os valores do FormArray
   */
  excluirItemFormArrayPorIdentificador(
    identificadorFormArray: string,
    itemSelecionado: any,
    formGroup: FormGroup,
    campoComparacao1: string,
    campoComparacao2?: string,
    validarCamposComparacaoJuntos: Boolean = false
  ): any {
    const listaItens: any = formGroup.get(identificadorFormArray) as FormArray;

    const index = this.retornarIndiceItemFormArrayPorIdentificador(
      identificadorFormArray,
      itemSelecionado,
      formGroup,
      campoComparacao1,
      campoComparacao2,
      validarCamposComparacaoJuntos
    );

    listaItens.removeAt(index, { emitEvent: false });
    itemSelecionado = null;

    return listaItens.value;
  }

  /**
   * Método utilizado para limpar um FormArray dentro de um FormGroup
   * @param formGroup - Form principal, onde o FormArray se encontra
   * @param identificador - Propriedade que informa em qual FormAray será limpo
   */
  limparListaFormArray(formGroup: FormGroup, identificador: string): void {
    let formArray: FormArray = formGroup.get(identificador) as FormArray;
    formArray.controls = [];
    formArray.removeAt(0);
  }

  limparTodosFormArray(formGroup: FormGroup): void {
    let formulario: any;

    // percorre todos os controls para encontrar um formArray
    for (const control in formGroup.controls) {
      formulario = formGroup.controls[control];

      // se o control for um form array, deve-se montar e popular o form group de cada valor do dataSource
      if (formulario instanceof FormArray && (formulario as FormArray).controls.length > 0) {
        this.limparListaFormArray(formGroup, control);
      }
    }
  }

  /**
   * @Deprecated - Para evitar algum tipo de erro por conta de referência, prefira utilizar o "atualizarItemFormArrayPorIdentificador"
   *
   * Método utilizado para atualizar um item do FormArray
   * @param identificador - Propriedade que informa em qual FormAray será atualizado
   * @param itemIndice - Item selecionado, o qual será recuperado o índice
   * @param itemAtualizar - Item atualizado
   * @param formGroup - Form principal, onde o FormArray se encontra
   * @returns Retorna uma lista com os valores do FormArray
   */
  atualizarItemFormArray(identificador: string, itemIndice: any, itemAtualizar: any, formGroup: FormGroup): any {
    let listaItens = formGroup.get(identificador) as FormArray;
    let index = this.retornarIndiceItemFormArray(identificador, itemIndice, formGroup);
    listaItens.at(index).patchValue(itemAtualizar);
    itemIndice = null;
    itemAtualizar = null;

    return listaItens.value;
  }

  /**
   * Método utilizado para atualizar um item do FormArray a partir do Identificador
   * @param identificadorFormArray - Propriedade que informa em qual FormAray será atualizado. Ex: riscoGhe
   * @param identificadorItem - Identificador utilizado para retornar o item que será atualizado
   * (Obs: Pode ser um array com até dois itens). Ex1: 'id', Ex2: ['id', 'descricao']
   * @param itemAtualizar - Item atualizado
   * @param formGroup - Form principal, onde o FormArray se encontra
   * @returns Retorna uma lista com os valores do FormArray
   */
  atualizarItemFormArrayPorIdentificador(identificadorFormArray: string, identificadorItem: any, itemAtualizar: any, formGroup: FormGroup): any {
    let listaItens = formGroup.get(identificadorFormArray) as FormArray;
    let propComparacao1 = identificadorItem,
      propComparacao2 = null;

    if (Array.isArray(identificadorItem)) {
      propComparacao1 = identificadorItem[0];
      propComparacao2 = identificadorItem[1];
    }

    const index = this.retornarIndiceItemFormArrayPorIdentificador(identificadorFormArray, itemAtualizar, formGroup, propComparacao1, propComparacao2, false);
    listaItens.at(index).patchValue(itemAtualizar);
    itemAtualizar = null;

    return listaItens.value;
  }

  /**
   * @Deprecated - Para evitar algum tipo de erro por conta de referência, prefira utilizar o "retornarIndiceItemFormArrayPorIdentificador"
   *
   * Método utilizado para retornar o índice de um item do FormArray
   * @param identificador - Propriedade que informa em qual FormAray será pesquisado o Item
   * @param itemSelecionado - Item que será recuperado o índice
   * @param formGroup - Form principal, onde o FormArray se encontra
   * @returns Retorna o índice do item no FormArray
   */
  retornarIndiceItemFormArray(identificador: string, itemSelecionado: any, formGroup: FormGroup): any {
    const listaItens = formGroup.get(identificador) as FormArray;
    return listaItens.value.indexOf(itemSelecionado);
  }

  /**
   * Método utilizado para retornar o índice de um item do FormArray
   * @param identificadorFormArray - Propriedade que informa em qual FormAray será pesquisado o Item
   * @param itemSelecionado - Item que será recuperado o índice
   * @param formGroup - Form principal, onde o FormArray se encontra
   * @param campoComparacao1 - Primeiro identificador do item selecionado
   * @param campoComparacao2 -  (Opcional) Segundo identificador do item selecionado
   * @param isTodosCamposValidos -  Informa se os Campos para comparacao (1 e 2) devem ambos serem validos.
   * Caso passar "false", irá considerar se qualquer um dos campos de comparação forem válidos
   * @returns Retorna o índice do item no FormArray
   */
  retornarIndiceItemFormArrayPorIdentificador(
    identificadorFormArray: string,
    itemSelecionado: any,
    formGroup: FormGroup,
    campoComparacao1: any,
    campoComparacao2?: any,
    isTodosCamposValidos: Boolean = true
  ): any {
    let listaItens = formGroup.get(identificadorFormArray) as FormArray;
    let isValido: boolean;
    let isValido2: boolean;
    let itemA: any;
    let itemB: any;

    return listaItens.value.findIndex((item: any) => {
      isValido2 = true;

      if (!!campoComparacao2) {
        itemA = this.collectionsUtils.retornarPropItem(item, campoComparacao2);
        itemB = this.collectionsUtils.retornarPropItem(itemSelecionado, campoComparacao2);

        isValido2 = !!itemA && !!itemB ? itemA === itemB : false;
      }

      itemA = this.collectionsUtils.retornarPropItem(item, campoComparacao1);
      itemB = this.collectionsUtils.retornarPropItem(itemSelecionado, campoComparacao1);
      isValido = !!itemA && !!itemB ? itemA === itemB : false;

      if (isTodosCamposValidos) {
        return isValido && isValido2;
      } else if (!!campoComparacao2) {
        return isValido || isValido2;
      }

      return isValido;
    });
  }

  /**
   * Verifica se determinado item já foi adicionado no formArray
   *
   * @param formGroup - Form principal, onde o FormArray está adicionado. Ex: this.formCadastro
   * @param campoFormGroup - Campo que informa em qual FormAray será adicionado o Item. Ex: 'areas'
   * @param itemAdicionado - Objeto que será adicionado no FormArray. Ex: {id: 1, descricao: 'Cargo'}
   * @param camposComparacao - Array com as strings de comparação. Ex: ['idFamilia', 'situacaoEntrega', 'permitirExcecao']
   *
   * @returns Retorna um boolean informado se o item  já foi adicionado no form array
   */
  verificarExistenciaItemFormArray(formGroup: FormGroup, campoFormGroup: string, itemAdicionado: any, camposComparacao: string[]): boolean {
    if (!!formGroup.get(campoFormGroup).value) {
      const retorno = formGroup.get(campoFormGroup).value.findIndex((itemLista: any) => {
        return this.isItemJaFoiAdicionado(itemLista, itemAdicionado, camposComparacao);
      });

      return retorno > -1;
    }
    return false;
  }

  /**
   * Com base no array camposComparacao é verificado de forma dinâmica se todas as condicionais correspondem
   *
   * @param itemLista
   * @param itemAdicionado
   * @param camposComparacao
   *
   * @returns Retona um boolean informando se o item já foi adicionado
   */
  private isItemJaFoiAdicionado(itemLista: any, itemAdicionado: any, camposComparacao: string[]): boolean {
    let condicionais = [];

    for (let index = 0; index < camposComparacao.length; index++) {
      const campoItemLista = this.collectionsUtils.retornarPropItem(itemLista, camposComparacao[index]);
      const campoItemAdicionado = this.collectionsUtils.retornarPropItem(itemAdicionado, camposComparacao[index]);

      if (campoItemLista === campoItemAdicionado) condicionais.push(true);
    }

    return camposComparacao.length === condicionais.length;
  }

  /**
   * Metodo que faz o preenchimento automatico dos FormArray, isso evita uma grande duplicacao de codigo desnecessaria nos components
   * @param dataSource
   */
  preencherFormArray(dataSource: any, formPrincipal: FormGroup) {
    let formulario: any;
    let propRetorno: any;

    // percorre todos os controls para encontrar um formArray
    for (let control in formPrincipal.controls) {
      formulario = formPrincipal.controls[control];

      // se o control for um form array, deve-se montar e popular o form group de cada valor do dataSource
      if (formulario instanceof FormArray && (formulario as FormArray).controls.length === 0) {
        // percorre por todos os registros de uma propriedade ARray do dataSource

        for (var x = 0; x < this.tratarTamanhoFormArray(dataSource[control]); x++) {
          if (typeof dataSource[control][x] === 'string') {
            (formPrincipal.get(control) as FormArray).push(new FormControl(dataSource[control][x]));
          } else {
            // inicializa um form group
            dataSource[control][x][dataForm] = this.formBuilder.group({});

            // percorre cada propriedade do Objeto inserido no Array.
            // para cada propriedade é criado um FormGroup
            for (propRetorno in dataSource[control][x]) {
              if (Array.isArray(dataSource[control][x][propRetorno])) {
                (dataSource[control][x][dataForm] as FormGroup).addControl(propRetorno, this.formBuilder.array([]));

                this.preencherFormArray2(propRetorno, dataSource[control][x], dataSource[control][x][dataForm]);
              } else {
                (dataSource[control][x][dataForm] as FormGroup).addControl(propRetorno, new FormControl(dataSource[control][x][propRetorno]));
              }
            }

            (formPrincipal.get(control) as FormArray).push(dataSource[control][x][dataForm]);
          }
        }
      }
    }
  }

  /**
   * Metodo que faz o preenchimento automatico dos FormArray, isso evita uma grande duplicacao de codigo desnecessaria nos components
   * @param dataSource
   */
  private preencherFormArray2(control: string, dataSource: any, formArray: FormArray) {
    let propRetorno: string;

    const lista = dataSource[control];

    if (!!lista) {
      for (var x = 0; x < lista.length; x++) {
        if (typeof lista[x] === 'string') {
          formArray.push(new FormControl(lista[x]));
        } else {
          // inicializa um form group
          lista[x][dataForm] = this.formBuilder.group({});

          // percorre cada propriedade do Objeto inserido no Array.
          // para cada propriedade é criado um FormGroup
          for (propRetorno in lista[x]) {
            if (Array.isArray(lista[x][propRetorno])) {
              (lista[x][dataForm] as FormGroup).addControl(propRetorno, this.formBuilder.array([]));
              this.preencherFormArray2(propRetorno, dataSource[control][x], lista[x][dataForm]);
            } else {
              (lista[x][dataForm] as FormGroup).addControl(propRetorno, new FormControl(lista[x][propRetorno]));
            }
          }

          (formArray.get(control) as FormArray).push(lista[x][dataForm]);
        }
      }
    }
  }

  /**
   * Método utilizado para tratar se o tamanho do FormArray.
   * Utilizei isto, pois se na requisição voltar um Array Nulo,
   * ocasiona erro de execução
   * @param dataSource
   */
  private tratarTamanhoFormArray(dataSource: any): number {
    let totalItens = 0;
    if (!!dataSource) {
      totalItens = dataSource.length;
    }

    return totalItens;
  }

  /**
   * reseta e habilita um determinado campo
   *
   * @param campo
   */
  resetarHabilitarCampo(campo: string, form: FormGroup, valor: any = '') {
    form.get(campo).patchValue(valor, { emitEvent: false });
    form.get(campo).enable({ emitEvent: false });
    form.get(campo).markAsUntouched();
  }

  /**
   * reseta e habilita uma lista de campos
   *
   * @param campo
   */
  resetarHabilitarCampos(campos: string[], form: FormGroup, valor: any = '') {
    campos.forEach(campo => this.resetarHabilitarCampo(campo, form, valor));
  }

  /**
   * reseta e habilita um determinado campo
   *
   * @param campo
   */
  habilitarCampo(campo: string, form: FormGroup) {
    form.get(campo).enable({ emitEvent: false });
    form.get(campo).markAsUntouched();
  }

  /**
   * habilita uma lista de campos
   *
   * @param campo
   */
  habilitarCampos(campos: string[], form: FormGroup) {
    campos.forEach(campo => this.habilitarCampo(campo, form));
  }

  /**
   * reseta e desabilita um determinado campo
   *
   * @param campo
   */
  desabilitarCampo(campo: string, form: FormGroup) {
    form.get(campo).disable({ emitEvent: false });
    form.get(campo).markAsUntouched();
  }

  /**
   * desabilita uma lista de campos
   *
   * @param campo
   */
  desabilitarCampos(campos: string[], form: FormGroup) {
    campos.forEach(campo => this.desabilitarCampo(campo, form));
  }

  /**
   * reseta e desabilita um determinado campo
   * @param campo
   */
  resetarDesabilitarCampo(campo: string, form: FormGroup, valor: any = '') {
    form.get(campo).patchValue(valor, { emitEvent: false });
    form.get(campo).disable({ emitEvent: false });
    form.get(campo).markAsUntouched();
  }

  /**
   * reseta e desabilita uma lista de campos
   * @param campos
   */
  resetarDesabilitarCampos(campos: string[], form: FormGroup, valor: any = '') {
    campos.forEach(campo => this.resetarDesabilitarCampo(campo, form, valor));
  }

  /**
   * Método utilizado para retornar uma lista de areas, podendo filtrar por nivel | id pai | status = 'A' 'A,I'
   */
  retornarArea(nivel, idArea, status): Promise<any> {
    return new Promise(
      function(resolve) {
        resolve(this.http.cache(`area-${idArea}`, this.areaService.listarAreasPeloNivelId(nivel, idArea, status).pipe(map(formatarResponseParaAsync))));
      }.bind(this)
    );
  }

  public validarEspacosEmBranco(control: AbstractControl) {
    if (control.value && !control.value.trim()) {
      return { somenteEspacoEmBranco: true };
    }

    return null;
  }
}
