import { Injectable, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../models/language';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  static LangChanged = 'LangChanged';

  langChangeEvent = new EventEmitter();

  // languages
  currentLang: Language;
  readonly languages: Language[] = [{
    code: 'zh-tw',
    name: '繁體中文'
  }, {
    code: 'en',
    name: 'English'
  }];

  constructor(private translate: TranslateService,
              private localeService: BsLocaleService,
  ) {
    this.currentLang = this.languages[0];

    // set default lang
    const lang = localStorage.getItem('langCode');
    if (lang) {
      console.log('lang cookie', lang);
      this.setCurrentLang(lang);
    } else {
      this.setCurrentLang(this.languages[0].code);
    }
  }

  getAllLanguages() {
    return this.languages;
  }

  setCurrentLang(code: string) {
    console.log('[lang] setCurrentLang...', code);
    const idx = this.languages.findIndex(lang => lang.code === code);
    if (idx >= 0) {
      this.currentLang = this.languages[idx];
    } else {
      this.currentLang = this.languages[0];
    }

    localStorage.setItem('langCode', this.currentLang.code.toString());
    this.translate.use(this.currentLang.code);

    // 日期選擇多語系
    this.localeService.use(this.currentLang.code);

    this.langChangeEvent.emit(LangService.LangChanged);
  }

}
