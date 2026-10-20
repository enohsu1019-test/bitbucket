import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiscoProductComponent } from './cisco-product.component';

describe('CiscoProductComponent', () => {
  let component: CiscoProductComponent;
  let fixture: ComponentFixture<CiscoProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CiscoProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CiscoProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
