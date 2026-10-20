import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftProductComponent } from './microsoft-product.component';

describe('MicrosoftProductComponent', () => {
  let component: MicrosoftProductComponent;
  let fixture: ComponentFixture<MicrosoftProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
