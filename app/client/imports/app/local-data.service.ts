import { Injectable } from "@angular/core";
import { ObservableCursor } from "meteor-rxjs";
import {Constants} from "../../../both/Constants";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class LocalDataService {
  private data: ObservableCursor<any>;
  private localDataSource = new BehaviorSubject<any[]>([]);
  currentLocalServiceData = this.localDataSource.asObservable();

  constructor(
    private nativeStorage: NativeStorage
  ) 
  {
    
  }

  updateLocalSession(session){
    if (Meteor.isCordova) {
        this.nativeStorage.setItem('localSession', session)
        .then(
            ()=>{
            this.localDataSource.next(session);
        },
    (error)=>{
        console.log("EEEEEESERVICE");
        
    })
    }
  }
  
  
}
