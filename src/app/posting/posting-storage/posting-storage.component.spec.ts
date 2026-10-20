import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostingStorageComponent } from './posting-storage.component';

describe('PostingStorageComponent', () => {
  let component: PostingStorageComponent;
  let fixture: ComponentFixture<PostingStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostingStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostingStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
