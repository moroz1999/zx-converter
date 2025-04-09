import {Component} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {PaletteReducerService} from '../../services/palette-reducer.service';

@Component({
    selector: 'sca-converter',
    templateUrl: './sca-converter.component.html',
    styleUrls: ['./sca-converter.component.scss'],
})
export class ScaConverterComponent {
    public converted = false;
    public fileName = 'converted.chr$';
    public error?: string;
    public width = 0;
    public height = 0;
    public frames: [] | null = null;
    public constructor(
        // is it needed?
        private gifParserService: GifParserService,
    ) {}
    public imageLoaded(imageElement: Observable<HTMLImageElement>) {
        imageElement
            .pipe(tap(imageElement => {
                if ((imageElement.width !== 384) || (imageElement.height !== 304)) {
                    throw new Error('Border image dimensions should be 384*304');
                }
            }))
            .subscribe({
                    next: imageElement => {
                        this.width = imageElement.width;
                        this.height = imageElement.height;
                        this.converted = false;
                        this.error = undefined;
                        // this.borderImageData = this.imageToDataService.convertToImageData(imageElement) ?? undefined;
                        // this.imageData = this.borderImageData;
                    },
                    error: error => this.error = error,
                },
            );
    }


    public get loaded(): boolean {
        return this.frames === null;
    }
}
