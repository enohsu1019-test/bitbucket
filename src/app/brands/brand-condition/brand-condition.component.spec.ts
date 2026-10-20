import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandConditionComponent } from './brand-condition.component';

describe('BrandConditionComponent', () => {
  let component: BrandConditionComponent;
  let fixture: ComponentFixture<BrandConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
