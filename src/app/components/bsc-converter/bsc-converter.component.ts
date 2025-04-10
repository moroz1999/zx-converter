import {Component} from '@angular/core';
import {PaletteReducerService} from '../../services/palette/palette-reducer.service';
import {DownloadGeneratorService} from '../../services/download-generator.service';
import {ImageToDataService} from '../../services/image-to-data.service';
import {Observable, tap} from 'rxjs';
import {BorderReaderService} from '../../services/border-reader.service';

@Component({
    selector: 'bsc-converter',
    templateUrl: './bsc-converter.component.html',
    styleUrls: ['./bsc-converter.component.scss'],
})
export class BscConverterComponent {

    public converted = false;
    public fileName = 'converted.chr$';
    public error?: string;
    public width = 0;
    public height = 0;

    public screenBytes?: ArrayBuffer;
    public borderImageData?: ImageData;
    public imageData?: ImageData;

    constructor(
        private paletteReducerService: PaletteReducerService,
        private downloadGeneratorService: DownloadGeneratorService,
        private imageToDataService: ImageToDataService,
        private borderReaderService: BorderReaderService,
    ) {
    }

    public screenLoaded(observable: Observable<ArrayBuffer>) {
        observable
            .pipe(tap(screenBytes => {
                if (screenBytes.byteLength !== 6912) {
                    throw new Error('Screen file size should be 6912');
                }
            }))
            .subscribe(screenBytes => this.screenBytes = screenBytes);
    }

    public screenFileName(fileName: string) {
        this.fileName = fileName.split('.').slice(0, -1).join('.') + '.bsc';
    }

    public imageLoaded(imageElement: Observable<HTMLImageElement>) {
        imageElement.pipe(tap(imageElement => {
            if ((imageElement.width !== 384) || (imageElement.height !== 304)) {
                throw new Error('Border image dimensions should be 384*304');
            }
        })).subscribe({
                next: imageElement => {
                    this.width = imageElement.width;
                    this.height = imageElement.height;
                    this.converted = false;
                    this.error = undefined;
                    this.borderImageData = this.imageToDataService.convertToImageData(imageElement) ?? undefined;
                    this.imageData = this.borderImageData;
                },
                error: error => this.error = error,
            },
        );
    }

    public get loaded(): boolean {
        return !!(this.borderImageData);
        // return !!(this.screenBytes && this.borderImageData);
    }

    public convertImage() {
        if (this.borderImageData) {
            this.converted = true;
            this.imageData = this.paletteReducerService.reducePalette(this.borderImageData);

        }
    }

    public saveImage() {
        if (this.imageData && this.screenBytes) {
            const borderBytes = this.borderReaderService.parseBorder(this.imageData);
            const resultBytes = new Uint8Array(this.screenBytes.byteLength + borderBytes.byteLength);
            resultBytes.set(new Uint8Array(this.screenBytes));
            resultBytes.set(borderBytes, this.screenBytes.byteLength);
            this.downloadGeneratorService.attemptDownload(resultBytes, this.fileName);
        }
    }
}

