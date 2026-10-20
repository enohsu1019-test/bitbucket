import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeSuggestComponent } from './size-suggest.component';

describe('RightsizingDetailComponent', () => {
  let component: SizeSuggestComponent;
  let fixture: ComponentFixture<SizeSuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SizeSuggestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
