import { TestBed } from '@angular/core/testing';

import { ImageReaderService } from './image-reader.service';

describe('ImageReaderService', () => {
  let service: ImageReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
