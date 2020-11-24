import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { map, debounceTime, repeat } from 'rxjs/operators';
import { AplsTitle } from '@apollus-ngx/orfeu';

import { formatarResponse } from '../utils';
import { Tela } from './tela';
import { AplsUnload } from '../unload';
import { environment } from '@apollus/environments';

export class TelaCadastroBase extends Tela {
  /**
   * [IMPORTANTE]
   *
   * Essa é a propriedade que se guarda o form para a tela de cadastro.
   *
   * Sua entrada e saida deve ser o mais limpa possivel, se aproximando ao maximo
   * do que a api espera como envio.
   *
   * DEVE ser definido na classe que irá extender de "TelaCadastro".
   */
  formCadastro: FormGroup;

  /**
   * Guarda o serviço da tela. Usado para enviar ou atualizar registro.
   *
   * Deve ser inserido em toda chamada. (Possui problema de perder o this quando passa a referencia da função).
   *
   * DEVE ser definido na classe que irá extender de "TelaCadastro".
   */
  servicoPrincipal: Function;

  /**
   * Valor que o form deve ter
   */
  formValuePadrao: any;

  /**
   * Controla os estados possiveis para a tela.
   *
   * Pode receber novas propriedades em tempo de execução.
   */
  controles: any = {
    teveAlteracao: null,
    modoVisualizacao: false,
    modoEdicao: false,
    idRegistro: null,
    estado: '',
    permissoes: {
      cadastro: false,
      edicao: false,
      visualizacao: false,
    }
  };

  /**
   * [LIFECYCLE]
   * Deve ser implementado esse metodo no componente.
   */
  onSalvarRetornoSucesso(resp) {}

  /**
   * [LIFECYCLE]
   * Deve ser implementado esse metodo no componente.
   */
  onSalvarRetornoErro(resp) {}

  /**
   * [LIFECYCLE]
   * Chamado quando o form é resetado ao valor padrão.
   */
  onResetaForm() {}

  /**
   * [LIFECYCLE]
   * Chamado antes do serviço enviar os dados para api.
   *
   * Entra o valor do formGroup definido e deve sair o objeto que a api espera.
   *
   * Essa função por usa vez limpa todas as propriedades que são nulas do form.
   *
   * Cuidado com campos multi select, eles podem ser um problema.
   */
  onTratarForm(form: any): any {
    return form;
  }

  /**
   * 
   */
  constructor(
    protected aplsRota: AplsTitle,
    public aplsUnload?: AplsUnload,
  ) {
    super(aplsRota);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.formCadastro) {
      // Pega valor padrão para o form para quando for necessario.
      if (!this.formValuePadrao) {
        this.formValuePadrao = JSON.parse(JSON.stringify(this.formCadastro.value));
      }

      // Serve como um inicializador do form também. Já que aqui fica o estado atual dos campos.
      this.onResetaForm();
    } else {
      if (!environment.production) {
        throw Error('Sua tela de cadastro não irá funcionar pois você não definou um valor para "formCadastro".');
      }
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Chamada para definir o valor padrão do form.
   *
   * Em vez de dar reset no form, pela função padrão do form group usamos essa.
   *
   * @param emitEvent Seu valor como true ira disparar evento de valueChanges para quem estive inscrito.
   */
  definirValorPadrao(emitEvent: boolean = false) {
    this.patchValue(this.formValuePadrao, {
      emitEvent: emitEvent
    });
    this.onResetaForm();
    if (this.controles.idRegistro) {
      this.controles.idRegistro = null;
    }
  }

  /**
   * Leva a tela para o estado de inserção.
   */
  btnResetarTela() {
    this.definirValorPadrao();

    if (!!this.formCadastro) {
      if (this.formCadastro.controls.hasOwnProperty('id')) {
        this.formCadastro.removeControl('id');
      }

      this.marcarFormGroupIntocado(this.formCadastro);
    }
    this.controles.teveAlteracao = false;
  }

  /**
   * Disponibiliza a função de save da tela.
   *
   * Pode ser chamada direto no template.
   */
  btnSalvar(): any {
    this.formCadastro.updateValueAndValidity();    
    
    if (!!this.formCadastro) {
      if (this.formCadastro.valid) {
        let form = this.tratarObjetoEnvio(this.formCadastro.getRawValue());

        // Verifica se o programador definiu o valor do servicoPrincipal
        if (!!this.servicoPrincipal) {
          // Chama loader que será removido pela classe http.
          this.servicoPrincipal(form)
            .pipe(debounceTime(400), map(formatarResponse))
            .subscribe((resp) => {              
              if (resp.erro === false && resp.mensagem && resp.tipoAlerta !== 'S') {
                this.tratarRetornoErro(resp);
              } else {
                this.tratarRetornoSucesso(resp);
              }
            });
        } else {
          if (!environment.production) {
            throw Error('É necessario definir o valor de "servicoPrincipal" para usar a função btnSalvar herdada.');
          }
        }
      } else {
        this.tratarRetornoErro({
          erro: true,
          mensagem: 'msg_form_invalido',
          tipoAlerta: 'A',
          mensagemCausa: null,
          objetoResposta: null,
          parametros: null
        });
      }
    } else {
      if (!environment.production) {
        throw Error('É necessario definir o valor de "formCadastro" para usar a função btnSalvar herdada.');
      }
    }
  }

  /**
   * Não contempla
   *  - Array de DTO. Um DTO deve pertencer a um objeto. Nunca um Array.
   * @param form
   */
  tratarObjetoEnvio(form: any) {
    // Clona desligando todas as referencias
    let formulario = JSON.parse(JSON.stringify(form));

    // Remove itens nulos
    for (const key in formulario) {
      if (formulario.hasOwnProperty(key) && formulario[key] == null) {
        delete formulario[key];
      }
    }

    // Remove itens extras dos itens DTO.
    // Remove apenas quando o DTO usa como chave ID.
    // Funcionario que usa como matricula essa função não pega.
    for (const key in formulario) {
      if (formulario.hasOwnProperty(key)) {
        if (formulario[key] instanceof Object && !(formulario[key] instanceof Array)) {
          if (!!formulario[key].id) {
            // Somentem os itens no root do objeto passam por aqui.
            formulario[key] = { id: formulario[key].id };
          }
        }
        if (formulario[key] instanceof Array) {
          formulario[key] = formulario[key].map(item => {
            for (const keyFormArray in item) {
              if (item.hasOwnProperty(keyFormArray)) {
                if (item[keyFormArray] instanceof Object && !(item[keyFormArray] instanceof Array)) {
                  if (!!item[keyFormArray].id) {
                    // É verificado todos os formArray que estão no root ojeto.
                    // Depois é verificado em cada objeto do form array se ele possui algum DTO.
                    item[keyFormArray] = { id: item[keyFormArray].id };
                  }
                }
              }
            }

            return item;
          });
        }
        if (formulario[key] === "") {
          formulario[key] = null;
        }
      }
    }

    return this.onTratarForm(formulario);
  }

  /**
   * É chamado quando a requisição http retorna com sucesso e a api retorna como sucesso.
   *
   * Dispara a função onSalvarRetornoSucesso que pode ser implementada no componente.
   *
   * @param resp Resposta padrão da apollus da api.
   */
  tratarRetornoSucesso(resp) {
    this.onSalvarRetornoSucesso(resp);

    if (!!this.formCadastro) {
      // Desmarca os campos
      this.marcarFormGroupIntocado(this.formCadastro);
    }

    /**
     * timeout sem tempo somente para tirar o processo da main thread até as outras funções serem executadas.
     */
    setTimeout(() => {
      // Como se mantem o registro de na tela o modo edição fica como true.
      this.controles.modoEdicao = true;
      this.controles.teveAlteracao = false;
      this.controles.modoVisualizacao = true;
      if (this.aplsUnload) this.aplsUnload.desbloqueia();
    });
  }

  /**
   * É chamado quando a requisição http retorna com sucesso e a api retorna como erro.
   *
   * Dispara a função onSalvarRetornoSucesso que pode ser implementada no componente.
   *
   * @param resp Resposta padrão da apollus da api.
   */
  tratarRetornoErro(resp) {
    this.onSalvarRetornoErro(resp);

    if (this.formCadastro) {
      this.marcarFormGroupTocado(this.formCadastro);
    }
    
    this.controles.voltaListaQuandoSalvar = false;
  }

  afterModoEdicao() {
    setTimeout(() => {
      // Confirma que não teve alteração no form. É necessario até que o angular permita desabilitar eventos para formArray.
      // https://github.com/angular/angular/issues/23336
      this.controles.teveAlteracao = false;
      this.controles.modoVisualizacao = true;
      this.controles.estado = 'visualizacao';
      this.aplsUnload.desbloqueia();
    })
  }
  
  /**
   * Faz patchValue em campos comuns e cria form control para form array.
   * @param entrada Objeto resposta.
   * @param opcoes Flags do AbstractControl.
   */
  patchValue(
    entrada: any,
    opcoes?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void {
    // Define o valor para os campos FormControl
    this.formCadastro.patchValue(entrada, opcoes);

    // Define o valor para os campos FormArray
    for (const item in this.formCadastro.controls) {
      if (this.formCadastro.controls[item] instanceof FormArray) {
        if (entrada.hasOwnProperty(item) && entrada[item] instanceof Array) {
          const element = this.formCadastro.controls[item] as FormArray;

          // Limpa form array
          while (element.length > 0) {
            element.removeAt(0);
          }

          // Insere nova lista
          entrada[item].map(record => {
            let form = new FormGroup({});

            for (const key in record) {
              form.addControl(key, new FormControl(record[key]));
            }

            element.push(form);
            return form;
          });
        }
      }
    }
  }
}
