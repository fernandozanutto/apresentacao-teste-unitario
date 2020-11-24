import { Component, ContentChild, Input, AfterContentInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

import { AplsInputFileDirective } from './file.directive';

/**
 * Display será o valor que ficará visivel para o usuário.
 * Value é o oq será setado no form control.
 */
export interface FileReturn {
  display: String;
  value: any;
}

@Component({
  selector: 'apls-input-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'form-group',
    '[class.input-disabled]': 'disabled',
    'attr.type': 'file'
  }
})
export class AplsInputFileComponent implements AfterContentInit {
  /**
   * IMPORTANTE
   *
   * Deve ser passado uma função nesse input. EX: <apls-input-file [processFile]="nomeDaFuncao">
   *
   * Essa função deve retorna uma Promise para funcionar.
   */
  @Input() processFile: { exec: Function };

  @Input() label = '';

  // Emite evento quando o usuario solicitar a abertura do arquivo.
  @Output() evtOpenFile = new EventEmitter();

  @Output() uploadCompleted: EventEmitter<string> = new EventEmitter<string>();

  // Recupera o input dentro do ng-content
  @ContentChild(AplsInputFileDirective) input: AplsInputFileDirective;
  // Essa propriedade mantem salva o elemento de input responsavel por abrir o dialog do sistema operacional.
  private fileInput: HTMLInputElement;

  // Registra quando o input esta desabilitado
  disabled = false;

  /**
   * Registra se tem arquivo selecionado.
   *
   * Essa propriedade é importante pro template.
   */
  hasFile = false;

  width = null;

  ngAfterContentInit() {
    if (!!this.input) {
      this.setWidth();

      var observer = new MutationObserver(mutationsList => {
        for (var mutation of mutationsList) {
          if (mutation.type == 'attributes' && mutation.attributeName == 'disabled') {
            this.setWidth();
          }
        }
      });
      observer.observe(this.input.nativeElement, {
        attributes: true,
        childList: false,
        subtree: false
      });
      this.create();
      // Ouve o click em cima do campo de input para executar a função de click do input file local.
      this.input.nativeElement.addEventListener('click', this.btnOpenDialog.bind(this));

      if (this.input.ngControl) {
        // Se inscreve no status change para checar o valor da propriedade disabled.
        this.input.ngControl.statusChanges.subscribe(d => {
          this.disabled = this.input.disabled;
        });

        // Ouve se o input recebeu valor novo para setar no template.
        this.input.ngControl.valueChanges.subscribe(d => {
          this.hasFile = !!this.input.value;
        });
      }

      // Executa logo que inicia o content para pegar o status setado na construção do formControl.
      this.disabled = this.input.disabled;
      this.hasFile = !!this.input.value;
    }
  }

  setWidth() {
    if (this.input.nativeElement.clientWidth > 0) {
      this.width = this.input.nativeElement.clientWidth;
    }
  }

  create() {
    // Cria e configura um elemento input
    this.fileInput = document.createElement('input');
    this.fileInput.setAttribute('type', 'file');
    this.fileInput.addEventListener('change', this.onChange.bind(this));
    if (this.input && this.input.accept) {
      this.fileInput.setAttribute('accept', this.input.accept);
    }
  }

  // Responsavel por realizar o click no input file que por sua vez irá abrir o dialog do sistema operacional.
  btnOpenDialog() {
    if (!this.input.disabled && !this.disabled) {
      this.fileInput.click();
    }
  }

  // Dispara o evento para abrir o arquivo. É necessario ouvir esse evento e executar a rotina fora desse componente.
  btnOpenFile() {
    this.evtOpenFile.emit(this.input.value);
  }

  // Remove a seleção do arquivo.
  cancel() {
    if (!this.input.disabled && !this.disabled) {
      this.populaValor(null, false);
    }
  }

  // Quando o elemento salvo em `fileInput` receber o change essa função será executada.
  onChange() {
    // Verifica se tem o Input `processFile` para tratar os arquivos selecionados.
    if (!!this.processFile) {
      if (this.input.ngControl) this.input.ngControl.control.setErrors({ request: true });
      this.disabled = true;
      this.input.nativeElement.value = 'Enviando arquivo...';
      this.processFile
        .exec(this.fileInput.files, this.input.accept)
        .then((file: string) => {
          this.populaValor(file, true);
          this.create();
        })
        .catch(() => {
          this.populaValor(null, false);
          this.create();
        });
    } else {
      throw new Error('"processFile" is required for input file.');
    }
  }

  populaValor(valor, status) {
    if (this.input.ngControl) {
      this.input.ngControl.control.setErrors(null);
      this.input.ngControl.control.setValue(valor);
    }
    this.input.nativeElement.value = valor;
    // this.fileInput.value = valor;
    this.hasFile = status;
    this.disabled = false;

    this.uploadCompleted.emit(valor);
  }
}
