import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandPriceBookComponent } from './brand-price-book.component';

describe('BrandPriceBookComponent', () => {
  let component: BrandPriceBookComponent;
  let fixture: ComponentFixture<BrandPriceBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandPriceBookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandPriceBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
