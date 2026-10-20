import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsDashboardComponent } from './aws-dashboard.component';

describe('AwsDashboardComponent', () => {
  let component: AwsDashboardComponent;
  let fixture: ComponentFixture<AwsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
