import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRoleDetailComponent } from './users-role-detail.component';

describe('UsersRoleDetailComponent', () => {
  let component: UsersRoleDetailComponent;
  let fixture: ComponentFixture<UsersRoleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersRoleDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersRoleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
