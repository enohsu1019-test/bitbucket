import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftFieldComponent } from './microsoft-field.component';

describe('MicrosoftFieldComponent', () => {
  let component: MicrosoftFieldComponent;
  let fixture: ComponentFixture<MicrosoftFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
