import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsPayerIdComponent } from './brands-payer-id.component';

describe('BrandsPayerIdComponent', () => {
  let component: BrandsPayerIdComponent;
  let fixture: ComponentFixture<BrandsPayerIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandsPayerIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandsPayerIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
