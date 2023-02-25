import {Component, EventEmitter, Output} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {ImageReaderService} from '../../services/image-reader.service';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss'],
})
export class ImageLoaderComponent {
  public file?: File;
  @Output() public imageLoaded = new EventEmitter<Observable<HTMLImageElement>>();
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
      this.imageLoaded.emit(this.imageReaderService.getImageData(this.file));
    }
  }
}
