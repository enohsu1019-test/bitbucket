import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectSettingComponent } from './project-setting.component';
import { CoreModule } from 'src/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ProjectSettingComponent', () => {
  let component: ProjectSettingComponent;
  let fixture: ComponentFixture<ProjectSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectSettingComponent],
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
    fixture = TestBed.createComponent(ProjectSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
