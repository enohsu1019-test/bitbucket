import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateParser, TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {

  translate!: TranslateService;
  override itemsPerPageLabel = 'Items per page';
  override nextPageLabel = 'Next page';
  override previousPageLabel = 'Previous page';
  override getRangeLabel =  (page: any, pageSize: any, length: any) => {

    if (length === 0 || pageSize === 0) {
      return this.translate.instant('paginator.rangePageLabel1', { length });
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return this.translate.instant('paginator.rangePageLabel2', { startIndex: startIndex + 1, endIndex, length });
  };

  injectTranslateService(translate: TranslateService) {
    this.translate = translate;

    this.translate.onLangChange.subscribe(() => {
      this.translateLabels();
      this.changes.next();
    });

    this.translateLabels();
  }

  translateLabels() {
    this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPageLabel',TitleCasePipe);
    this.nextPageLabel = this.translate.instant('paginator.nextPageLabel',TitleCasePipe);
    this.previousPageLabel = this.translate.instant('paginator.previousPageLabel',TitleCasePipe);
    this.firstPageLabel = this.translate.instant('paginator.firstPageLabel',TitleCasePipe);
    this.lastPageLabel = this.translate.instant('paginator.lastPageLabel',TitleCasePipe);
    this.getRangeLabel = this.getRangeLabel.bind(this);
  }

}
