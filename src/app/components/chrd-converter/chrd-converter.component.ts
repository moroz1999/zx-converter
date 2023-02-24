import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {ImageReaderService} from '../../services/image-reader.service';
import {ChrdGeneratorService} from '../../services/chrd-generator.service';
import {PaletteReducerService} from '../../services/palette-reducer.service';
import {tap} from 'rxjs';

@Component({
  selector: 'app-chrd-converter',
  templateUrl: './chrd-converter.component.html',
  styleUrls: ['./chrd-converter.component.scss'],
})
export class ChrdConverterComponent implements AfterViewInit {
  public width = 100;
  public height = 100;
  public loaded = false;
  public converted = false;
  public chrdFileName = 'converted.chr$';
  public file?: File;
  public error?: string;
  @ViewChild('canvas', {static: true}) canvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private cdr: ChangeDetectorRef,
    private imageReaderService: ImageReaderService,
    private paletteReducerService: PaletteReducerService,
    private chrdGeneratorService: ChrdGeneratorService,
  ) {
  }

  private context?: CanvasRenderingContext2D | null;

  ngAfterViewInit(): void {
    this.context = this.canvas?.nativeElement.getContext('2d');
  }

  fileChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.file = (target.files as FileList)[0];
    this.chrdFileName = this.file.name.split('.').slice(0, -1).join('.') + '.chr$';
  }

  loadImage() {
    if (this.file) {
      this.imageReaderService.getImageData(this.file)
        .pipe(tap(imageData => {
          if ((imageData.width % 8 !== 0) || (imageData.height % 8 !== 0)) {
            throw new Error('Image width/height should be a multiple of 8');
          }
        }))
        .subscribe({
            next: imageData => {
              this.width = imageData.width;
              this.height = imageData.height;
              this.loaded = true;
              this.converted = false;
              this.cdr.detectChanges();

              if (this.context) {
                this.context.drawImage(imageData, 0, 0);
              }
            },
            error: (error) => this.error = error,
          },
        );
    }
  }

  convertImage() {
    if (this.context) {
      this.converted = true;
      let imageData = this.context.getImageData(0, 0, this.width, this.height);
      let resultImageData = this.context.getImageData(0, 0, this.width, this.height);
      let reducedImageData = this.paletteReducerService.reducePalette(imageData, resultImageData);
      this.context.putImageData(reducedImageData, 0, 0);
    }
  }

  saveImage() {
    let pixelsData = this.paletteReducerService.pixelsData;
    let attributesData = this.paletteReducerService.attributesData;
    let bytes = this.chrdGeneratorService.generate(this.width, this.height, pixelsData, attributesData);
    let dataUrl = 'data:application/octet-stream;base64,' + btoa(ChrdConverterComponent.uint8ToString(bytes));

    const element = document.createElement('a');
    element.setAttribute('href', dataUrl);
    element.setAttribute('download', this.chrdFileName);

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
