import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmwareDashboardComponent } from './vmware-dashboard.component';

describe('VmwareDashboardComponent', () => {
  let component: VmwareDashboardComponent;
  let fixture: ComponentFixture<VmwareDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VmwareDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VmwareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
