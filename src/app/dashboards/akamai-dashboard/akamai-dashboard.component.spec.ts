import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkamaiDashboardComponent } from './akamai-dashboard.component';

describe('AkamaiDashboardComponent', () => {
  let component: AkamaiDashboardComponent;
  let fixture: ComponentFixture<AkamaiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkamaiDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AkamaiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
