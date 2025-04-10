import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BscConverterComponent} from './bsc-converter.component';

describe('BscConverterComponent', () => {
    let component: BscConverterComponent;
    let fixture: ComponentFixture<BscConverterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BscConverterComponent],
        })
            .compileComponents();

        fixture = TestBed.createComponent(BscConverterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
