import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionDetialComponent } from './solution-detial.component';

describe('SolutionDetialComponent', () => {
  let component: SolutionDetialComponent;
  let fixture: ComponentFixture<SolutionDetialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolutionDetialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionDetialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
