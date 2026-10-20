import { TestBed } from '@angular/core/testing';

import { CommodityShopService } from './commodity-shop.service';

describe('CommodityShopService', () => {
  let service: CommodityShopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommodityShopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
