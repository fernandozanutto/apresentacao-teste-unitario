export class AplsInputFileService {
  fileInput;
  callback;

  constructor(public accept: string) {
    // Cria e configura um elemento input
    this.fileInput = document.createElement('input');
    this.fileInput.setAttribute('type', 'file');
    this.fileInput.setAttribute('accept', accept);
    this.fileInput.addEventListener('change', this.onChange.bind(this));
  }

  /**
   * Função para abrir modal de seleção de arquivo.
   * @param  origin This da classe que guarda o callback.
   * @param  fn Função que será executada como callback.
   */
  open(fn: (value: any) => void) {
    if (this.fileInput) {
      this.callback = fn;
      this.fileInput.click();
    }
  }

  onChange($event) {
    this.callback(this.fileInput.files);
  }
}
