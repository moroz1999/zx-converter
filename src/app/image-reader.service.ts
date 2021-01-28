import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ImageDataInterface} from './image-data-interface';

@Injectable({
  providedIn: 'root'
})
export class ImageReaderService {

  getImageData(file: Blob): Observable<ImageDataInterface> {
    return new Observable((observer) => {
      new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
      }).then(
        function (result: any) {
          let image = new Image();
          new Promise((resolve) => {
            image.src = result.toString();
            image.onload = resolve;
          }).then(() => {
              let imageData = {
                'width': image.width,
                'height': image.height,
                'image': image
              };
              observer.next(imageData);
              observer.complete();
            }
          );
        }
      );
    });

  }
}
