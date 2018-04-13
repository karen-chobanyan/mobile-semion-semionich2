import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { Sessions, Cheques } from "../../../../../both/collections/demo.collection";
import { MeteorComponent } from "angular2-meteor";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "../../../../../both/Constants";
import { CartDataService } from "./cart-data.service";
import { LocalDataService } from "../../local-data.service";
import { ProductsDataService } from "../products/products-data.service";
import { NativeStorage } from '@ionic-native/native-storage';
import { Cordova, Plugin, IonicNativePlugin } from '@ionic-native/core';
import * as moment from 'moment';
import * as randomstring from 'randomstring';
declare var cordova: any;

@Component({
  selector: "cart",
  templateUrl: "cart.component.html"
})

export class CartComponent extends MeteorComponent implements OnInit {
  public data: Observable<any[]>;
  public cartListSubscription: Subscription;
  public cartTotal: any;
  public cartData: any[];
  public clientsListSubscription: Subscription;
  public localSessionDataSubscription: Subscription;
  public cashModal = true;
  private percent = 0;
  public sessionsSynced = true;
  public chequesSynced = true;
  public selectedClient: any;
  public superTotal: any;
  public creditCard:boolean = false;
  public clientsData:any;
  public localSession:any ={};

  @Output() syncChecked: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor(
    public cartDataService: CartDataService,
    public localDataService: LocalDataService,
    public translate: TranslateService,
    private productsDataService: ProductsDataService,
    private nativeStorage: NativeStorage) {
    super();
  }

  ngOnInit() {

    Meteor.subscribe('shops-nonadmin');
    this.cartListSubscription = this.cartDataService.currentCartData.subscribe(cartData => {
      this.cartData = cartData;
      this.cartTotal = 0;
      for (var i = 0; i < this.cartData.length; i++) {
        this.cartTotal += this.cartData[i].cartCount * parseFloat(this.cartData[i].price);
      }
      this.superTotal = this.cartTotal;
    });

    if (Meteor.isCordova) {
      this.localSessionDataSubscription = this.localDataService.currentLocalServiceData.subscribe(localServiceData =>{
        this.localSession = localServiceData;
      });
    }

    this.clientsListSubscription = MeteorObservable.subscribe('shops-nonadmin').subscribe(() => {
      this.clientsData = this.productsDataService.getClientsData();
    });


  }

  ngOnDestroy() {
    if (this.cartListSubscription) {
      this.cartListSubscription.unsubscribe();
    }
  }

  showCashModal() {
    if(this.cartTotal > 0){
      this.cashModal = false;
    }
  }

  hideCashModal() {
    this.cashModal = true;
  }

  reacalculateSuper() {
    if (!!this.selectedClient) {
      this.percent = Session.get("THESHOP").clients.filter(client => client.id == this.selectedClient)[0].percent;
      console.log(this.percent);
      this.superTotal = this.cartTotal * (100 - this.percent) / 100;
    } else {
      this.percent = 0;
    }
  }

  updateLocalSessionCash(change, cc) {
    this.nativeStorage.getItem('localSession')
      .then(
      session => {
        if(cc){
          session.creditCard = session.creditCard + change;
        } else{
          session.cash = session.cash + change;
        }        
        session.cheques += 1;
        this.localDataService.updateLocalSession(session);
      },
      error => console.error(error)
      )
  }
  
  checkSync(){
    this.nativeStorage.getItem('localSession')
    .then(
    localSession => {
      let remoteSessions = Sessions.find({ _id: Session.get('SESSID') }).fetch();
      if(remoteSessions.length > 0){
        let remoteSession:any = remoteSessions[0];
        if(localSession.cash == remoteSession.cash && localSession.cheques == remoteSession.cheques){
          console.log('The Sessions are synced!!!');
          this.sessionsSynced = true;
        } else{
          console.log('The Sessions are NOT synced!!!');
          this.sessionsSynced = false;
          this.startSyncing(localSession);
        }
        
      } else{
        console.log('The Sessions are NOT synced!!!');
        this.sessionsSynced = false;
        this.startSyncing(localSession);
      }
      this.syncChecked.emit(this.sessionsSynced );
    },
    error => console.error(error)
    )
  }

  startSyncing(localSession){
    Meteor.call('syncSession', localSession, (id) => {
      if(!!id){
        // this.sessionsSynced == true;
        // this.syncChecked.emit(this.sessionsSynced );
      }
     });

     //Sync cheques
     let remoteCheques = Cheques.find({ session: Session.get('SESSID') }).fetch();
     this.nativeStorage.getItem('localCheques')
      .then(localCheques =>{
        if(remoteCheques.length != localCheques.length){
          for(var i = 1; i < localCheques.length; i++){
            if(remoteCheques.filter(cheque => cheque._id == localCheques[i]._id).length == 0){
              Meteor.call('newCheque', localCheques[i], () => {
                
              });
            }
          }
        }
      })
  }

  closeCheque() {
    var cheque:any = {};
    let self = this;
    cheque._id = randomstring.generate(17);
    cheque.items = this.cartData;
    cheque.session = Session.get('SESSID');
    cheque.creditCard = this.creditCard;

    if (!!cheque.session) {
      cheque.total = this.cartTotal;
      cheque.owner = Session.get("USER").profile.owner;
      cheque.shop = Session.get("USER").profile.shop;
      cheque.cashier = Session.get("USER")._id;
      cheque.client = this.selectedClient;
      cheque.discount = 0;
      cheque.supertotoal = cheque.total;

      if (!!cheque.client) {
        console.log(cheque.client);
        let client = Session.get("THESHOP").clients.filter(client => client.id == cheque.client)[0];
        this.percent = client.percent;
        console.log(this.percent);
        cheque.discount = this.percent + '%';
        cheque.client_name = client.name;
        cheque.supertotoal = cheque.total * (100 - this.percent) / 100
      } else {
        this.percent = 0;
      }

      this.printElement(this.cartData);
      console.log('cheque:');
      console.log(cheque);

      if (Meteor.isCordova) {
        this.nativeStorage.getItem('localCheques')
        .then(
          data => {
            console.log('JSON.stringify(data)');
            console.log( JSON.stringify(data));
            data.push(cheque);
            this.nativeStorage.setItem('localCheques', data)
            .then(
              () => {
                console.log('Stored cheque!');
                
                this.updateLocalSessionCash( cheque.supertotoal, cheque.creditCard );
                Meteor.call('newCheque', cheque, () => {
                  this.checkSync();
                });
                this.checkSync();
                self.cartDataService.resetCart();
                self.hideCashModal();
                self.selectedClient = 0;
                self.creditCard = false;
              },
              error => console.error('Error storing cheque', error)
            );
          },
          error => {
            console.error('EEEEEEEEEEEEEE');
            console.error(JSON.stringify(error));
          }
        );
      } else {
        Meteor.call('newCheque', cheque, () => {

        });
        self.cartDataService.resetCart();
        self.hideCashModal();
        self.selectedClient = 0;
        self.creditCard = false;
      }
    } else {
      Meteor.logout();
    }
  }

  printElement(items) {
    var print_txt = '';
    var address = Session.get("THESHOP").address;
    var total = 0;
    var superTotal = 0;

    for (var i = 0; i < items.length; i++) {
      print_txt += this.formatName(items[i].name) + this.formatCount(items[i].cartCount) + this.formatPrice(items[i].price) + this.formatTotal(items[i].price * items[i].cartCount) + '\n';
      total += items[i].price * items[i].cartCount;
    }

    superTotal = total;
    if (this.percent > 0) {
      superTotal = total * (100 - this.percent) / 100;
    }

    console.log('superTotal', superTotal);

    if (total > 0) {
      if (Meteor.isCordova) {

        let lastCheque = {
          "print_txt": print_txt,
          "superTotal": superTotal,
          "total": total,
          "percent": this.percent,
          "user": Meteor.user().profile.name,
          "time": moment().format('MMM Do YYYY, H:mm:ss'),
          "address": address,          
        }

        this.nativeStorage.setItem('lastCheque', lastCheque)
        .then(
          () => console.log('Saved lastCheque!'),
          error => console.error('Error updating lastCheque', error)
        );

        eprint.print(print_txt, superTotal, total, this.percent, Meteor.user().profile.name, moment().format('MMM Do YYYY, H:mm:ss'), address, "USB:/dev/udev/192.168.0.30", (m) => { }, () => { });
      }
    }
    
  }

  formatName(name) {
    if (name.length > 24) {
      name = name.substring(0, 24) + '. ';
    } else {
      var spc = 26 - name.length;
      for (var i = 0; i < spc; i++) {
        name = name + ' ';
      }
    }
    return name;
  }

  formatCount(count) {
    return count + '      ';
  }

  formatPrice(price) {
    return price + '      ';
  }

  formatTotal(total) {
    return '  ' + total;
  }

  incCount(item){
    item.cartCount++;
    this.cartDataService.updateCart(this.cartData);
  }

  decCount(item){
    if(item.cartCount > 1){
      item.cartCount--;
    } else{
      this.cartData = this.cartData.filter(function(el) {
        return el.id !== item.id;
    });
    this.cartDataService.updateCart(this.cartData);
    }
  }
}
