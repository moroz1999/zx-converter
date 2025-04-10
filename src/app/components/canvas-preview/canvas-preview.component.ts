import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';

@Component({
    selector: 'app-canvas-preview',
    templateUrl: './canvas-preview.component.html',
    styleUrls: ['./canvas-preview.component.scss'],
})
export class CanvasPreviewComponent implements AfterViewInit, OnChanges {
    @Input() public width = 0;
    @Input() public height = 0;
    @Input() public imageData?: ImageData;
    @ViewChild('canvas', {static: true}) public canvas?: ElementRef<HTMLCanvasElement>;

    private context?: CanvasRenderingContext2D | null;

    public ngAfterViewInit(): void {
        this.context = this.canvas?.nativeElement.getContext('2d');
        if (this.context && this.imageData) {
            this.context.putImageData(this.imageData, 0, 0);
        }
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.context && changes.imageData) {
            this.context.putImageData(changes.imageData.currentValue, 0, 0);
        }
    }
}
