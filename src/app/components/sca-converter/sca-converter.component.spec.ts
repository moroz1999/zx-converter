import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaConverterComponent} from './sca-converter.component';

describe('ScaConverterComponent', () => {
    let component: ScaConverterComponent;
    let fixture: ComponentFixture<ScaConverterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScaConverterComponent],
        })
            .compileComponents();

        fixture = TestBed.createComponent(ScaConverterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
