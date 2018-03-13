import { Injectable } from "@angular/core";
import { ObservableCursor } from "meteor-rxjs";
import { Demo } from "../../../../../both/models/demo.model";
import { DemoCollection } from "../../../../../both/collections/demo.collection";
import {Constants} from "../../../../../both/Constants";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CartDataService {
  private data: ObservableCursor<Any>;
  private cartDataSource = new BehaviorSubject<any[]>([]);
  currentCartData = this.cartDataSource.asObservable();

  constructor() {
    this.data = Session.get(Constants.SESSION.CARTITEMS);
  }

  public getData(): ObservableCursor<Demo> {
    return this.data;
  }
  
  addToCart(item){    
    if(this.cartDataSource.getValue().indexOf(item) >= 0){
      item.cartCount++;
    } else{
      item.cartCount = 1;
      this.cartDataSource.next(      
        this.cartDataSource.getValue().concat([item]);
      );
    }
    
    console.log(this.cartDataSource.getValue());
  }
  
}
