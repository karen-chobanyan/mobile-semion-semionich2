import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { MeteorComponent } from 'angular2-meteor';
import { Platform, LoadingController, Loading } from 'ionic-angular/es2015';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Constants } from "../../../both/Constants";
import { HomePage } from "./pages/home/home";
import { TranslateService } from "@ngx-translate/core";
import { NativeStorage } from '@ionic-native/native-storage';
import { LocalDataService } from "./local-data.service";
import * as moment from 'moment';

@Component({
  selector: "ion-app",
  templateUrl: "app.component.html"
})
export class AppComponent extends MeteorComponent implements OnInit {
  @ViewChild('leftMenu') leftMenu: any;
  @ViewChild('content') nav: any;

  // Set the root (or first) page
  public rootPage: any = HomePage;
  public appName: string;
  public user: Meteor.User;
  public pages: Array<INavigationMenuPage>;
  public userPages: Array<INavigationMenuPage>;
  public noUserPages: Array<INavigationMenuPage>;
  private isLoading: boolean = false;
  private loading: Loading;
  private closeSessionHidden: boolean = true;
  private transactionsModalHidden: boolean = true;
  public closeAmount: number;
  public closeComment: string;
  public transactionAmount: number;
  public transactionComment: string;
  public transactionType: string;
  public language:string;
  public langCode:string;
  public closing:boolean = false;

  constructor(public platform: Platform,
    public loadingCtrl: LoadingController,
    public zone: NgZone,
    public translate: TranslateService,
    private splashscreen: SplashScreen,
    private statusbar: StatusBar,
    private nativeStorage: NativeStorage,
    public localDataService: LocalDataService) {
    super();
    this.langCode = Session.get(Constants.SESSION.LANGUAGE);
    this.language = this.translate.instant("language");
  }

  ngOnInit() {
    this.initializeApp();
    Meteor.logout();
    this.autorun(() => this.zone.run(() => {
      this.user = Meteor.user();
      console.log("user: ", this.user);

      if (Meteor.user()) {
        Session.set("USER", Meteor.user());
      }
    }));

    this.autorun(() => this.zone.run(() => {
      if (Session.get(Constants.SESSION.PLATFORM_READY)) {
        this.platformReady();
        Session.set(Constants.SESSION.PLATFORM_READY, false);
      }
    }));

    this.translate.onLangChange.subscribe(() => {
      Session.set(Constants.SESSION.TRANSLATIONS_READY, true);
    });

    this.autorun(() => {
      if (Session.get(Constants.SESSION.LOADING)) {
        if (this.nav) {
          Meteor.setTimeout(() => {
            if (!this.loading && Session.get(Constants.SESSION.LOADING)) {
              this.loading = this.loadingCtrl.create({
                spinner: 'crescent'
              });
              this.loading.present();
              this.isLoading = true;
            }
          }, 500);
        }
      } else {
        if (this.isLoading && this.loading) {
          this.loading.dismiss();
          this.loading = null;
        }
      }
      if (Session.get(Constants.SESSION.TRANSLATIONS_READY)) {
        this.translate.get('language').subscribe((translation:string) => {
            this.language = translation;
        });
        if (Session.get(Constants.SESSION.LANGUAGE)) {
          this.langCode = Session.get(Constants.SESSION.LANGUAGE);
          this.language = this.translate.instant("language");
        }
    }
    });
    this.initializeTranslateServiceConfig();
    this.setStyle();
    
  }


  private initializeApp(): void {
    this.platform.ready().then(() => {
      if (Meteor.isCordova) {
        this.splashscreen.hide();
      }
      Session.set(Constants.SESSION.PLATFORM_READY, true);
    });
  }

  private platformReady(): void {
    this.initializeTranslateServiceConfig();
    this.setStyle();
  }

  private initializeTranslateServiceConfig() {
    var prefix = '/i18n/';
    var suffix = '.json';

    var userLang = navigator.language.split('-')[0];
    userLang = 'ru';

    this.translate.setDefaultLang('ru');
    let langPref = Session.get(Constants.SESSION.LANGUAGE);
    if (langPref) {
      userLang = langPref;
    }
    Session.set(Constants.SESSION.LANGUAGE, userLang);
    this.translate.use(userLang);
    console.log(this.translate);
  }

  private setStyle(): void {
    var links: any = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute("rel").indexOf("style") != -1 && link.getAttribute("title")) {
        link.disabled = true;
        if (link.getAttribute("title") === this.getBodyStyle())
          link.disabled = false;
      }
    }
  }

  private getBodyStyle(): string {
    var bodyTag: any = document.getElementsByTagName("ion-app")[0];
    var bodyClass = bodyTag.className;
    var classArray = bodyClass.split(" ");
    var bodyStyle = classArray[2];
    return bodyStyle;
  }

  private openPage(page: INavigationMenuPage) {
    this.navigate({ page: page.component, setRoot: page.rootPage });
  }

  private navigate(location: { page: any, setRoot: boolean }): void {
    this.leftMenu.close().then(() => {
      if (location.page) {
        let viewCtrl = this.nav.getActive();
        if (viewCtrl.component !== location.page) {
          if (location.setRoot) {
            this.nav.setRoot(location.page);
          } else {
            this.nav.push(location.page);
          }
        }
      }
    });
  }

  private logOut(): void {
    
    Meteor.logout();

  }

  closeSession() {
    let self = this;
    var currentSession:any = {};
    currentSession._id = Session.get('SESSID');
    currentSession.closeCash = this.closeAmount;
    currentSession.closeComment = this.closeComment;
    currentSession.shop = Session.get('THESHOPID');
    this.closing = true;
    Meteor.call('closeSession', currentSession, function() {
      self.closeSessionHidden = true;
      self.closeAmount = null;
      self.closeComment = '';
      Session.set('SESSID', null);
      this.closing = false;
    });

    if (Meteor.isCordova) {
      this.nativeStorage.clear()
        .then(
        () => console.log('Cleared!'),
        error => {
          console.error('Error storing cheque');
          console.error(JSON.stringify(error));
        }
        );
    }

    
    Meteor.logout();
    
  }

  openCloseSession() {
    this.closeSessionHidden = false;
  }

  cancelCloseSession() {
    this.closeSessionHidden = true;
  }

  openTransactionModal() {
    this.transactionsModalHidden = false;
  }

  closeTransactionModal() {
    this.transactionsModalHidden = true;
  }

  createTransaction() {
    if (!!this.transactionAmount && !!this.transactionComment) {
      var transaction: any = {};
      transaction.amount = this.transactionAmount;
      transaction.comment = this.transactionComment;
      transaction.cashier = Session.get("USER")._id;
      transaction.type = this.transactionType;
      transaction.shop = Session.get('THESHOPID');
      transaction.session = Session.get('SESSID');
      console.log(transaction);

      if (Meteor.isCordova) {
        this.nativeStorage.getItem('localTransactions')
        .then(
          data => {
            console.log('JSON.stringify(data)');
            console.log(JSON.stringify(data));
            data.push(transaction);
            this.nativeStorage.setItem('localTransactions', data)
            .then(
              () => {
                console.log('Stored transaction!');
                if(transaction.type == 'income'){
                  this.updateLocalSessionCash( transaction.amount );
                } else {
                  this.updateLocalSessionCash( -transaction.amount );
                }
                
                Meteor.call('newTransaction_updated', transaction, () => {

                });
              },
              error => {
                console.error('Error storing transaction');
                error => console.error(error)
              }
            );
          },
          error => {
            console.error('EEEEEEEEEEEEEE');
            console.error(JSON.stringify(error));
          }
        );
      } else {
        Meteor.call('newTransaction_updated', transaction, () => {

        });

      }
      this.transactionAmount = null;
      this.transactionComment = '';
      this.transactionsModalHidden = true;

    }
    else {
    }
  }

  updateLocalSessionCash(change) {
    this.nativeStorage.getItem('localSession')
      .then(
      session => {
        session.cash = session.cash + change;
        session.cheques += 1;
        this.localDataService.updateLocalSession(session);
        // this.nativeStorage.setItem('localSession', session)
        //   .then(
        //     () => console.log('Updated SESSION!'),
        //     error => {
        //       console.error('Error updating session');
        //       console.error( error)
        //     }
        //   );
      },
      error => console.error(error)
      )
  }

  printLatestCheque(){
    if (Meteor.isCordova) {
      this.nativeStorage.getItem('lastCheque')
      .then(
        (lastCheque) => {          
          eprint.print(
            lastCheque.print_txt, 
            lastCheque.superTotal, 
            lastCheque.total, 
            lastCheque.percent, 
            lastCheque.user, 
            lastCheque.time, 
            lastCheque.address, 
            "USB:/dev/udev/192.168.0.30", 
            (m) => { }, 
            () => { }
          );
        },
        error => console.error('Error printing lastCheque', error)
      );
    }
  }

  printDailyReport(){
    if (Meteor.isCordova) {
      let reportItems = [];
      let clientSales = [];
      let clientSalesPr = [];
      let totalTransactions = 0;
      let totalSales =0;
      let superTotal = 0;
      let total = 0;
      this.nativeStorage.getItem('localCheques')
      .then( (cheques) =>{
        console.log('localCheques: ');
        console.log(JSON.stringify(cheques));
        let theShop = Session.get("THESHOP");
        for(var k = 0; k < theShop.clients.length; k++){
          clientSales.push({
            clientId: theShop.clients[k].id, 
            clientName: theShop.clients[k].name,
            clientSale: 0,
          })
        }

        for (var j = 0; j < cheques.length; j++) {
          superTotal += cheques[j].total;
        }

        for (var i = 0; i < theShop.products.length; i++) {
          let sold = 0;
          for (var j = 0; j < cheques.length; j++) {
            if(!!cheques[j].items){
              for (var k = 0; k < cheques[j].items.length; k++) {
                
                if (cheques[j].items[k].id == theShop.products[i].id) {
                  sold += cheques[j].items[k].cartCount;                  
                  if(!!cheques[j].client){
                    let client = theShop.clients.filter(client => client.id == cheques[j].client)[0];
                    let sale = cheques[j].items[k].cartCount * cheques[j].items[k].price * client.percent * 0.01;
                    for(var g = 0; g < clientSales.length; g++){
                      if(clientSales[g].clientId == cheques[j].client){
                        clientSales[g].clientSale += sale;
                      }
                    }
                    
                  }
                }
              }
            }
          }
          if(sold > 0){
            reportItems.push({
              name : theShop.products[i].name,
              count: sold,
              price: theShop.products[i].price,
              itog: sold * theShop.products[i].price         
            })
          }
        }
        this.nativeStorage.getItem('localTransactions')
        .then((transactions) => {
          let print_txt = '';

          for (var i = 0; i < reportItems.length; i++) {
            print_txt += this.formatName(reportItems[i].name) + this.formatCount(reportItems[i].count) + this.formatPrice(reportItems[i].price) + this.formatTotal(reportItems[i].itog) + '\n';
          }

          print_txt += "*****************Скидки******************" + '\n'
          for (var i = 0; i < clientSales.length; i++) {
            print_txt += this.formatName(clientSales[i].clientName) + this.formatCount(clientSales[i].clientSale) + '\n';
            totalSales += clientSales[i].clientSale;
          }

          print_txt += "****************Транзакции***************" + '\n'

          for (var i = 0; i < transactions.length; i++) {
            let amnt = transactions[i].amount;
            if(transactions[i].type != 'income'){
              amnt = -transactions[i].amount;
            }
            totalTransactions += amnt;
            print_txt += this.formatTrName(transactions[i].type) + this.formatTrComment(transactions[i].comment) + amnt + '\n';
          }

          this.nativeStorage.getItem('localSession')
          .then(localSession =>{
            let openCash = localSession.openCash;
            eprint.printReport(
              print_txt,
              localSession.creditCard,
              openCash,
              superTotal, 
              localSession.cash,
              totalSales, 
              totalTransactions,  
              Meteor.user().profile.name, 
              moment().format('MMM Do YYYY, H:mm:ss'), 
              theShop.address, 
              "USB:/dev/udev/192.168.0.30", 
              (m) => { }, 
              () => { }
            );
          })         
        })
      }
      );
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

  formatTrName(name) {
    if (name.length > 12) {
      name = name.substring(0, 12) + '. ';
    } else {
      var spc = 14 - name.length;
      for (var i = 0; i < spc; i++) {
        name = name + ' ';
      }
    }
    return name;
  }

  formatTrComment(name) {
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

}

interface INavigationMenuPage {
  icon?: string,
  title: string,
  component: any,
  rootPage?: boolean
}
