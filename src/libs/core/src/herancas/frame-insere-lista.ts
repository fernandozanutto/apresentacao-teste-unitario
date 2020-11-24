import { EventEmitter, isDevMode, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { AplsTableDataSource, AplsModal } from '@apollus-ngx/orfeu';
import { Subscription } from 'rxjs';

import { Constructor } from './constructor';
import { RESETA_TELA, POPULA_LISTAS } from './tela-cadastro';
import { dataForm } from '../utils';
import { UNLOAD_BLOQUEIA } from '../unload';
import { environment } from '@apollus/environments';
import { ApollusException } from '../exception/apollus-exception';
import { TranslateService } from '@ngx-translate/core';

/**
 * Não se perca nos form's.
 *
 * Existem varios form's nessa classe e cada um é responsavel por um trabalho diferente.
 * Mais abaixo na classe eu explico cada um também, mas aqui vai um resumo.
 *
 * formBuilder            = Você vai importar no constructor da sua classe. "public formBuilder: FormBuilder"
 * formFrame              = O form que fica em cima do grid, usado para fazer uma adição no grid.
 * objetoPadraoFormFrame  = Não é um form, só salva o valor que gerar um FormGroup.(Objeto construtor)
 * valorInicialFormFrame  = Não é um form, é somente o valor inicial do formFrame.(Valor quando campo é zerado)
 * formCadastro           = Esse é o form dentro da TelaCadastro(formPrincipal).
 * formCadastroListaFrame = Esse é o formArray dentro do formCadastro da TelaCadastro.
 * formGridFiltro         = Form que será utilizado para fazer filtro no grid.
 */
export interface FrameInsereLista {
  formBuilder: FormBuilder;
  formCadastro: FormGroup;
  formCadastroListaFrame: FormArray;
  formFrame: FormGroup;
  formGridFiltro: FormGroup;
  objetoPadraoFormFrame: any;
  colunasVisiveis: String[];
  colunasTamanho: any;
  lbArea1: string;
  lbArea2: string;
  dataSource: AplsTableDataSource<Array<any>>;
  controles: any;
  linhaEdicao: any;
  marcarFormGroupTocado: Function;
  marcarFormGroupIntocado: Function;
  evtResetaForm: EventEmitter<any>;
  valorInicialFormFrame: any;
  inicializarFrame(): void;
  ngOnInit(): void;
  ngOnDestroy(): void;
  inicializarRegras(form: FormGroup): void;
  builderForm(): FormGroup;
  btnAdicionarLinha(): void;
  btnSalvarEdicao(): void;
  salvarEdicao(): void;
  btnFiltrarGrid(): void;
  btnEditarLinha(linhaWapper: any, linha?: any): void;
  btnExcluirLinha($event: Event, linha: any): void;
  btnResetar(): void;
  filtrarPorDescricao(a: any, b: any): boolean;
  compararPorID(a: any, b: any): boolean;
  filtrarArea(a: any, b: any): boolean;
  trataErroValidacao(): void;
  checaEdicao(flag?: boolean): any;
  onErroValidacao(): void;
  onIniciaEdicao(): void;
  onFinalizaEdicao(): void;
  onResetaForm(): void;
  populaDataSource(): void;
}

/**
 * Essa classe é a abstração da tab dentro das telas de cadostro.
 * Todas tabs que possuem um cabeçalho de inserção e um grid para esse itens ainda locais.
 */
export function adicionaInsereLista<T extends Constructor<{}>>(base: T): Constructor<FrameInsereLista> & T {
  return class extends base {
    /**
     * [IMPORTANTE]
     *
     * DEVE ser definido na classe que irá extender.
     */
    formBuilder: FormBuilder;

    /**
     * [IMPORTANTE]
     * Guarda o objeto responsavel por dar o create no formFrame.
     *
     * DEVE ser definido na classe que irá extender.
     */
    objetoPadraoFormFrame: any;

    /**
     * Define qual campos estarão visiveis.
     *
     * DEVE ser definido na classe que irá extender.
     */
    colunasVisiveis: String[];

    /**
     * Define todas as colunas disponiveis para o campo.
     *
     * DEVE ser definido na classe que irá extender.
     */
    colunasTamanho: any;

    /**
     * Form que será usado para filtrar o grid.
     *
     * Só sera usado quando tiver filtro para o grid.
     *
     * DEVE ser definido na classe que irá extender quando necessario.
     */
    formGridFiltro;

    /**
     * Guarda o valor padrão do form. É salvo no onInit.
     */
    valorInicialFormFrame: any;

    /**
     * Guarda o FormArray da tela principal.
     *
     * DEVE ser definido na classe que irá extender.
     */
    formCadastroListaFrame: FormArray;

    /**
     * Form que será usado para interar o grid.
     */
    formFrame: FormGroup;

    /**
     * Deve ser importado pelo componente.
     */
    aplsModal: AplsModal;

    /**
     * Deve ser importado pelo componente.
     */
    viewContainerRef: ViewContainerRef;

    /**
     * Guarda o ViewChild do componenet de botão do grid.
     */
    botoes;

    /**
     * Guarda valor do grid.
     */
    dataSource = new AplsTableDataSource([]);

    /**
     * Disparado sempre que o form for resetado aqui dentro.
     *
     * Pode ser disparado pelo componente também.
     */
    evtResetaForm = new EventEmitter();

    /**
     * Guarda a referencia da inscrição de um evento para ser desinscrito depois.
     */
    evtResetaTelaCadastro: Subscription;

    /**
     * Guarda a referencia da inscrição de um evento para ser desinscrito depois.
     */
    evtPopulaListaTelaCadastro: Subscription;

    /**
     * Guarda a linha que está recebendo alteração.
     */
    linhaEdicao;

    /**
     * Fica ouvindo o change do form principal responsavél pelo cadastro no grid.
     */
    onAlteracaoForm: Subscription;

    /**
     * Nessa propriedade voce pode inserir o nome de todas as propriedades que não teram
     * sua inscrição checada.
     */
    blackListSubscribes = [];

    lbArea1 = (<any>window).lbArea1;

    lbArea2 = (<any>window).lbArea2;

    translate: TranslateService;

    /**
     * Controla os estados possiveis para a tab.
     *
     * Pode receber novas propriedades em tempo de execução.
     *
     * Parte de permissões ainda precisa ser implementada. Porem deve ser populada aqui.
     */
    controles = {
      teveAlteracao: false,
      modoEdicao: false,
      filtroGrid: false,
      permissoes: {
        cadastro: false,
        edicao: false,
        visualizacao: false
      }
    };

    /**
     * Vai ser populado via input do component.
     */
    get formCadastro(): FormGroup {
      return this._formCadastro;
    }
    set formCadastro(value: FormGroup) {
      this._formCadastro = value;
    }
    private _formCadastro: FormGroup;

    /**
     * [lifecycle]
     * Disparado quando o form precisa voltar para o estado inicial.
     */
    onResetaForm: () => {};

    /**
     * [lifecycle]
     * Disparado quando um item foi inserido.
     */
    onAdicinaNovo: () => {};

    /**
     * [lifecycle]
     * Disparado quando um item começou a ser editado.
     */
    onIniciaEdicao: () => {};

    /**
     * [lifecycle]
     * Disparado quando um item deixa de ser a ser editado.
     */
    onFinalizaEdicao: () => {};

    /**
     * [lifecycle]
     * Disparado quando quando editou o item com sucesso.
     */
    onSalvaEdicaoSucesso: () => {};

    /**
     * [lifecycle]
     * Disparado quando existe erro ao inserir ou editar.
     */
    onErroValidacao() {}

    constructor(...args: any[]) {
      super(...args);

      this.checaResetaTela();
    }

    ngOnInit() {
      this.populaDataSource();
    }

    ngOnDestroy() {
      // Pesquisa nas propriedade se tem alguem inscrito em algum evento.
      for (let prop in this) {
        const property = <any>this[prop];
        if (this.blackListSubscribes.indexOf(prop) !== -1) {
          if (property && typeof property.unsubscribe === 'function') {
            property.unsubscribe();
          }
        }
      }
    }

    /**
     * Responsavel por iniciar os itens dessa classe.
     *
     * Construir o form para a tela.
     *
     * Descobrir valor padrão para o form ser resetado depois.
     *
     * [IMPORTANTE] Use-me na ultima linha dentro do constructor da classe extende.
     */
    inicializarFrame() {
      this.formFrame = this.builderForm();

      if (this.valorInicialFormFrame) {
        this.formFrame.patchValue(this.valorInicialFormFrame);
      } else {
        this.valorInicialFormFrame = JSON.parse(JSON.stringify(this.formFrame.value));

        for (const key in this.objetoPadraoFormFrame) {
          if (!this.valorInicialFormFrame.hasOwnProperty(key)) {
            this.valorInicialFormFrame[key] = null;
          }
        }
      }

      this.inicializarRegras(this.formFrame);

      if (this.formGridFiltro) {
        this.formGridFiltro.valueChanges.subscribe(input => {
          this.controles.filtroGrid = true;
        });
      }
    }

    /**
     * Aqui é feito inscrição em dois eventos que controlão o estado do frame.
     *
     * RESETA_TELA Faz o frame ir para o estado inicial.
     *
     * POPULA_LISTAS Clona o formArray do cadastro no dataSource.
     */
    checaResetaTela() {
      this.evtResetaTelaCadastro = RESETA_TELA.subscribe(() => {
        /**
         * Caso formCadastroListaFrame não tenha valor defino ainda signica que o desenvolvedor não chamou o onInit e com isso vai dar um loop infinito.
         *
         * Ou então o RESETA_TELA tela foi chamado pela classe pai TelaCadastro antes que todos componentes filhos pudessem ser renderizados.
         */
        if (!this.formCadastroListaFrame) {
          setTimeout(() => RESETA_TELA.emit(), 200);
          return false;
        }

        // Reseta form filtro do grid
        if (this.formGridFiltro) {
          this.formGridFiltro.reset({}, { onlySelf: true, emitEvent: false });
        }
        // Limpa forma de inserção do frame.
        this.formFrame.patchValue(this.valorInicialFormFrame, { onlySelf: true, emitEvent: false });
        if (this.onResetaForm) this.onResetaForm();
        this.marcarFormGroupIntocado(this.formFrame);

        // Limpa o grid
        this.dataSource.data = [];

        // Limpa form array
        while (this.formCadastroListaFrame.length > 0) {
          this.formCadastroListaFrame.removeAt(0);
        }

        // Resta controles da tela async.
        setTimeout(() => {
          this.controles.teveAlteracao = false;
          this.controles.modoEdicao = false;
          this.controles.filtroGrid = false;
          this.formCadastroListaFrame.setErrors(null);
        }, 200);
      });

      this.evtPopulaListaTelaCadastro = POPULA_LISTAS.subscribe(() => {
        this.populaDataSource();
      });
    }

    /**
     * Copia os itens do formArray para o dataSource que está linkado ao grid.
     */
    populaDataSource() {
      if (this.formCadastroListaFrame && this.formCadastroListaFrame.value instanceof Array) {
        let lista = this.formCadastroListaFrame.controls.map(form => {
          let novaLinha = JSON.parse(JSON.stringify(form.value));
          novaLinha[dataForm] = form;

          return novaLinha;
        });

        this.dataSource.data = lista;
      }
    }

    /**
     * Inicia as regras do frame.
     *
     * Regras dinamicas da tela.
     */
    inicializarRegras(form: FormGroup) {
      if (this.onAlteracaoForm) {
        this.onAlteracaoForm.unsubscribe();
      }

      // Se inscreve no change do form recem gerado.
      // Cuidado, esse cara é chamado quando o statusChange tbm é chamado.
      this.onAlteracaoForm = form.valueChanges.subscribe(input => {
        if (this.formCadastroListaFrame) {
          this.controles.teveAlteracao = true;
          this.formCadastroListaFrame.setErrors({ filho_em_alteracao: true });
          UNLOAD_BLOQUEIA.emit();
        }
      });
      this.controles.teveAlteracao = false;

      if (this.onResetaForm) this.onResetaForm();
    }

    /**
     * [IMPORTANTE]
     *
     * Constroi o form para a tela e dispara uma função que se inscreve no seu value changes.
     */
    builderForm() {
      if (this.formBuilder && this.objetoPadraoFormFrame) {
        return this.formBuilder.group(this.objetoPadraoFormFrame);
      } else {
        if (!environment.production) {
          if (this.formBuilder) throw new Error('É necessario importar FormBuilder.');

          if (this.objetoPadraoFormFrame) throw new Error('É necessario informar o "objetoPadraoFormFrame".');
        }
      }
    }

    /**
     * Reseta o form de inserção independente se for adição ou edição.
     *
     * Só fica disponivel quando há itens para limpar.
     */
    btnResetar() {
      this.formFrame.patchValue(this.valorInicialFormFrame);
      if (this.onResetaForm) this.onResetaForm();
      if (this.controles.modoEdicao && this.onFinalizaEdicao) {
        this.onFinalizaEdicao();
      }
      this.evtResetaForm.emit(null);
      this.controles.modoEdicao = false;
      this.marcarFormGroupIntocado(this.formFrame);
      // Em alguns casos garante que o controle será falso no init.
      setTimeout(() => {
        this.controles.teveAlteracao = false;
        this.formCadastroListaFrame.setErrors(null);
      });
    }

    /**
     * Disponivel para ser chamado via template.
     * @param linha Record que será editado.
     */
    btnEditarLinha(linhaWapper: any, linha?: any) {
      if (this.checaEdicao()) {
        this.controles.modoEdicao = true;
        this.controles.teveAlteracao = true;
        UNLOAD_BLOQUEIA.emit();

        this.linhaEdicao = linhaWapper;
        this.formFrame.patchValue(linha || linhaWapper);

        if (this.onIniciaEdicao) this.onIniciaEdicao();
      }
    }

    /**
     * Salva adição.
     */
    btnAdicionarLinha() {
      if (this.formFrame.valid) {
        let formFrame = this.builderForm();
        formFrame.patchValue(this.formFrame.getRawValue());

        formFrame.value[dataForm] = formFrame;
        this.formCadastroListaFrame.push(formFrame);
        this.dataSource.data = [...this.dataSource.data, formFrame.value];

        this.btnResetar();
        if (this.onAdicinaNovo) this.onAdicinaNovo();
      } else {
        this.trataErroValidacao();
      }
    }

    /**
     * Salva item em edição.
     */
    btnSalvarEdicao() {
      if (this.formFrame.valid) {
        this.salvarEdicao();
      } else {
        this.trataErroValidacao();
      }
    }

    salvarEdicao() {
      if (this.linhaEdicao) {
        let keyLista = [...Object.keys(this.linhaEdicao), ...Object.keys(this.formFrame.controls)];
        let formControlNoArray = this.linhaEdicao[dataForm] as FormGroup;

        // Garante que a propriedade id não será perdida entre a edição e o save da tela.
        if (!!this.linhaEdicao.id && !this.formFrame.controls.hasOwnProperty('id')) {
          // Quando o form não tem id ainda nos controles significa que ele foi populado via cadastro.
          // Na primeira repetição que não tiver o controle id aficionado, é realizado a criação e adição dele.
          this.formFrame.addControl('id', new FormControl(this.linhaEdicao.id));
        } else if (!this.linhaEdicao.id && this.formFrame.controls.hasOwnProperty('id')) {
          // Possivel codigo morto, só garante que não tera um controle sem valor acidentalmente.
          this.formFrame.removeControl('id');
        }

        for (const key of keyLista) {
          // Verifica se tem um controle
          if (this.formFrame.controls.hasOwnProperty(key)) {
            let item = this.formFrame.get(key).value;

            /**
             * Caso seja um array ele deve retornar apenas um item para o campo.
             * Só existe para evitar erros.
             */
            let multiplo = item instanceof Array && item.length > 0 ? item[0] : item;
            let valorFinal = item instanceof Array ? multiplo : item;

            /**
             * Quando o formArray é populado em edição:
             *
             * Como o patchValue para formArray é dinamico, quando um usuario não preenche um campo, ele não é criado no controle que
             * fica na lista.
             *
             * Nesse momento o codigo testa se o usuario preencheu um campo que não tinha ainda no form da lista para cria-lo.
             *
             * O id não passa aqui pois ele não existe no controle do form do frame. E esse tratamento é para o form da lista.
             */
            if (!formControlNoArray.controls.hasOwnProperty(key)) {
              formControlNoArray.addControl(key, new FormControl());
            }
            let controle = formControlNoArray.get(key);

            // Evita que sejá feita alteração quando valores não sofream alteração.
            // Não é eficaz com tipos que não sejam primitivos.
            if (this.linhaEdicao[key] != valorFinal || controle.value != valorFinal) {
              this.linhaEdicao[key] = valorFinal;
              controle.patchValue(this.linhaEdicao[key]);
              controle.setErrors(null); //Necessário para resolver a questão do email - karan
            }
          } else {
            // Esse código será executado se o campo existia e foi limpo na edição.
            // Garante também que o programador não vai adicionar um valor sem controle(Isso é um erro de desenvolvimento, todo valor precisa de um controle).
            this.linhaEdicao[key] = null;
          }
        }

        this.btnResetar();
        if (this.onSalvaEdicaoSucesso) this.onSalvaEdicaoSucesso();
      }
    }

    /**
     * Exclui item do grid.
     * @param $event Evendo nativo do javascript. Só colocar $event no HTML que o angular já sabe quem deve ser.
     * @param linha Record que será excluido.
     */
    btnExcluirLinha($event, linha) {
      if (this.checaEdicao(false)) {
        this.aplsModal.popup($event.target as ElementRef, {
          titulo: this.translate.instant('label.atencao'),
          mensagem: this.translate.instant('mensagem.deseja_realmente_excluir'),
          tipo: 'A',
          botoes: [
            {
              nome: this.translate.instant('label.cancelar'),
              color: 'light'
            },
            {
              nome: this.translate.instant('label.excluir'),
              handler: () => {
                let index = this.dataSource.data.findIndex(item => item === linha);
                let formIndex = this.formCadastroListaFrame.at(index);

                if (this.dataSource.data[index][dataForm] === formIndex) {
                  this.formCadastroListaFrame.removeAt(index);
                  this.dataSource.remove(index);
                  this.onConfirmadoExcluido();
                }
              }
            }
          ]
        });
      }
    }

    onConfirmadoExcluido() {}

    /**
     * Verifica se já exisate um item em edição.
     */
    checaEdicao(testNovo = true): boolean {
      if (this.aplsModal) {
        if (this.controles.modoEdicao) {
          throw new ApollusException(this.translate.instant('mensagem.form_cadastro_andamento'));
        }

        if (testNovo && this.controles.teveAlteracao) {
          throw new ApollusException(this.translate.instant('mensagem.form_cadastro_andamento'));
        }

        return true;
      } else {
        if (!environment.production) {
          throw new Error('As mensagens automaticas não estão sendo exibidas pois você não importou o AplsModal no seu componente.');
        }
      }
    }

    trataErroValidacao() {
      this.marcarFormGroupTocado(this.formFrame);
      if (this.aplsModal) {
        this.aplsModal.toast(this.translate.instant('mensagem.form_invalido'), 'A');
      }

      if (this.onErroValidacao) this.onErroValidacao();
    }

    /**
     * Adiciona o item que servirá de filtro para o grid.
     */
    btnFiltrarGrid() {
      this.dataSource.filter = this.formGridFiltro.value;
    }

    /**
     * Botão de limpar para o filtro.
     */
    btnLimparFiltroGrid() {
      this.formGridFiltro.reset();
      this.dataSource.filter = this.formGridFiltro.value;
      this.controles.filtroGrid = false;
    }

    /**
     * Filtra select com filtro personalizado.
     * @param a Record, item, linha. Opção de um select.
     * @param b Texto de filtro.
     */
    filtrarPorDescricao = (a: any, b: any): boolean => {
      if (!b) {
        return true;
      }
      return a.descricao.toLowerCase().indexOf(b.toLowerCase()) != -1;
    };

    /**
     * Busca qual item esta marcado para exibição.
     * Considerando a chave ID.
     * @param a Record, item, linha. Opção de um select.
     * @param b Valor setado.
     */
    compararPorID = (a: any, b: any): boolean => {
      if (!b) {
        return false;
      }

      return a.id == b.id;
    };

    filtrarArea(item: any, filtro: any): boolean {
      if (!filtro) {
        return true;
      }

      return item.descricao.toLowerCase().indexOf(filtro.toLowerCase()) !== -1;
    }

    // Marca campo por campo do form
    marcarFormGroupTocado(formGroup: FormGroup) {
      (<any>Object).values(formGroup.controls).forEach(control => {
        control.markAsTouched();

        if (control.controls) {
          control.controls.forEach(c => this.marcarFormGroupTocado(c));
        }
      });
    }

    // Desmarca campo por campo do form
    marcarFormGroupIntocado(formGroup: FormGroup) {
      (<any>Object).values(formGroup.controls).forEach(control => {
        control.markAsUntouched();

        if (control.controls) {
          control.controls.forEach(c => this.marcarFormGroupIntocado(c));
        }
      });
    }
  };
}
