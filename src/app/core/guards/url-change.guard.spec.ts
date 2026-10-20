import { TestBed } from '@angular/core/testing';

import { UrlChangeGuard } from './url-change.guard';

describe('UrlChangeGuard', () => {
  let guard: UrlChangeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UrlChangeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
