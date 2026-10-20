import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkamaiFieldComponent } from './akamai-field.component';

describe('AkamaiFieldComponent', () => {
  let component: AkamaiFieldComponent;
  let fixture: ComponentFixture<AkamaiFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkamaiFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AkamaiFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
