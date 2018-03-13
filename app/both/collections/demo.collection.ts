import { MongoObservable } from "meteor-rxjs";

export const DemoCollection = new MongoObservable.Collection<Demo>("demo-collection");

export const Customers = new MongoObservable.Collection('customers');
export const Shops = new MongoObservable.Collection('shops');
export const Cheques = new MongoObservable.Collection('cheques');
export const Settings = new MongoObservable.Collection('settings');
export const Transactions = new MongoObservable.Collection('transactions');
export const Sessions = new MongoObservable.Collection('sessions');

// Cheques.allow({
//   insert: function (userId, cheque) {
//     return true;
//   }
// });
// if (Meteor.isServer) {
//   Meteor.publish('cheques', function () {
// 
//     if (! this.userId) { return; }
// 
//     return Cheques.find({});
// 
//   });
// }
// Shops.allow({
//   insert: function (userId, shop) {
//     return userId && shop.owner === userId;
//   },
//   update: function (userId, shop) {
//     return userId;
//   },
//   remove: function (userId, shop) {
//     return userId && shop.owner === userId;
//   }
// });

// Settings.allow({
//   insert: function (userId, setting) {
//     return true;
//   }
// });
// 
// Transactions.allow({
//   insert: function (userId, setting) {
//     return true;
//   }
// });
// 
// Sessions.allow({
//   insert: function (userId, setting) {
//     return true;
//   }
// });

export const Images = new FS.Collection("images", {
  stores: [
    new FS.Store.GridFS("original")
  ],
  filter: {
    allow: {
      contentTypes: ['image/*']
    }
  }
});

if (Meteor.isServer) {
  // Images.allow({
  //   insert: function (userId) {
  //     return (userId ? true : false);
  //   },
  //   remove: function (userId) {
  //     return (userId ? true : false);
  //   },
  //   download: function () {
  //     return true;
  //   },
  //   update: function (userId) {
  //     return (userId ? true : false);
  //   }
  // });

  Meteor.publish('images', function() {
    return Images.find({});
  });

  Meteor.publish(null, function () {
      console.log("Server Log: publishing all users : " + this.userId);
      //TODO: current oweners only
      return Meteor.users.find({"profile.owner": this.userId});
  });

  Meteor.publish('shops', function () {
    if (! this.userId) { return; }
    return Shops.find({ owner: this.userId });
  });

  Meteor.publish('shops-nonadmin', function () {
    if (! this.userId) { return; }
    var usr = Meteor.users.find({_id: this.userId}, {fields: {'profile': 1}}).fetch()[0];
    var shop = Shops.find({_id: usr.profile.shop });

    return shop;
  });

  Meteor.publish('products', function () {
    if (! this.userId) { return; }
    return Shops.find({ owner: Meteor.user().profile.owner });
  });

  Meteor.publish('transactions', function () {
    if (! this.userId) { return; }
    return Transactions.find({ cashier: this.userId });
  });

  Meteor.publish('sessions', function () {
    if (! this.userId) { return; }
    return Sessions.find({ cashier: this.userId });
  });
}
