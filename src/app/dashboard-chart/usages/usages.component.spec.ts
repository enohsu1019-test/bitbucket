import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UsagesComponent } from './usages.component';

describe('UsagesComponent', () => {
  let component: UsagesComponent;
  let fixture: ComponentFixture<UsagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UsagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
