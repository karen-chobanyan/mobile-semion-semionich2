import { Email } from 'meteor/email';
import {Sessions, Cheques, Shops, Transactions, Deliveries, Reports} from "./both/collections/demo.collection";
import { check } from 'meteor/check';

if (Meteor.isServer) {
Meteor.methods({
  newShop(shop) {
    shop.timestamp = new Date();
    let shopId = Shops.insert(shop);
    return shopId;
  },
  updateShop(shop) {
    shop.timestamp = new Date();
    let shopId = Shops.update({
      _id: shop._id
    }, {
      $set: {
        name: shop.name,
        address: shop.address
      }
    });
    return shopId;
  },

  deleteShop(shopid) {
    if (!!shopid) {
      Shops.remove(shopid);
    }
  },

  newProduct(product) {
    product.timestamp = new Date();
    let shopId = Shops.update({
      _id: product.shop
    }, {
      $push: {
        products: product
      }
    });
    return shopId;
  },

  deleteProduct(product) {
    let shopId = Shops.update({
      _id: product.shop
    }, {
      $pull: {
        products: {
          id: product.id
        }
      }
    });
    return shopId;
  },

  updateProduct(shop_id, index, product) {
    console.log("Updating");
    console.log(shop_id + ' * ' + index + ' * ' + product);
    if(!shop_id){
      console.log("noshop");
      return "No Shop selected!";
    }
    delete product.$$hashKey;
    var modifier = {};
    modifier["products." + index] = product;
    console.log(modifier);
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },
  /********Start Product Categories**********/
  newCategory(cat) {
    if(!!cat.shop){
      return "No Shop selected!";
    }
    cat.timestamp = new Date();
    let shopId = Shops.update({
      _id: cat.shop
    }, {
      $push: {
        product_cats: cat
      }
    });
    return shopId;
  },

  deleteCategory(cat) {
    if(!!cat.shop){
      return "No Shop selected!";
    }
    let shopId = Shops.update({
      _id: cat.shop
    }, {
      $pull: {
        product_cats: {
          id: cat.id
        }
      }
    });
    return shopId;
  },

  updateCategory(shop_id, index, category) {
    var modifier = {};
    delete category.$$hashKey;
    modifier["product_cats." + index] = category;
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },

  /********Ingredients**********/

  newIngredient(ing) {
    ing.timestamp = new Date();
    let shopId = Shops.update({
      _id: ing.shop
    }, {
      $push: {
        ingredients: ing
      }
    });
    return shopId;
  },

  deleteIngredient(ing) {
    let shopId = Shops.update({
      _id: ing.shop
    }, {
      $pull: {
        ingredients: {
          id: ing.id
        }
      }
    });
    return shopId;
  },

  updateIngredient(shop_id, index, ingredient) {
    delete ingredient.$$hashKey;
    var modifier = {};
    modifier["ingredients." + index] = ingredient;
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },

  newIngCategory(cat) {
    cat.timestamp = new Date();
    let shopId = Shops.update({
      _id: cat.shop
    }, {
      $push: {
        ingredient_cats: cat
      }
    });
    return shopId;
  },

  deleteIngCategory(cat) {
    let shopId = Shops.update({
      _id: cat.shop
    }, {
      $pull: {
        ingredient_cats: {
          id: cat.id
        }
      }
    });
    return shopId;
  },

  updateIngCategory(shop_id, index, category) {
    var modifier = {};
    delete category.$$hashKey;
    modifier["ingredient_cats." + index] = category;
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },
  /********End of Product Categories**********/

  /*********** Cheques **********/

  newCheque(cheque) {
    cheque.timestamp = new Date();
    let theShop = Shops.find({
      _id: cheque.shop
    }).fetch()[0];
    let products = theShop.products;
    for (var i = 0; i < cheque.items.length; i++) {
      delete cheque.items[i].$$hashKey;
      for (var j = 0; j < products.length; j++) {
        if (products[j].id == cheque.items[i].id) {
          if (!!products[j].count) {
            products[j].count -= cheque.items[i].count;
          } else {
            products[j].count = -cheque.items[i].count;
          }
        }
      }
    }
    let shopId = Shops.update({
      _id: cheque.shop
    }, {
      $set: {
        products: products
      }
    });
    let chequeId = Cheques.insert(cheque);
    if(cheque.creditCard){
      let sessionId = Sessions.update({
        _id: cheque.session
      }, {
        $inc:{cheques: 1, total_sales: cheque.total, creditCard: cheque.total}
      });
    } else {
      let sessionId = Sessions.update({
        _id: cheque.session
      }, {
        $inc:{cheques: 1, total_sales: cheque.total, cash: cheque.total}
      });
    }

    console.log(chequeId, sessionId);
    return chequeId;
  },

  newDelivery(delivery) {
  delivery.timestamp = new Date();
  let theShop = Shops.find({
    _id: delivery.shop
  }).fetch()[0];
  let products = theShop.products;
  for (var i = 0; i < delivery.items.length; i++) {
    delete delivery.items[i].$$hashKey;
    for (var j = 0; j < products.length; j++) {
      if (products[j].id == delivery.items[i].product_id) {
        if (!!products[j].count) {
          products[j].count += delivery.items[i].count;
        } else {
          products[j].count = delivery.items[i].count;
        }
      }
    }
  }
  let shopId = Shops.update({
    _id: delivery.shop
  }, {
    $set: {
      products: products
    }
  });
  let deliveryId = Deliveries.insert(delivery);
  return deliveryId;
},

  /*********** End Cheques **********/

  newTransaction(transaction) {
    transaction.timestamp = new Date();
    let transactionId = Transactions.insert(transaction);
    return transactionId;
  },
  
  newTransaction_updated(transaction) {
    transaction.timestamp = new Date();
    let transactionId = Transactions.insert(transaction);
    
    let amount = -transaction.amount;
    if(transaction.type == 'income'){
      amount = transaction.amount;
    }
    
    let sessionId = Sessions.update({
      _id: transaction.session
    }, {
      $inc:{ cash: amount}
    });
    return transactionId;
  },
  
  newSession(session) {
    session.opentime = new Date();
    session.total_sales = 0;
    session.cheques = 0;
    var c = session.openCash || 0;
    session.creditCard = 0;
    session.openCash = c;
    let sessionId = Sessions.insert(session);
    return sessionId;
  },

  updateSession(session) {
    session.updatetime = new Date();
    let sessionId = Sessions.update({
      _id: session._id
    }, {
      $set: {
        cash: session.cash,
        total_sales: session.total_sales
      }
    });
    return sessionId;
  },

  syncSession(session){
    session.updatetime = new Date();
    let sessionId = Sessions.update({
      _id: session._id
    }, session);
    return sessionId;
  },

  closeSession(session) {
    session.closetetime = new Date();
    console.log('session', session);
    let sessionId = Sessions.update({
      _id: session._id
    }, {
      $set: {
        closed: true,
        closeCash: session.closeCash,
        closeComment: session.closeComment
      }
    });
    Meteor.call('buildDailyReport', session.shop);
    return sessionId;
  },

  /*******************Tech Cards***********************/

  newTechCard(card) {
    card.timestamp = new Date();
    for (var i = 0; i < card.techingredients.length; i++) {
      delete card.techingredients[i].$$hashKey;
    }
    let shopId = Shops.update({
      _id: card.shop
    }, {
      $push: {
        techcards: card
      }
    });
    return shopId;
  },

  updateTechCard(shop_id, index, card) {
    delete card.$$hashKey;
    for (var i = 0; i < card.techingredients.length; i++) {
      delete card.techingredients[i].$$hashKey;
    }
    var modifier = {};
    modifier["techcards." + index] = card;
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },

  deleteTechCard(card) {
    let shopId = Shops.update({
      _id: card.shop
    }, {
      $pull: {
        techcards: {
          id: card.id
        }
      }
    });
    return shopId;
  },

  //Statistics
  getChartData(shopId, timestamp){
    cheques = Sessions.find(
        {
          shop: shopId,
          opentime: timestamp
        },{fields:{total_sales: 1, opentime: 1, cheques: 1}}
      ).fetch();
      var chartData = {
        datasets: [{
          label: "My First dataset",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: []
        }, {
          label: "My Second dataset",
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: []
        }]
      };
      var date = moment();
      var end = moment().subtract(6, 'days');
      var days = moment(timestamp.$lt).diff(moment(timestamp.$gte), 'days');
      vals = [];
      counts = [];
      cartLabels = [];
      for (var i = days; i >= 0; i--) {
        var val = 0;
        var count = 0;
        var date = moment(timestamp.$lt).subtract(i, 'days');
        cartLabels.push(date.format('MMMM DD').toString());
        var dday = date.toDate().getDate();
        var dmonth = date.toDate().getMonth();
        var dyear = date.toDate().getYear();
        for (var j = 0; j < cheques.length; j++) {
          if (cheques[j].opentime.getDate() == dday && cheques[j].opentime.getMonth() == dmonth && cheques[j].opentime.getYear() == dyear) {
            val = cheques[j].total_sales;
            count=cheques[j].cheques;
          }
        }
        vals.push(val);
        counts.push(count);
      }

      chartData.labels = cartLabels;
      chartData.datasets[0].data = vals;
      chartData.datasets[1].data = counts;
      return chartData;
  },
  updateAllSessions2(){
    var sess = Sessions.find({}).fetch();
    console.log(sess.length);
    for (var j = 0; j < sess.length; j++) {
      console.log('Updtainf the Session ' + sess[j]._id);
      let ssId = Sessions.update({
        _id: sess[j]._id
      }, {
        $set: {
          cheques: 0,
        }
      });
    }
  },
  
  updateAllSessions2(){
    var timestamp = {
      $gte: moment().subtract(10, 'day').toDate(),
      $lt: moment().toDate()
    };
    console.log('Updating Sessions');
    cheques = Cheques.find(
        {
          timestamp: timestamp
        }
      ).fetch();
      console.log('Got cheques' + cheques.length);
        for (var j = 0; j < cheques.length; j++) {
          console.log('Updtainf the Session ' + cheques[j].session);
          var sess = Sessions.findOne(cheques[j].session);
          console.log('Updtainf the Session !!!' + cheques[j].session);

              sess.cheques += 1;
              console.log('sess.cheques');
              console.log(sess.cheques);
            
            let ssId = Sessions.update({
              _id: sess._id
            }, {
              $set: {
                cheques: sess.cheques,
              }
            });
        }
      
  },

  // buildExcel(shopId, timestamp){
  //   var theShop = Shops.findOne(shopId);
  //   var cheques = Cheques.find(
  //       {
  //         shop: shopId,
  //         timestamp: timestamp
  //       }
  //     ).fetch();
  //   var excelObj = [];
  //   var sold = 0;
  //
  //   for (var i = 0; i < theShop.products.length; i++) {
  //     sold = 0;
  //     for (var j = 0; j < cheques.length; j++) {
  //       if(!!cheques[j].items){
  //         for (var k = 0; k < cheques[j].items.length; k++) {
  //           if (cheques[j].items[k].id == theShop.products[i].id) {
  //             sold += cheques[j].items[k].count;
  //           }
  //         }
  //       }
  //     }
  //       excelObj.push({
  //         Name : theShop.products[i].name,
  //         Count : theShop.products[i].count,
  //         Price: theShop.products[i].price,
  //         Itog: theShop.products[i].count * theShop.products[i].price,
  //         Sold: sold
  //       })
  //   }
  //   return excelObj;
  // },

  buildExcel(shopId, timestamp){
    var theShop = Shops1.findOne(shopId);
    var cheques = Cheques.find(
        {
          shop: shopId,
          timestamp: timestamp
        }
      ).fetch();
    var clients = theShop.clients;
    console.log('excel');
    var excelObj = [];
    var sold = 0;
    var sold_sale = [];
    for(var k = 0; k < theShop.clients.length; k++){
      sold_sale[k][theShop.clients[k].id] = 0;
    }
    
    for (var i = 0; i < theShop.products.length; i++) {
      sold = 0;
      for (var j = 0; j < cheques.length; j++) {
        if(!!cheques[j].items){
          for (var k = 0; k < cheques[j].items.length; k++) {
            if (cheques[j].items[k].id == theShop.products[i].id) {
              if(!cheques[j].client){
                sold += cheques[j].items[k].count;
              } else{
                var client = {};
                for(var k = 0; k < theShop.clients.length; k++){
                  if(theShop.clients[k].id == cheques[j].client){
                    client = theShop.clients[k];
                    
                  }
                }
              }
            }
          }
        }
      }
        excelObj.push({
          Name : theShop.products[i].name,
          Count : theShop.products[i].count,
          Sold_sale: sold_sale,
          Price: theShop.products[i].price,
          Itog: theShop.products[i].count * theShop.products[i].price,
          Sold: sold
          
        })
      }
        var headerRow = '<ss:Row>\n';
          
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += 'Наименование</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        // headerRow += '<ss:Cell>\n';
        // headerRow += '<ss:Data ss:Type="String">';
        // headerRow += 'Кол. Приход</ss:Data>\n';
        // headerRow += '</ss:Cell>\n';
        
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += 'Кол. Продано</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq ' + theShop.clients.length);
        for(var i = 0; i < theShop.clients.length; i++){
          headerRow += '<ss:Cell>\n';
          headerRow += '<ss:Data ss:Type="String">';
          headerRow += theShop.clients[i].name;
          headerRow += '</ss:Data>\n';
          headerRow += '</ss:Cell>\n';
        }
        
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += 'Кол. Остаток</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += 'Цена</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += 'Итого</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        headerRow += '</ss:Row>\n';
        
        var header = '<?xml version="1.0"?>\n' + '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' + '<ss:Worksheet ss:Name="Sheet1">\n' + '<ss:Table>\n\n' + headerRow;
        var footer ='\n</ss:Table>\n' + '</ss:Worksheet>\n' + '</ss:Workbook>\n';

          var row;
          var col;
          var xml;
          var data = typeof excelObj != "object" ? JSON.parse(excelObj) : excelObj;


          console.log('building');
          for (row = 0; row < data.length; row++) {
            xml += '<ss:Row>\n';
            var h = 0
            for (col in data[row]) {
              if(h == 2){
                for(var l = 0; l < sold_sale.length; l++){
                  xml += '<ss:Cell>\n';
                  xml += '<ss:Data ss:Type="String">';
                  xml += data[row][col][l][Object.keys(data[row][col][l])[0]] + '</ss:Data>\n';
                  xml += '</ss:Cell>\n';
                }
              } else{
                xml += '<ss:Cell>\n';
                xml += '<ss:Data ss:Type="String">';
                xml += data[row][col] + '</ss:Data>\n';
                xml += '</ss:Cell>\n';
              }
              h++;
            }

            xml += '</ss:Row>\n';
          }
          console.log('Built');
          var to = '', from = '', subject = '', html = '';

          // const fs = Meteor.npmRequire('file-system');
          // var p = process.env.PWD;
          var file_name = theShop.name + "-" + new Date().toISOString().slice(0, 10) + ".xls";
          // console.log(p);
          // fs.writeFileSync(p + '/public/' + file_name, header + xml + footer, 'utf8');

          var company_logo = Meteor.absoluteUrl() + 'logo.png';
          var excel_icon = Meteor.absoluteUrl() + 'excel-xls-icon.png';
          var download_link = '<a target="_blank" download='+ file_name +' href='+ Meteor.absoluteUrl() + file_name +' style="text-decoration: none;font-size: 14px;font-family: receiptFont;display: flex;font-weight: 600;align-items: center;"><img style="width:30px;margin-right:10px;" src='+ excel_icon +' />Скачать - '+ file_name +'</a>';

          from = "Atero Backery";
          to = 'karen@atero.solutions';
          subject = 'Ежедневный отчет';
          html = '<img width="150" src='+ company_logo +' /><br><h3 style="display: inline-block;margin-right: 6px;font-family: receiptFont;">Семён Семёныч</h3><h4 style="display: inline-block;font-family: receiptFont;"> приветствует Вас.</h4><hr style"margin-top: 20px;margin-bottom: 20px;border: 0;border-top: 1px solid #eee;>' + download_link;

          Meteor.call('sendEmail', to, from, subject, html);

  },

  sendEmail(to, from, subject, html) {
    check([from, subject, html], [String]);
    this.unblock();
    Email.send({ to, from, subject, html });
  },
  
  buildDailyReport(shopId){
    console.log("shopId: ", shopId);
    var theShop = Shops.findOne(shopId);
    let timestamp = {
      $gte: moment().startOf('day').toDate(),
      $lt: moment().endOf('day').toDate()
    };
    var cheques = Cheques.find(
        {
          shop: shopId,
          timestamp: timestamp
        }
      ).fetch();
    let deliveries = Deliveries.find(
      {
        shop: shopId,
        timestamp: timestamp
      }
    ).fetch();
    console.log('excel',deliveries.length);
    var excelObj = [];
    var sold = 0;
    var delivered = 0;
    var sold_sale = {};

    for (var i = 0; i < theShop.products.length; i++) {
      //calculate sold
      for(var f = 0; f < theShop.clients.length; f++){
        sold_sale[theShop.clients[f].id] = 0;
      }
      sold = 0;
      
      for (var j = 0; j < cheques.length; j++) {
        if(!!cheques[j].items){
          for (var k = 0; k < cheques[j].items.length; k++) {
            if (cheques[j].items[k].id == theShop.products[i].id) {
              // sold += cheques[j].items[k].count;
              if (cheques[j].items[k].id == theShop.products[i].id) {
                if(!cheques[j].client){
                  sold += cheques[j].items[k].count;
                } else{
                  var client = {};
                  for(var p = 0; p < theShop.clients.length; p++){
                    if(!!cheques[j].client && theShop.clients[p].id == cheques[j].client){
                      client = theShop.clients[p];                      
                      sold_sale[cheques[j].client] += cheques[j].items[k].count;  
                      console.log(sold_sale);               
                    }
                  }
                }
              }
            }
          }
        }
      }
      //calculate deliveries
      delivered = 0;
      for (var j = 0; j < deliveries.length; j++) {
        if(!!deliveries[j].items){
          for (var k = 0; k < deliveries[j].items.length; k++) {
            if (deliveries[j].items[k].product_id == theShop.products[i].id) {
              delivered += deliveries[j].items[k].count;
            }
          }
        }
      }
        excelObj.push({
          Name : theShop.products[i].name,
          Price: theShop.products[i].price,
          Delivered: delivered,
          Sold: sold,
          Sold_sale: JSON.parse(JSON.stringify(sold_sale)),
          Remain : delivered - sold,
          Itog: sold * theShop.products[i].price,
          Rem_tot: theShop.products[i].count
        })
      }
      
      var headerRow = '<ss:Row>\n';
        
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Наименование</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Цена</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Кол. Приход</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Кол. Продано</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq ' + theShop.clients.length);
      for(var i = 0; i < theShop.clients.length; i++){
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += theShop.clients[i].name;
        headerRow += '</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
        
        headerRow += '<ss:Cell>\n';
        headerRow += '<ss:Data ss:Type="String">';
        headerRow += theShop.clients[i].name + ' Итого';
        headerRow += '</ss:Data>\n';
        headerRow += '</ss:Cell>\n';
      }
      
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Кол. Остаток</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Итого</ss:Data>\n';
      headerRow += '</ss:Cell>\n';

      headerRow += '<ss:Cell>\n';
      headerRow += '<ss:Data ss:Type="String">';
      headerRow += 'Остаток</ss:Data>\n';
      headerRow += '</ss:Cell>\n';
      
      headerRow += '</ss:Row>\n';
        var header = '<?xml version="1.0"?>\n' + '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' + '<ss:Worksheet ss:Name="Sheet1">\n' + '<ss:Table>\n\n' + headerRow;
        var footer ='\n</ss:Table>\n' + '</ss:Worksheet>\n' + '</ss:Workbook>\n';

          var row;
          var col;
          var xml='';
          var data = typeof excelObj != "object" ? JSON.parse(excelObj) : excelObj;
          // console.log('data.length' + data.length);
          for (row = 0; row < data.length; row++) {
            xml += '<ss:Row>\n';
            var g = 0;
            var h=0;
            for (col in data[row]) {
              // xml += '<ss:Cell>\n';
              //   if (g == 0) {
              //     xml += '<ss:Data ss:Type="String">';
              //     xml += data[row][col].replace('&', '&amp;')  + '</ss:Data>\n';
              //   } else{
              //     xml += '<ss:Data ss:Type="Number">';
              //     xml += data[row][col]+ '</ss:Data>\n';
              //   }
              // 
              // xml += '</ss:Cell>\n';
              // g++;
              var prc = data[row]['Price'];
              // if(h == 1){prc = data[row][col];}
              if(h == 4){
                for( var l in data[row][col] ){                  
                    xml += '<ss:Cell>\n';
                    xml += '<ss:Data ss:Type="Number">';
                    xml += data[row][col][l];
                    xml += '</ss:Data>\n';
                    xml += '</ss:Cell>\n';         
                    var perc = 0;
                    
                    for(var f = 0; f < theShop.clients.length; f++){
                      if(theShop.clients[f].id == l){
                        perc = (100 - theShop.clients[f].percent)/100;
                      }
                    }
                    
                    xml += '<ss:Cell>\n';
                    xml += '<ss:Data ss:Type="Number">';
                      // console.log(prc, ' * ', perc);
                    xml += data[row][col][l] * data[row]['Price'] * perc;
                    data[row]['Itog'] += data[row][col][l] * data[row]['Price'] * perc;
                    xml += '</ss:Data>\n';
                    xml += '</ss:Cell>\n';          
                  

                }
              } else{
                xml += '<ss:Cell>\n';
                xml += '<ss:Data ss:Type="String">';
                xml += data[row][col] + '</ss:Data>\n';
                xml += '</ss:Cell>\n';
                // xml += '<ss:Cell>\n';
                //   if (h == 0) {
                //     xml += '<ss:Data ss:Type="String">';
                //     xml += data[row][col].replace('&', '&amp;')  + '</ss:Data>\n';
                //   } else{
                //     xml += '<ss:Data ss:Type="Number">';
                //     xml += data[row][col]+ '</ss:Data>\n';
                //   }
                // 
                // xml += '</ss:Cell>\n';
              }
              h++;
              
            }

            xml += '</ss:Row>\n';
          }

          var to = '', from = '', subject = '', html = '';

          // const fs = Meteor.npmRequire('file-system');
          // var p = process.env.PWD;
          var file_name = theShop.name + "-" + new Date().toISOString().slice(0, 10) + ".xls";
          
          // fs.writeFileSync(p + '/public/' + file_name, header + xml + footer, 'utf8');
          var report = new FS.File();
          console.log('attach start');
          data = new Buffer(header + xml + footer);
          report.attachData(data, {type: 'application/xml'});
          console.log('attach end');
          report.name(file_name);
          console.log('insert start');
          let repID = Reports.insert(report);
          console.log('insert end');
          console.log('url');
          var company_logo = Meteor.absoluteUrl() + 'logo.png';
          var excel_icon = Meteor.absoluteUrl() + 'excel-xls-icon.png';
          var download_link = '<a target="_blank" download=' + repID._id + '-' + file_name +' href=https://s3.eu-central-1.amazonaws.com/oywuploads/reports/reports/'+ repID._id + '-' + file_name +' style="text-decoration: none;font-size: 14px;font-family: receiptFont;display: flex;font-weight: 600;align-items: center;"><img style="width:30px;margin-right:10px;" src='+ excel_icon +' />Скачать - '+ file_name +'</a>';

          from = "arman.hak.g@gmail.com";
          to = ['karen.chobanyan@gmail.com','arman.hak.g@gmail.com'];
          cc = '';
          subject = 'Ежедневный отчет';
          html = '<img width="150" src='+ company_logo +' /><br><h3 style="display: inline-block;margin-right: 6px;font-family: receiptFont;">Семён Семёныч</h3><h4 style="display: inline-block;font-family: receiptFont;"> приветствует Вас.</h4><hr style"margin-top: 20px;margin-bottom: 20px;border: 0;border-top: 1px solid #eee;>' + download_link;
          console.log('Sending report');
          Meteor.call('sendEmail', to, from, subject, html);
          console.log('Sent report');
  },
  

  /***************End Tech Cards***********************/

  /*********************Users**************************/
  newUser(user) {
    if (user.username) {
      var id = Accounts.createUser(user);
      _.extend(user, {
        id: id
      });
      return id;
    }
  },
  /*
  $scope.meteorRegister = function() {
    console.log(this.regusername);
    var user = {
      username: this.regusername,
      password: this.regpassword,
      profile:{
        roles: ['owner'],
        name: this.regname,
      }
    };

   var upd = Meteor.call('newUser', user, function(res){
     console.log(res);
   });

    this.regname = '';
    this.regusername = '';
    this.regpassword = '';
  }
    //place at todo of shops.controller.js  to enable registration
  */
  deleteUser(user) {
    Meteor.users.remove({
      _id: user.id
    });
  },

  updateUser(user_id, index, user) {
    delete user.$$hashKey;
    let userId = Meteor.users.update({
      _id: user_id
    }, {
      $set: {
        profile: user.profile,
        username: user.username
      }
    });
    return userId;

  },

  /****************End Users**************************/

  // updateStore (shop_id, prods) {
  //   console.log(prods);
  //   console.log(shop_id);
  //   let shopId = Shops.update({ _id: shop_id }, {$set: {products: prods}});
  //   return shopId;
  // },

  /*********************Settings**************************/

  newSettings(setting) {
    setting.timestamp = new Date();
    let shopId = Settings.insert(setting);
    return shopId;
  },

  /****************End Settings**************************/

  /****************Clients**************************/

  newClient(client) {
    client.timestamp = new Date();
    let shopId = Shops.update({
      _id: client.shop
    }, {
      $push: {
        clients: client
      }
    });
    return shopId;
  },

  deleteClient(client) {
    let shopId = Shops.update({
      _id: client.shop
    }, {
      $pull: {
        clients: {
          id: client.id
        }
      }
    });
    return shopId;
  },

  updateClient(shop_id, index, client) {
    delete client.$$hashKey;
    var modifier = {};
    modifier["clients." + index] = client;
    let shopId = Shops.update({
      _id: shop_id
    }, {
      $set: modifier
    });
    return shopId;
  },
  /**************** End Clients**************************/

});
}