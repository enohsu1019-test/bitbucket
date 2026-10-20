import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiscoFieldComponent } from './cisco-field.component';

describe('CiscoFieldComponent', () => {
  let component: CiscoFieldComponent;
  let fixture: ComponentFixture<CiscoFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CiscoFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CiscoFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
