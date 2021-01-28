import { TestBed } from '@angular/core/testing';

import { PaletteReducerService } from './palette-reducer.service';

describe('PaletteReducerService', () => {
  let service: PaletteReducerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaletteReducerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
