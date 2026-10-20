import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityShopComponent } from './commodity-shop.component';

describe('CommodityShopComponent', () => {
  let component: CommodityShopComponent;
  let fixture: ComponentFixture<CommodityShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityShopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
