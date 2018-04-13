import { Injectable } from "@angular/core";
import { ObservableCursor } from "meteor-rxjs";
import {Constants} from "../../../../../both/Constants";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CartDataService {
  private data: ObservableCursor<any>;
  private cartDataSource = new BehaviorSubject<any[]>([]);
  currentCartData = this.cartDataSource.asObservable();

  constructor() {
  
  }

  
  addToCart(item){
    if(this.cartDataSource.getValue().indexOf(item) >= 0){      
      item.cartCount++;
      this.cartDataSource.next(
        this.cartDataSource.getValue()
      );
    } else{
      item.cartCount = 1;
      this.cartDataSource.next(     
        this.cartDataSource.getValue().concat([item])
      );
    }
    console.log(this.cartDataSource.getValue());
  }

  updateCart(data){
    this.cartDataSource.next(data);
  }
  
  resetCart(){
    this.cartDataSource.next([]);
  }
  
}
