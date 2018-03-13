import {Component, OnInit} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {Demo} from "../../../../../both/models/demo.model";
import {MeteorComponent} from "angular2-meteor";
import {TranslateService} from "@ngx-translate/core";
import {Constants} from "../../../../../both/Constants";

import {CartDataService} from "./cart-data.service";

@Component({
    selector: "cart",
    templateUrl: "cart.component.html"
})

export class CartComponent extends MeteorComponent implements OnInit {
    public data:Observable<any[]>;
    public cartListSubscription:Subscription;
    public cartDataService: CartDataService<any[]>;

    constructor(private cartDataService:CartDataService,
                public translate:TranslateService) {
        super();
    }

    ngOnInit() {
        this.cartDataService.currentCartData.subscribe( cartData => {
          this.cartData = cartData;
        });

    }

    ngOnDestroy() {
        if (this.cartListSubscription) {
            this.cartListSubscription.unsubscribe();
        }
    }
    
    
}
