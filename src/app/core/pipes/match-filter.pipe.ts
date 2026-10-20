import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchFilter'
})
export class MatchFilterPipe implements PipeTransform {

  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => {
      let isMatch = true;
      Object.keys(filter).forEach(key => {
        isMatch = isMatch && (item[key] === filter[key]);
      });
      return isMatch;
    });
  }

}
