import {Component} from '@angular/core';
import {Observable, tap, switchMap, of} from 'rxjs';
import {GifParserService} from './gif-parser.service';
import {ScaMode} from './sca-mode';
import {ScaGeneratorService} from './sca-generator.service';
import {ParsedFrame} from './parsed-frame';
import {ParsedFrames} from './parsed-frames';
import {ScaTypeForMode} from './mode-to-type-map';
import {Sca} from './sca';

@Component({
    selector: 'sca-converter',
    templateUrl: './sca-converter.component.html',
    styleUrls: ['./sca-converter.component.scss'],
})
export class ScaConverterComponent {
    public converted = false;
    public fileName = 'converted.sca';
    public error?: string;
    public width = 0;
    public height = 0;
    public frames: ParsedFrame[] | null = null;
    public convertedData: Uint8Array | null = null;

    public gifImageElement: null | HTMLImageElement = null;

    private mode = ScaMode.MODE_0;
    private mode0Width = 256;
    private mode0Height = 192;

    public constructor(
        private gifParserService: GifParserService,
        private scaGeneratorService: ScaGeneratorService,
    ) {
    }

    public imageLoaded(imageElement$: Observable<HTMLImageElement>) {
        imageElement$
            .pipe(
                tap(imageElement => {
                    this.gifImageElement = imageElement;
                    if (this.mode !== ScaMode.MODE_0) {
                        return;
                    }
                    if ((imageElement.width !== this.mode0Width) || (imageElement.height !== this.mode0Height)) {
                        throw new Error('Border image dimensions should be 384*304');
                    }
                }),
                switchMap(img => this.gifParserService.parse(img)),
            )
            .subscribe({
                    next: (parsed: ParsedFrames) => {
                        this.width = parsed.width;
                        this.height = parsed.height;
                        this.frames = parsed.frames;
                        this.error = undefined;
                        this.converted = false;
                        this.convertedData = null;
                    },
                    error: error => this.error = error,
                },
            );
    }

    public convertImage() {
        if (!this.frames) {
            this.error = 'No frames to convert';
            return;
        }
        this.scaGeneratorService.generate(this.mode, this.frames, this.width, this.height)
            .pipe(
                switchMap((sca: Sca<ScaTypeForMode<0>>) => {
                    const binary = this.scaGeneratorService.makeBinary(sca);
                    if (binary === null) {
                        throw new Error('SCA conversion to binary has failed');
                    }
                    return of(binary);
                }),
            )
            .subscribe({
                next: (data: Uint8Array) => {
                    this.convertedData = data;
                    this.converted = true;
                },
                error: err => {
                    this.error = err.message || err;
                },
            });
    }

    public saveImage() {
        if (this.convertedData) {
            const blob = new Blob([this.convertedData], {type: 'application/octet-stream'});
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = this.fileName;
            anchor.click();
            window.URL.revokeObjectURL(url);
        }
    }

    public get loaded(): boolean {
        return this.frames !== null;
    }
}
