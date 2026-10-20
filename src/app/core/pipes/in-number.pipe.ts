import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'inNumber'
})
export class InNumberPipe extends DecimalPipe implements PipeTransform {

  override transform(value: any, ...args: any[]): any {
    if (typeof value === 'number' && value !== 0 && value < 1) {
      return '< 1';
    } else {
      return super.transform(value, args[0], args[1]);
    }
  }
  
}
