import {ChangeDetectorRef, Component} from '@angular/core';
import {ImageReaderService} from '../../services/image-reader.service';
import {ChrdGeneratorService} from '../../services/chrd-generator.service';
import {PaletteReducerService} from '../../services/palette-reducer.service';
import {DownloadGeneratorService} from '../../services/download-generator.service';
import {ImageToDataService} from '../../services/image-to-data.service';

@Component({
  selector: 'app-chrd-converter',
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
  ) {
  }


  public imageLoaded(imageElement: HTMLImageElement) {
    this.width = imageElement.width;
    this.height = imageElement.height;
    this.loaded = true;
    this.converted = false;
    this.error = undefined;
    this.imageData = this.imageToDataService.convertToImageData(imageElement) ?? undefined;
  }

  public imageError(error: string) {
    this.error = error;
  }

  public imageFileName(fileName: string) {
    this.chrdFileName = fileName.split('.').slice(0, -1).join('.') + '.chr$';
  }

  public convertImage() {
    //   this.converted = true;
    //   let imageData = this.context.getImageData(0, 0, this.width, this.height);
    //   let resultImageData = this.context.getImageData(0, 0, this.width, this.height);
    //   let reducedImageData = this.paletteReducerService.reducePalette(imageData, resultImageData);
    //   this.context.putImageData(reducedImageData, 0, 0);
  }

  public saveImage() {
    let pixelsData = this.paletteReducerService.pixelsData;
    let attributesData = this.paletteReducerService.attributesData;
    let bytes = this.chrdGeneratorService.generate(this.width, this.height, pixelsData, attributesData);
    this.downloadGeneratorService.attemptDownload(bytes, this.chrdFileName);
  }
}
