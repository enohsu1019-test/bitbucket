import { Component, OnInit } from '@angular/core';
import { GuardsCheckEnd, GuardsCheckStart, NavigationCancel, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './core/services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'web';
  data = '';
  loading = false;

  constructor(
    private translate: TranslateService,
    public alert: AlertService,
    private router: Router,
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('zh-tw');
  }

  ngOnInit(): void {
    // 通過 route guard 前，先顯示載入圖示
    this.router.events.subscribe(event => {
      if (event instanceof GuardsCheckStart) {
        this.loading = true;
        console.log('GuardStart');
      }
      if (event instanceof GuardsCheckEnd || event instanceof NavigationCancel) {
        this.loading = false;
        console.log('GuardEnd');
      }
    });
  }
}
