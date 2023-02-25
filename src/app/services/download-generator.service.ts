import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadGeneratorService {

  constructor() {
  }

  public attemptDownload(bytes: Uint8Array, fileName: string) {
    let dataUrl = 'data:application/octet-stream;base64,' + btoa(DownloadGeneratorService.uint8ToString(bytes));

    const element = document.createElement('a');
    element.setAttribute('href', dataUrl);
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
  private static uint8ToString(buf: Uint8Array): string {
    let i, length, out = '';
    for (i = 0, length = buf.length; i < length; i += 1) {
      out += String.fromCharCode(buf[i]);
    }
    return out;
  }

}
