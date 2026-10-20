import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TagAnalysisComponent } from './tag-analysis.component';
import { CoreModule } from 'src/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('TagAnalysisComponent', () => {
  let component: TagAnalysisComponent;
  let fixture: ComponentFixture<TagAnalysisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TagAnalysisComponent],
      imports: [

        CoreModule,

        /** 有使用到 httpClient */
        HttpClientModule,

        /** for: NullInjectorError: No provider for ActivatedRoute */
        RouterTestingModule,

        TranslateModule.forRoot(),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
