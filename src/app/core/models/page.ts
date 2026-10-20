export class PageConfig {
  boundaryLinks: boolean = true;
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  maxSize = 10;
}

export class Page {
  pageSize = 10;
  pageIndex = 1;
  pageCount = 1;
  dataCount = 0;
}
