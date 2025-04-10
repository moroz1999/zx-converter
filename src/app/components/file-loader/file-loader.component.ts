import {Component, EventEmitter, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {FileReaderService} from '../../services/file-reader.service';

@Component({
    selector: 'app-file-loader',
    templateUrl: './file-loader.component.html',
    styleUrls: ['./file-loader.component.scss'],
})
export class FileLoaderComponent {
    public file?: File;
    @Output() public loaded = new EventEmitter<Observable<ArrayBuffer>>();
    @Output() public fileName = new EventEmitter<string>();

    constructor(
        private fileReaderService: FileReaderService,
    ) {
    }

    public fileChanged(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.file = (target.files as FileList)[0];
        this.fileName.emit(this.file.name);
    }

    public loadImage(): void {
        if (this.file) {
            this.loaded.emit(this.fileReaderService.getFileContents(this.file));
        }
    }
}
