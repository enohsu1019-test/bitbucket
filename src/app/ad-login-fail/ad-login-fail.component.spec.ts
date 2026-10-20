import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdLoginFailComponent } from './ad-login-fail.component';

describe('AdLoginFailComponent', () => {
  let component: AdLoginFailComponent;
  let fixture: ComponentFixture<AdLoginFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdLoginFailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdLoginFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
