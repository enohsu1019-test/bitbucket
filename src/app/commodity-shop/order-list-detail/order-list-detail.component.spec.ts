import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListDetailComponent } from './order-list-detail.component';

describe('OrderListDetailComponent', () => {
  let component: OrderListDetailComponent;
  let fixture: ComponentFixture<OrderListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderListDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
