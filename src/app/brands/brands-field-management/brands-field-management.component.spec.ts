import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsFieldManagementComponent } from './brands-field-management.component';

describe('BrandsFieldManagementComponent', () => {
  let component: BrandsFieldManagementComponent;
  let fixture: ComponentFixture<BrandsFieldManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandsFieldManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandsFieldManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
