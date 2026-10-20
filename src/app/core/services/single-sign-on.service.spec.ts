import { TestBed } from '@angular/core/testing';

import { SingleSignOnService } from './single-sign-on.service';

describe('SingleSignOnService', () => {
  let service: SingleSignOnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SingleSignOnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
