import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ImageToDataService {

    constructor() {
    }

    public convertToImageData(image: HTMLImageElement): ImageData | null {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, image.width, image.height);
        }
        return null;
    }
}
