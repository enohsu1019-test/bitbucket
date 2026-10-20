import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CostAnalysisDetailComponent } from './cost-analysis-detail.component';
import { CoreModule } from 'src/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CostAnalysisDetailComponent', () => {
  let component: CostAnalysisDetailComponent;
  let fixture: ComponentFixture<CostAnalysisDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CostAnalysisDetailComponent],
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
    fixture = TestBed.createComponent(CostAnalysisDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
