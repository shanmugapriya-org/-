import { TestBed } from '@angular/core/testing';

import { GooglefontsService } from './googlefonts.service';

describe('GooglefontsService', () => {
  let service: GooglefontsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GooglefontsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
