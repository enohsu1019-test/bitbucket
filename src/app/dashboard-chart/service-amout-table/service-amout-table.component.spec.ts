import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAmoutTableComponent } from './service-amout-table.component';

describe('ServiceAmoutTableComponent', () => {
  let component: ServiceAmoutTableComponent;
  let fixture: ComponentFixture<ServiceAmoutTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceAmoutTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceAmoutTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
