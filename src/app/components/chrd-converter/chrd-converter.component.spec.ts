import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChrdConverterComponent} from './chrd-converter.component';

describe('ChrdConverterComponent', () => {
    let component: ChrdConverterComponent;
    let fixture: ComponentFixture<ChrdConverterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChrdConverterComponent],
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChrdConverterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
