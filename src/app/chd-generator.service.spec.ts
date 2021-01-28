import { TestBed } from '@angular/core/testing';

import { ChrdGeneratorService } from './chrd-generator.service';

describe('ChrdGeneratorService', () => {
  let service: ChrdGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChrdGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
