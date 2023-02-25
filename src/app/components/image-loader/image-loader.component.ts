import {Component, EventEmitter, Output} from '@angular/core';
import {tap} from 'rxjs';
import {ImageReaderService} from '../../services/image-reader.service';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss'],
})
export class ImageLoaderComponent {
  public file?: File;
  @Output() public imageLoaded = new EventEmitter<HTMLImageElement>();
  @Output() public imageError = new EventEmitter<string>();
  @Output() public imageFileName = new EventEmitter<string>();

  constructor(
    private imageReaderService: ImageReaderService,
  ) {
  }

  fileChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.file = (target.files as FileList)[0];
    this.imageFileName.emit(this.file.name);
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
              this.imageLoaded.emit(imageData);
            },
            error: (error) => this.imageError.emit(error),
          },
        );
    }
  }
}
