import {Component, OnInit} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {ProductsDataService} from "./products-data.service";
import {Demo} from "../../../../../both/models/demo.model";
import {MeteorComponent} from "angular2-meteor";
import {TranslateService} from "@ngx-translate/core";
import {Constants} from "../../../../../both/Constants";
import {CartDataService} from "../cart/cart-data.service";

@Component({
    selector: "products",
    templateUrl: "products.component.html"
})
export class ProductsComponent extends MeteorComponent implements OnInit {
    public data:Observable<any[]>;
    public productsListSubscription:Subscription;
    public cartDataService: CartDataService<any[]>;

    constructor(private productsDataService:ProductsDataService,
                public translate:TranslateService, 
                public cartDataService: CartDataService) {
        super();
    }

    ngOnInit() {
        this.productsListSubscription = MeteorObservable.subscribe('shops-nonadmin').subscribe(() => {
            this.data = this.productsDataService.getData();
        });
        
        this.cartDataService.currentCartData.subscribe( cartData => {
          this.cartData = cartData;
        });
    }

    ngOnDestroy() {
        if (this.productsListSubscription) {
            this.productsListSubscription.unsubscribe();
        }
    }
    
    addToCart(item){
      this.cartDataService.addToCart(item);
    }
}
