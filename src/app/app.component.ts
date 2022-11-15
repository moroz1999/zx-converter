import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ImageReaderService} from './services/image-reader.service';
import {PaletteReducerService} from './services/palette-reducer.service';
import {ChrdGeneratorService} from "./services/chrd-generator.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'chrdConverter';
  width = 100;
  height = 100;
  loaded = false;
  converted = false;
  chrdFileName = "converted.chr$";
  file?: File;
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
    this.chrdFileName = this.file.name.split('.').slice(0, -1).join('.')+'.chr$';
  }

  loadImage() {
    if (this.file) {
      this.imageReaderService.getImageData(this.file).subscribe(imageData => {
        this.width = imageData.width;
        this.height = imageData.height;
        this.loaded = true;
        this.converted = false;
        this.cdr.detectChanges();

        if (this.context) {
          this.context.drawImage(imageData.image, 0, 0);
        }
      });
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
    let dataUrl = "data:application/octet-stream;base64," + btoa(AppComponent.uint8ToString(bytes));

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
