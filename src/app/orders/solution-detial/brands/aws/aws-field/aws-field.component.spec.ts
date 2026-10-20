import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsFieldComponent } from './aws-field.component';

describe('AwsFieldComponent', () => {
  let component: AwsFieldComponent;
  let fixture: ComponentFixture<AwsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwsFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
