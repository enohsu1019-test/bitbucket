import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureForecastUsageComponent } from './future-forecast-usage.component';

describe('FutureForecastUsageComponent', () => {
  let component: FutureForecastUsageComponent;
  let fixture: ComponentFixture<FutureForecastUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FutureForecastUsageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureForecastUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
