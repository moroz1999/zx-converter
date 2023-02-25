import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPreviewComponent } from './canvas-preview.component';

describe('CanvasPreviewComponent', () => {
  let component: CanvasPreviewComponent;
  let fixture: ComponentFixture<CanvasPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
