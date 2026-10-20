import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkamaiProductComponent } from './akamai-product.component';

describe('AkamaiProductComponent', () => {
  let component: AkamaiProductComponent;
  let fixture: ComponentFixture<AkamaiProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkamaiProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AkamaiProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
