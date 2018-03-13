import { Injectable } from "@angular/core";
import { ObservableCursor } from "meteor-rxjs";
import { Demo } from "../../../../../both/models/demo.model";
import { Shops } from "../../../../../both/collections/demo.collection";
import {Constants} from "../../../../../both/Constants";
import { MeteorObservable } from 'meteor-rxjs';


@Injectable()
export class ProductsDataService {
  private data: ObservableCursor<any>;

  constructor() {
    MeteorObservable.subscribe('shops-nonadmin').subscribe();
    console.log(Session.get(Constants.SESSION.USER));
    if ( Session.get(Constants.SESSION.USER) ) {
      this.shopId = Session.get(Constants.SESSION.USER).profile.shop;
      
      this.data = Shops.find({_id: this.shopId}).map((shops) => {
          return shops[0].products;        
      });
    }
  }

  public getData(): ObservableCursor<any> {
    return this.data;
  }
  
}
