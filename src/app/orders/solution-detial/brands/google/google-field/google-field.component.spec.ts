import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleFieldComponent } from './google-field.component';

describe('GoogleFieldComponent', () => {
  let component: GoogleFieldComponent;
  let fixture: ComponentFixture<GoogleFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
