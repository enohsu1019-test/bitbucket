import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsListComponent } from './bills-list.component';

describe('BillsComponent', () => {
  let component: BillsListComponent;
  let fixture: ComponentFixture<BillsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
