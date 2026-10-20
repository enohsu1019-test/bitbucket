import { Filter } from './filter';

export class RequestData {
  data?: any;
  filter?: Filter;

  constructor(...args: any[]) {
    args.forEach(arg => {
      if (arg instanceof Filter) {
        this.filter = arg;
      } else {
        this.data = arg;
      }
    });
  }
}
