import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CostAnalysisComponent } from './cost-analysis.component';
import { CoreModule } from 'src/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CostAnalysisComponent', () => {
  let component: CostAnalysisComponent;
  let fixture: ComponentFixture<CostAnalysisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CostAnalysisComponent],
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
    fixture = TestBed.createComponent(CostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
