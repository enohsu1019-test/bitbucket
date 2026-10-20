import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityShopDetailComponent } from './commodity-shop-detail.component';

describe('CommodityShopDetailComponent', () => {
  let component: CommodityShopDetailComponent;
  let fixture: ComponentFixture<CommodityShopDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommodityShopDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommodityShopDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
