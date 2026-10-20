import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsProductComponent } from './aws-product.component';

describe('AwsProductComponent', () => {
  let component: AwsProductComponent;
  let fixture: ComponentFixture<AwsProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwsProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
