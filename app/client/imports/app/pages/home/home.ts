import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { App, NavController } from 'ionic-angular/es2015';
import { MeteorComponent } from 'angular2-meteor';
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../../../../both/Constants";
import { Shops, Images, Sessions } from "../../../../../both/collections/demo.collection";
import { TheSession } from "../../../../../both/models/demo.model";
import { Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { CartDataService } from "../../components/cart/cart-data.service";
import { CartComponent } from "../../components/cart/cart.component"
import { NativeStorage } from '@ionic-native/native-storage';
import * as randomstring from 'randomstring';
import { LocalDataService } from "../../local-data.service";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage extends MeteorComponent implements OnInit {
  public user: Meteor.User;
  public products: Observable<any[]>;
  public imgurl: Observable<any[]>;;
  public sessionFound = true;
  public isSync = true;
  public loggingIn = false;
  public username: string;
  public password: string;
  public cartData: any;
  public openAmount: number;
  public loginMessage = '';
  
  constructor(public app: App,
    public nav: NavController,
    public zone: NgZone,
    public translate: TranslateService,
    public cartDataService: CartDataService,
    private nativeStorage: NativeStorage,
    public localDataService: LocalDataService
  ) {
    super();
  }

  ngOnInit() {

    if (Session.get(Constants.SESSION.TRANSLATIONS_READY)) {
      this.translate.get('page-home.title').subscribe((translation: string) => {
        this.app.setTitle(translation);
      });

    }
    this.user = Meteor.user();

    this.cartDataService.currentCartData.subscribe(cartData => {
      this.cartData = cartData;
    });

    this.autorun(() => {
      this.user = Meteor.user();
      console.log('home.ts - this.user', this.user);      
    });



  }

  openCreateSession() {
    this.sessionFound = false;
  }

  closeCreateSession() {
    this.sessionFound = true;
  }

  cancelCreateSession() {
    Meteor.logout();
  }

  createSession() {
    let self = this;
    var session:TheSession = {
      _id: randomstring.generate(17),
      cashier: Meteor.userId(),
      shop: Session.get('THESHOPID'),
      closed: false,
      openCash: this.openAmount || 0,
      cash: this.openAmount || 0,
      creditCard: 0,
      cheques: 0,
      total_sales: 0
    }

    Session.set('SESSID', session._id);
    Meteor.call('newSession', session, () => {
      self.openAmount = 0;
      self.closeCreateSession();
    });

    if (Meteor.isCordova) {
      
      this.nativeStorage.setItem('localCheques', [])
      .then(
        () => console.log('Stored cheques empty array!'),
        error => console.error('Error storing cheque', error)
        );

      this.nativeStorage.setItem('localTransactions', [])
      .then(
        () => console.log('Stored Transactions empty array!'),
        error => console.error('Error storing Transactions', error)
        );    
      this.localDataService.updateLocalSession(session);      
    }
    this.closeCreateSession();
  }

  login() {
    this.loggingIn = true;
    Meteor.subscribe('sessions');
    Meteor.loginWithPassword(this.username, this.password, (error) => {
      this.zone.run(() => {
        this.loggingIn = false;
      });            
      if(error){
        console.log(error);
        this.loginMessage = error.reason;
      }else{
        this.user = Meteor.user();
        let sessions:any[] = Sessions.find({ cashier: this.user._id, closed: false }).fetch();
        if (sessions.length == 0) {
          this.openCreateSession();

        } else {
          Session.set('SESSID', sessions[0]._id);
        }                

      }
    })
  }
  
  onSyncChecked(sync){
    this.isSync = sync;
    console.log('onSyncChecked');
    console.log(sync);
  }
}

