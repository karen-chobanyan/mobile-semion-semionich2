import { MongoObservable } from "meteor-rxjs";

export const Customers = new MongoObservable.Collection('customers');
export const Shops = new MongoObservable.Collection('shops');
export const Cheques = new MongoObservable.Collection('cheques');
export const Settings = new MongoObservable.Collection('settings');
export const Transactions = new MongoObservable.Collection('transactions');
export const Sessions = new MongoObservable.Collection('sessions');

var reportStore = new FS.Store.S3("reports", {
  region: "eu-central-1", //optional in most cases
  accessKeyId: "AKIAJSU3RBHJF77TVQBA", //required if environment variables are not set
  secretAccessKey: "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", //required if environment variables are not set
  bucket: "oywuploads", //required
  // ACL: "public", //optional, default is 'private', but you can allow public or secure access routed through your app URL
  folder: "reports", //optional, which folder (key prefix) in the bucket to use 
  // The rest are generic store options supported by all storage adapters
  // transformWrite: myTransformWriteFunction, //optional
  // transformRead: myTransformReadFunction, //optional
  // maxTries: 1 //optional, default 5
});

export const Reports = new FS.Collection("reports", {
  stores: [reportStore]
});

export const Deliveries = new MongoObservable.Collection('deliveries', {
  transform: (delivery) => {

    delivery.user = Meteor.users.findOne( delivery.cashier );

    return delivery
  }
});

Deliveries.allow({
  insert: function (userId, delivery) {
    return true;
  }
});

if (Meteor.isServer) {
  Meteor.publish('deliveries', function () {

    if (! this.userId) { return; }
    var deliveries = Deliveries.find({}, {sort: {timestamp: -1}, limit: 150});
    return deliveries;

  });
}

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
