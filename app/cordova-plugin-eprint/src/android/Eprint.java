package com.atero.plugin;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import android.os.Bundle;
import android.content.Intent;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import java.io.File;
import com.atero.bakery.R;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import com.epson.epos2.Epos2Exception;
import com.epson.epos2.printer.Printer;
import com.epson.epos2.printer.PrinterStatusInfo;
import com.epson.epos2.printer.ReceiveListener;
import com.epson.epos2.Epos2CallbackCode;
import com.epson.epos2.Log;
import com.epson.epos2.discovery.Discovery;
import com.epson.epos2.discovery.DiscoveryListener;
import com.epson.epos2.discovery.FilterOption;
import com.epson.epos2.discovery.DeviceInfo;
import com.epson.epos2.Epos2Exception;

public class Eprint extends CordovaPlugin {
  private  Printer printer = null;
  private String usbaddr = "";
  Context context = null; 
  
  private void stopDiscovery() {
    try {  
      Discovery.stop(); 
    }
    catch (Epos2Exception e) {
      int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
      System.out.println("Cant stop the Discovery!");
      System.out.println(getEposExceptionText(ErrorStatus));
    }
  }



  private boolean printClean(){
    int tries = 0;
    PrinterStatusInfo status = printer.getStatus();
    System.out.println("***************status.getConnection()***************");
    System.out.println(status.getConnection());
    
    if(status.getConnection() == Printer.FALSE && !usbaddr.isEmpty()){   
      try {
        System.out.println("CONNECTING!");
        System.out.println(usbaddr);      
        printer.connect(usbaddr, 2000);
        System.out.println("Printer CONNECTED!");
      }      
      catch (Epos2Exception e) {    
        System.out.println("CONNECTOIN FAILED!");
        int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
        System.out.println(getEposExceptionText(ErrorStatus));             
      }
    }
    
    status = printer.getStatus();    
    
    if (!isPrintable(status)) {
        try {
            printer.disconnect();
        }
        catch (Exception ex) {
            // Do nothing
        }
        return false;
    }
    
    try {
      printer.beginTransaction();
      System.out.println("SENDINGTING!");
      printer.sendData(Printer.PARAM_DEFAULT);
      System.out.println("SENT!");
    }catch (Epos2Exception e) {
      System.out.println("CANT SEND!");
      int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
      System.out.println(getEposExceptionText(ErrorStatus));
      try {
        printer.disconnect();
      }
      catch (Exception ex) {
          // Do nothing
      }
      return false;
    }

    try {
      printer.endTransaction();
      System.out.println("ENDING tr!");
      printer.clearCommandBuffer();
      System.out.println("Buffer clean");

    }catch (Epos2Exception e) {
      System.out.println("CANT END!");
      int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
      System.out.println(getEposExceptionText(ErrorStatus));
      return false;
    }  

    return true;
  }
  
  
  
  private boolean isPrintable(PrinterStatusInfo status) {
    if (status == null) {
        return false;
    }

    if (status.getConnection() == Printer.FALSE) {
        return false;
    }
    else if (status.getOnline() == Printer.FALSE) {
        return false;
    }
    else {
        ;//print available
    }

    return true;
}

  private DiscoveryListener mDiscoveryListener = new DiscoveryListener() {
    @Override
    public void onDiscovery(final DeviceInfo deviceInfo) {
      cordova.getActivity().runOnUiThread(new Runnable() {
        @Override
        public synchronized void run() {
          System.out.println("///////////deviceInfo//////////////");
          usbaddr = deviceInfo.getTarget();
          System.out.println(usbaddr);
          System.out.println(deviceInfo.getDeviceName());
          
        }
      });
      stopDiscovery();
      printClean();
    }
  };

  final void printText(String print_txt, String total, String super_total, String sale, String cashier, String at, String address, String printerIp){
     
    context = this.cordova.getActivity().getApplicationContext(); 
    if( printer == null ){
      try {
        System.out.println("Opening TM_T20!");
        printer = new Printer(Printer.TM_T20, Printer.MODEL_ANK, context);
        System.out.println("Printer instantiated");
      }
      catch (Epos2Exception e) {
        System.out.println("Opening TM_T20 FAILED!");
      }
    }
    
    Bitmap logoData = BitmapFactory.decodeResource(cordova.getActivity().getResources(), R.drawable.icon192192);
    try {
      System.out.println("ADDING!");
      printer.addTextAlign(Printer.ALIGN_CENTER);
      printer.addImage(
        logoData, 0, 0,
        logoData.getWidth(),
        logoData.getHeight(),
        Printer.COLOR_1,
        Printer.MODE_MONO,
        Printer.HALFTONE_DITHER,
        Printer.PARAM_DEFAULT,
        Printer.COMPRESS_AUTO
      );

      printer.addTextSize(2, 2);
      printer.addText("\n");
      printer.addTextAlign(Printer.ALIGN_LEFT);
      printer.addTextSize(1, 1);
      printer.addText("Адрес                ");
      printer.addText(address);
      printer.addText("\n");
      printer.addText("Кассир               ");
      printer.addText(cashier);
      printer.addText("\n");
      printer.addText("Чек напечатан        ");
      printer.addText(at);
      printer.addText("\n");
      printer.addText("________________________________________________\n");
      printer.addText("\n");
      printer.addLineSpace(48);
      printer.addTextSize(1, 1);
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.TRUE, Printer.PARAM_DEFAULT);
      printer.addText("Наименование             Кол.    Цена     Итогo\n");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.FALSE, Printer.PARAM_DEFAULT);
      printer.addText(print_txt);
      printer.addText("________________________________________________\n");
      printer.addText("Итогo    ***************************** ");
      printer.addText(super_total);
      printer.addText(" руб.\n");
      printer.addText("Скидка   *****************************  ");
      printer.addText(sale);
      printer.addText("%");
      printer.addText("\n");
      printer.addText("К оплате ***************************** ");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.TRUE, Printer.PARAM_DEFAULT);
      printer.addText(total);
      printer.addText(" руб.\n");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.FALSE, Printer.PARAM_DEFAULT);
      printer.addText("________________________________________________\n");
      printer.addTextAlign(Printer.ALIGN_CENTER);
      printer.addText("Спасибо за покупку!\n");
      printer.addCut(Printer.CUT_FEED);
      System.out.println("ADDED!");
      System.out.println(super_total);
      System.out.println(total);
      System.out.println(sale);
    }
    catch (Epos2Exception e) {
      System.out.println("ADD FAILED!");
    }
    
    
    
    if(usbaddr.isEmpty()){
      try {   
        FilterOption filterOption = null;
        filterOption = new FilterOption();
        filterOption.setDeviceType(Discovery.TYPE_PRINTER);
        filterOption.setEpsonFilter(Discovery.FILTER_NAME);
        System.out.println("////////Discovering/////////");
        Discovery.start(context, filterOption, mDiscoveryListener);        
      }  
      catch (Epos2Exception e) {
        System.out.println("////////////////////////////Error Discovery/////////////////////////////////////");
        int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
        System.out.println(getEposExceptionText(ErrorStatus));
      }
    }else{
      System.out.println("////////Printer Exist/////////");
      System.out.println(usbaddr);      
      printClean();      
    }
  }



  final void printReportText(String print_txt, String creditCard, String openCash, String super_total, String total, String sales, String totalTransactions, String cashier, String at, String address, String printerIp){
     
    context = this.cordova.getActivity().getApplicationContext(); 
    if( printer == null ){
      try {
        System.out.println("Opening TM_T20!");
        printer = new Printer(Printer.TM_T20, Printer.MODEL_ANK, context);
        System.out.println("Printer instantiated");
      }
      catch (Epos2Exception e) {
        System.out.println("Opening TM_T20 FAILED!");
      }
    }
    
    Bitmap logoData = BitmapFactory.decodeResource(cordova.getActivity().getResources(), R.drawable.icon192192);
    try {
      System.out.println("ADDING!");
      printer.addTextAlign(Printer.ALIGN_CENTER);
      printer.addImage(
        logoData, 0, 0,
        logoData.getWidth(),
        logoData.getHeight(),
        Printer.COLOR_1,
        Printer.MODE_MONO,
        Printer.HALFTONE_DITHER,
        Printer.PARAM_DEFAULT,
        Printer.COMPRESS_AUTO
      );

      printer.addTextSize(2, 2);
      printer.addText("\n");
      printer.addTextAlign(Printer.ALIGN_LEFT);
      printer.addTextSize(1, 1);
      printer.addText("Адрес                ");
      printer.addText(address);
      printer.addText("\n");
      printer.addText("Кассир               ");
      printer.addText(cashier);
      printer.addText("\n");
      printer.addText("Чек напечатан        ");
      printer.addText(at);
      printer.addText("\n");
      printer.addText("________________________________________________\n");
      printer.addText("\n");
      printer.addLineSpace(48);
      printer.addTextSize(1, 1);
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.TRUE, Printer.PARAM_DEFAULT);
      printer.addText("Наименование             Кол.    Цена     Итогo\n");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.FALSE, Printer.PARAM_DEFAULT);
      printer.addText(print_txt);
      printer.addText("________________________________________________\n");
      printer.addText("В начале смены ********************** ");
      printer.addText(openCash);
      printer.addText(" руб.\n");
      printer.addText("Продажа    ************************** ");
      printer.addText(super_total);
      printer.addText(" руб.\n");
      printer.addText("Оплачено кр. картой    ************** ");
      printer.addText(creditCard);
      printer.addText(" руб.\n");
      printer.addText("Скидки   ***************************  ");
      printer.addText(sales);
      printer.addText(" руб.");
      printer.addText("\n");
      printer.addText("Транзакции (сумма)  *************** ");
      printer.addText(totalTransactions);
      printer.addText(" руб.");
      printer.addText("\n");
      printer.addText("В кассе   ********************** ");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.TRUE, Printer.PARAM_DEFAULT);
      printer.addText(total);
      printer.addText(" руб.\n");
      printer.addTextStyle(Printer.FALSE, Printer.FALSE, Printer.FALSE, Printer.PARAM_DEFAULT);
      printer.addText("________________________________________________\n");
      printer.addTextAlign(Printer.ALIGN_CENTER);
      
      printer.addCut(Printer.CUT_FEED);
      System.out.println("ADDED!");
      System.out.println(super_total);
      System.out.println(total);
      System.out.println(sales);
    }
    catch (Epos2Exception e) {
      System.out.println("ADD FAILED!");
    }
    
    
    
    if(usbaddr.isEmpty()){
      try {   
        FilterOption filterOption = null;
        filterOption = new FilterOption();
        filterOption.setDeviceType(Discovery.TYPE_PRINTER);
        filterOption.setEpsonFilter(Discovery.FILTER_NAME);
        System.out.println("////////Discovering/////////");
        Discovery.start(context, filterOption, mDiscoveryListener);        
      }  
      catch (Epos2Exception e) {
        System.out.println("////////////////////////////Error Discovery/////////////////////////////////////");
        int ErrorStatus = ((Epos2Exception) e).getErrorStatus();
        System.out.println(getEposExceptionText(ErrorStatus));
      }
    }else{
      System.out.println("////////Printer Exist/////////");
      System.out.println(usbaddr);      
      printClean();      
    }
  }

  private static String getEposExceptionText(int state) {
    String return_text = "";
    switch (state) {
        case    Epos2Exception.ERR_PARAM:
            return_text = "ERR_PARAM";
            break;
        case    Epos2Exception.ERR_CONNECT:
            return_text = "ERR_CONNECT";
            break;
        case    Epos2Exception.ERR_TIMEOUT:
            return_text = "ERR_TIMEOUT";
            break;
        case    Epos2Exception.ERR_MEMORY:
            return_text = "ERR_MEMORY";
            break;
        case    Epos2Exception.ERR_ILLEGAL:
            return_text = "ERR_ILLEGAL";
            break;
        case    Epos2Exception.ERR_PROCESSING:
            return_text = "ERR_PROCESSING";
            break;
        case    Epos2Exception.ERR_NOT_FOUND:
            return_text = "ERR_NOT_FOUND";
            break;
        case    Epos2Exception.ERR_IN_USE:
            return_text = "ERR_IN_USE";
            break;
        case    Epos2Exception.ERR_TYPE_INVALID:
            return_text = "ERR_TYPE_INVALID";
            break;
        case    Epos2Exception.ERR_DISCONNECT:
            return_text = "ERR_DISCONNECT";
            break;
        case    Epos2Exception.ERR_ALREADY_OPENED:
            return_text = "ERR_ALREADY_OPENED";
            break;
        case    Epos2Exception.ERR_ALREADY_USED:
            return_text = "ERR_ALREADY_USED";
            break;
        case    Epos2Exception.ERR_BOX_COUNT_OVER:
            return_text = "ERR_BOX_COUNT_OVER";
            break;
        case    Epos2Exception.ERR_BOX_CLIENT_OVER:
            return_text = "ERR_BOX_CLIENT_OVER";
            break;
        case    Epos2Exception.ERR_UNSUPPORTED:
            return_text = "ERR_UNSUPPORTED";
            break;
        case    Epos2Exception.ERR_FAILURE:
            return_text = "ERR_FAILURE";
            break;
        default:
            return_text = String.format("%d", state);
            break;
    }
    return return_text;
  }

  @Override
  public boolean execute(String action, JSONArray data, final CallbackContext callbackContext) throws JSONException {
    if (action.equals("print")) {
      final String print_txt = data.getString(0);
      final String total = data.getString(1);
      final String super_total = data.getString(2);
      final String sale = data.getString(3);
      final String cashier = data.getString(4);
      final String at = data.getString(5);
      final String address = data.getString(6);
      final String printerIp = data.getString(7);
      printText(print_txt, total, super_total, sale, cashier, at, address, printerIp);
    }
    if (action.equals("printReport")) {
      final String print_txt =    data.getString(0);
      final String creditCard =   data.getString(1);
      final String openCash =     data.getString(2);
      final String super_total =  data.getString(3);
      final String total =        data.getString(4);
      final String sales =        data.getString(5);
      final String totalTransactions = data.getString(6);
      final String cashier =      data.getString(7);
      final String at =           data.getString(8);
      final String address =      data.getString(9);
      final String printerIp =    data.getString(10);
      printReportText(print_txt, creditCard, openCash, super_total, total, sales, totalTransactions, cashier, at, address, printerIp);
    }
    return true;
  }
}
