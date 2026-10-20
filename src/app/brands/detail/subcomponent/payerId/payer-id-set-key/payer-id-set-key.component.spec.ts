import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerIdSetKeyComponent } from './payer-id-set-key.component';

describe('PayerIdSetKeyComponent', () => {
  let component: PayerIdSetKeyComponent;
  let fixture: ComponentFixture<PayerIdSetKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayerIdSetKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayerIdSetKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
