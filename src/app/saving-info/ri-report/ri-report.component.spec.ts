import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiReportComponent } from './ri-report.component';

describe('DetailComponent', () => {
  let component: RiReportComponent;
  let fixture: ComponentFixture<RiReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
