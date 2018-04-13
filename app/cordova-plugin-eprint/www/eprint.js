/*global cordova, module*/

module.exports = {
  print: function (print_txt, total, super_total, sale, cashier, at, address, printerIp, successCallback, errorCallback) {
    console.log(print_txt);
    if(super_total && parseInt(super_total) > 0){
      console.log("########################################Printing Native***************************************************");
      cordova.exec(successCallback, errorCallback, "Eprint", "print", [print_txt, total, super_total, sale, cashier, at, address, printerIp]);
    } else{
      console.log("Cheque is empty.");
    }
  },
  printReport: function (print_txt, creditCard, openCash, super_total, total, sales, totalTransactions, cashier, at, address, printerIp, successCallback, errorCallback) {
    console.log(print_txt);
    // if(super_total && parseInt(super_total) > 0){
      console.log("########################################Printing Native Report***************************************************");
      cordova.exec(successCallback, errorCallback, "Eprint", "printReport", [print_txt, creditCard, openCash, super_total, total, sales, totalTransactions, cashier, at, address, printerIp]);
    // } else{
      // console.log("Cheque is empty.");
    // }
  },
};
