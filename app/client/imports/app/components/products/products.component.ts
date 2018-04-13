import { Component, OnInit, NgZone } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { ProductsDataService } from "./products-data.service";
import { Demo } from "../../../../../both/models/demo.model";
import { MeteorComponent } from "angular2-meteor";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../../../../both/Constants";
import { CartDataService } from "../cart/cart-data.service";

@Component({
  selector: "products",
  templateUrl: "products.component.html"
})
export class ProductsComponent extends MeteorComponent implements OnInit {
  public productsData: Observable<any[]>;
  public categoriesData: Observable<any[]>;
  public data: Observable<any[]>;
  public productsListSubscription: Subscription;
  public categoriesListSubscription: Subscription;
  public user: Meteor.User;
  
  constructor(private productsDataService: ProductsDataService,
    public translate: TranslateService,
    public cartDataService: CartDataService,
    public zone: NgZone) {
    super();
  }

  ngOnInit() {
    Meteor.subscribe('shops-nonadmin');
    
    this.productsListSubscription = MeteorObservable.subscribe('shops-nonadmin').subscribe(() => {
      this.productsData = this.productsDataService.getProductsData();
    });

    this.categoriesListSubscription = MeteorObservable.subscribe('shops-nonadmin').subscribe(() => {
      this.categoriesData = this.productsDataService.getCategoriesData();
    });

    this.cartDataService.currentCartData.subscribe(cartData => {
      this.cartData = cartData;
    });
    
    this.autorun(() => {
      this.user = Meteor.user();
      if (!!this.user) this.username = this.user.username;
    });

  }

  ngOnDestroy() {
    if (this.productsListSubscription) {
      this.productsListSubscription.unsubscribe();
    }

    if (this.categoriesListSubscription) {
      this.categoriesListSubscription.unsubscribe();
    }
  }

  addToCart(item) {
    this.cartDataService.addToCart(item);
  }

  selectCategory(id) {
    this.selectedCat = id;
    if(id == 'all'){
      this.selectedCat = null;
    }
  }
  
  resetCategory() {
    this.selectedCat = '';
  }
}
