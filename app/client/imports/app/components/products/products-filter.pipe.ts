import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fiterByCat',
  pure: false
})
export class ProductsFilterPipe implements PipeTransform {

  transform(items: any[], category: String): any {
    if ( category == 'all' || !category ) {
      return items;
    }
    
    return items.filter(item =>  item.category == category);
  }
}