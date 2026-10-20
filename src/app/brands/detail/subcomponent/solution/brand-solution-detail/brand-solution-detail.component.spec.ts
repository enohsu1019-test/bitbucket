import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandSolutionDetailComponent } from './brand-solution-detail.component';

describe('BrandSolutionDetailComponent', () => {
  let component: BrandSolutionDetailComponent;
  let fixture: ComponentFixture<BrandSolutionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandSolutionDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandSolutionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
