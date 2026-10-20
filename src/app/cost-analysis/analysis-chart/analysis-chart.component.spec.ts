import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnalysisChartComponent } from './analysis-chart.component';
import { CoreModule } from 'src/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('AnalysisChartComponent', () => {
  let component: AnalysisChartComponent;
  let fixture: ComponentFixture<AnalysisChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysisChartComponent],
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
    fixture = TestBed.createComponent(AnalysisChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
