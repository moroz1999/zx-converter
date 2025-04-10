import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FileLoaderComponent} from './file-loader.component';

describe('ImageLoaderComponent', () => {
    let component: FileLoaderComponent;
    let fixture: ComponentFixture<FileLoaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FileLoaderComponent],
        })
            .compileComponents();

        fixture = TestBed.createComponent(FileLoaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
