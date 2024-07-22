import { TestBed } from '@angular/core/testing';

import { GoogleFontsService } from './googlefonts.service';

describe('GooglefontsService', () => {
  let service: GoogleFontsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleFontsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
