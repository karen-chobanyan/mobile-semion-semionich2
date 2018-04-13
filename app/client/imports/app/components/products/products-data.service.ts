import { Injectable } from "@angular/core";
import { ObservableCursor } from "meteor-rxjs";
import { Demo } from "../../../../../both/models/demo.model";
import { Shops, Images } from "../../../../../both/collections/demo.collection";
import { Constants } from "../../../../../both/Constants";
import { MeteorObservable } from 'meteor-rxjs';


@Injectable()
export class ProductsDataService {
  private products: ObservableCursor<any>;
  private categories: ObservableCursor<any>;
  private clients: ObservableCursor<any>;
  public user: Meteor.User;
  public shopId: String = '';
  
  constructor() {
    Meteor.subscribe('shops-nonadmin');
    Meteor.subscribe('images');
    if (!!Meteor.user()) {
      this.shopId = Session.get("USER").profile.shop;

      this.products = Shops.find({ _id: this.shopId }).map((shops:any[]) => {
        if(!!shops[0]){
          Session.set('THESHOP', shops[0]);
          Session.set('THESHOPID', shops[0]._id);
          let pref = '';
          if (!Meteor.isCordova) {
            pref = 'http://semyon-semyonich.herokuapp.com';
          }
          for(var i = 0; i < shops[0].products.length; i++){
            if(!!shops[0].products[i].image){
              let img = Images.findOne(shops[0].products[i].image);
              if(!!img){
                shops[0].products[i].image_url = pref + img.url();
              }              
            }          
          }        
          return shops[0].products;
        }

      });

      this.categories = Shops.find({ _id: this.shopId }).map((shops:any) => {
        if(!!shops[0]){
          return shops[0].product_cats;
        }
      });
      
      this.clients = Shops.find({ _id: this.shopId }).map((shops:any) => {
        if(!!shops[0]){
          return shops[0].clients;
        }
      });
      
    }
  }

  public getProductsData(): ObservableCursor<any> {
    return this.products;
  }

  public getCategoriesData(): ObservableCursor<any> {
    return this.categories;
  }
  
  public getClientsData(): ObservableCursor<any> {
    return this.clients;
  }

}
