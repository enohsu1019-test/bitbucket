import { TestBed } from '@angular/core/testing';

import { OsBrowserService } from './os-browser.service';

describe('OsBrowserService', () => {
  let service: OsBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
