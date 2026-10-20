import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimExtension'
})
export class TrimExtensionPipe implements PipeTransform {

  transform(item: string) {
    if (!item || !item.length) {
      return;
    }
    const iDot = item.lastIndexOf('.');
    console.log(item, item.length, iDot);
    if (iDot >= 0) {
      return item.substring(0, iDot);
    } else {
      return item;
    }
  }

}
