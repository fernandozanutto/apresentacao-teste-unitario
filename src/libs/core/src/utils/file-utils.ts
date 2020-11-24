/**
 * @author Karan Alves Pereira
 * @since 08/04/2019
 */

import { Injectable } from '@angular/core';

/**
 * Classe utilitária de arquivo
 */
@Injectable({
  providedIn: 'root'
})
export class FileUtils {
  /**
   * Baixa o arquivo de acordo com os parâmetros enviados.
   *
   * @param arquivoByteArray - Arquivo em Base64.
   * @param nomeArquivo - Nome de saida do Arquivo
   *
   * Exemplo de Uso: this.fileUtils.baixarArquivo(response.objetoResposta, 'relatorio_ficha_entrega.PDF');
   */
  public baixarArquivo(arquivoByteArray: string, nomeArquivo: string) {
    var byteString = atob(arquivoByteArray);
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var uintArray = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    var fileDownload = window.document.createElement('a');
    fileDownload.href = window.URL.createObjectURL(new Blob([arrayBuffer], { type: 'application/octet-stream' }));
    fileDownload.download = nomeArquivo;

    // Append anchor to body.
    document.body.appendChild(fileDownload);
    fileDownload.click();

    // Remove anchor from body
    document.body.removeChild(fileDownload);
  }
}
