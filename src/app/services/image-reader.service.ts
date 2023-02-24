import {Injectable} from '@angular/core';
import {map, mergeMap, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageReaderService {

  public getImageData(file: Blob): Observable<HTMLImageElement> {
    return new Observable<string | ArrayBuffer>((subscriber) => {
        const errorCar = (error: string) => `Image reading failed ${error}`;
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (fileReader.result) {
            subscriber.next(fileReader.result);
          } else {
            subscriber.error(errorCar(fileReader.error?.message + ''));
          }
        };
        fileReader.onerror = err => subscriber.error(errorCar('Reading error'));
        fileReader.onabort = err => subscriber.error(errorCar('Reading abort'));
        fileReader.onloadend = err => subscriber.complete();
        fileReader.readAsDataURL(file);
      },
    )
      .pipe(
        mergeMap(
          result => {
            return new Observable<HTMLImageElement>(subscriber => {
              let image = new Image();
              image.src = result.toString();
              image.onload = () => {
                subscriber.next(image);
                subscriber.complete();
              };
              image.onerror = (error) => {
                subscriber.error('Wrong file format provided');
              };
            });
          },
        ),
      );
  }
}
