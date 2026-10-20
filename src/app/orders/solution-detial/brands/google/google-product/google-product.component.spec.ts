import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleProductComponent } from './google-product.component';

describe('GoogleProductComponent', () => {
  let component: GoogleProductComponent;
  let fixture: ComponentFixture<GoogleProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
