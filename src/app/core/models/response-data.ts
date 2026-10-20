import { Info } from './info';
import { Page } from './page';

export class ResponseData {
  data: any;
  info: Info = new Info();
  page?: Page;
  blob?: Blob;
  filename?: string;
}
