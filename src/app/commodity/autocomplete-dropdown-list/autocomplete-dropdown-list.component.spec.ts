import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteDropdownListComponent } from './autocomplete-dropdown-list.component';

describe('AutocompleteDropdownListComponent', () => {
  let component: AutocompleteDropdownListComponent;
  let fixture: ComponentFixture<AutocompleteDropdownListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutocompleteDropdownListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteDropdownListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
