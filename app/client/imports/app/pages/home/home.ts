import { Component, OnInit, NgZone } from '@angular/core';
import { App, NavController } from 'ionic-angular/es2015';
import { MeteorComponent } from 'angular2-meteor';
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../../../../both/Constants";
import { Shops, Images } from "../../../../../both/collections/demo.collection";
import { Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import {CartDataService} from "../../components/cart/cart-data.service";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage extends MeteorComponent implements OnInit {
  public user: Meteor.User;
  public products: Observable<any[]>;
  public imgurl: Observable<any[]>;
  public cartDataService: CartDataService<any[]>;
  
  constructor(public app: App,
    public nav: NavController,
    public zone: NgZone,
    public translate: TranslateService,
    public cartDataService: CartDataService
  ) {
    super();

  }

  ngOnInit() {

    if (Session.get(Constants.SESSION.TRANSLATIONS_READY)) {
      this.translate.get('page-home.title').subscribe((translation: string) => {
        this.app.setTitle(translation);
      });
      this.user = Meteor.userId();
      console.log(this.user);
    }
    
    this.cartDataService.currentCartData.subscribe( cartData => {
      this.cartData = cartData;
    });
    
    this.autorun(() => this.zone.run(() => {
        this.user = Meteor.user();
    }));
    
  }
     
}

