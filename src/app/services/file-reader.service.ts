import {Injectable} from '@angular/core';
import {mergeMap, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileReaderService {

  public getFileContents(file: Blob): Observable<ArrayBuffer> {
    return new Observable<ArrayBuffer>((subscriber) => {
        const errorCar = (error: string) => `File reading failed ${error}`;
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (fileReader.result) {
            subscriber.next(fileReader.result as ArrayBuffer);
          } else {
            subscriber.error(errorCar(fileReader.error?.message + ''));
          }
        };
        fileReader.onerror = err => subscriber.error(errorCar('Reading error'));
        fileReader.onabort = err => subscriber.error(errorCar('Reading abort'));
        fileReader.onloadend = err => subscriber.complete();
        fileReader.readAsArrayBuffer(file);
      },
    );
  }
}
