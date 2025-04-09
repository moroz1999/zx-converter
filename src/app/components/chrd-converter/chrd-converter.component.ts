import {ChangeDetectorRef, Component} from '@angular/core';
import {ImageReaderService} from '../../services/image-reader.service';
import {ChrdGeneratorService} from '../../services/chrd-generator.service';
import {PaletteReducerService} from '../../services/palette-reducer.service';
import {DownloadGeneratorService} from '../../services/download-generator.service';
import {ImageToDataService} from '../../services/image-to-data.service';
import {Observable, tap} from 'rxjs';
import {ZxScreenService} from '../../services/zx-screen.service';

@Component({
  selector: 'chrd-converter',
  templateUrl: './chrd-converter.component.html',
  styleUrls: ['./chrd-converter.component.scss'],
})
export class ChrdConverterComponent {

  public loaded = false;
  public converted = false;
  public chrdFileName = 'converted.chr$';
  public error?: string;
  public width = 0;
  public height = 0;

  public imageData?: ImageData;

  constructor(
    private cdr: ChangeDetectorRef,
    private imageReaderService: ImageReaderService,
    private paletteReducerService: PaletteReducerService,
    private chrdGeneratorService: ChrdGeneratorService,
    private downloadGeneratorService: DownloadGeneratorService,
    private imageToDataService: ImageToDataService,
    private zxScreenService: ZxScreenService,
  ) {
  }


  public imageLoaded(imageElement: Observable<HTMLImageElement>) {
    imageElement.pipe(tap(imageElement => {
      if ((imageElement.width % 8 !== 0) || (imageElement.height % 8 !== 0)) {
        throw new Error('Image width/height should be a multiple of 8');
      }
    })).subscribe({
        next: imageElement => {
          this.width = imageElement.width;
          this.height = imageElement.height;
          this.loaded = true;
          this.converted = false;
          this.error = undefined;
          this.imageData = this.imageToDataService.convertToImageData(imageElement) ?? undefined;
        },
        error: error => this.error = error,
      },
    );
  }

  public imageFileName(fileName: string) {
    this.chrdFileName = fileName.split('.').slice(0, -1).join('.') + '.chr$';
  }

  public convertImage() {
    if (this.imageData) {
      this.converted = true;
      this.imageData = this.paletteReducerService.reducePalette(this.imageData);
    }
  }

  public saveImage() {
    if (this.imageData) {
      const data = this.zxScreenService.convertToScreen(this.imageData);
      let bytes = this.chrdGeneratorService.generate(this.width, this.height, data.pixels, data.attributes);
      this.downloadGeneratorService.attemptDownload(bytes, this.chrdFileName);
    }
  }
}
