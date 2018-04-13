import {NgModule, ErrorHandler} from "@angular/core";
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular/es2015';
import {Storage} from '@ionic/storage';
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {HttpClientModule, HttpClient} from "@angular/common/http";
import {Constants} from "../../../both/Constants";
import {AppComponent} from "./app.component";
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import {HomePage} from "./pages/home/home";
import {DemoComponent} from "./components/demo/demo.component";
import {DemoDataService} from "./components/demo/demo-data.service";
import {ProductsDataService} from "./components/products/products-data.service";
import {WelcomeHeaderComponent} from "./components/welcome-header/welcome-header";
import {LanguageSelectComponent} from "./components/language-select/language-select";
import {ProductsComponent} from "./components/products/products.component";
import {CartComponent} from "./components/cart/cart.component";
import {NewPagePage} from "./pages/newpage/newpage";
import {CartDataService} from "./components/cart/cart-data.service";
import { ProductsFilterPipe } from './components/products/products-filter.pipe';
import { NativeStorage } from '@ionic-native/native-storage';
import { LocalDataService } from "./local-data.service";

@NgModule({
    // Components/Pages, Pipes, Directive
    declarations: [
        AppComponent,
        HomePage,
        NewPagePage,
        DemoComponent,
        WelcomeHeaderComponent,
        LanguageSelectComponent,
        ProductsComponent,
        CartComponent,
        ProductsFilterPipe
    ],
    // Pages
    entryComponents: [
        AppComponent,
        HomePage
    ],
    // Providers
    providers: [
        DemoDataService,
        ProductsDataService,
        CartDataService,
        LocalDataService,
        NativeStorage,
        {
            provide: ErrorHandler,
            useClass: IonicErrorHandler
        },
        SplashScreen,
        StatusBar
    ],
    // Modules
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        IonicModule.forRoot(AppComponent, {
            //// http://ionicframework.com/docs/v2/api/config/Config/
            //mode: Constants.STYLE.MD,
            //pageTransition: Constants.STYLE.IOS,
            //swipeBackEnabled: false,
            //tabbarPlacement: 'top'
        })
    ],
    // Main Component
    bootstrap: [IonicApp]
})
export class AppModule {
    constructor() {

    }
}

export function createTranslateLoader(http:HttpClient) {
    return new TranslateHttpLoader(http, '/i18n/', '.json');
}
