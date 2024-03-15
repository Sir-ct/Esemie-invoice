import * as React from 'react';
import { View, StyleSheet, Button, Dimensions, Platform, Text, StatusBar, TouchableOpacity, Switch, ScrollView } from 'react-native';
import * as SplashScreen from "expo-splash-screen"
import * as Print from 'expo-print';
import color from './assets/color';
import { shareAsync } from 'expo-sharing';
import { WebView } from "react-native-webview"
import { AntDesign, MaterialIcons, EvilIcons } from "@expo/vector-icons"
import { useFonts } from "expo-font"

import invoice_data from "./invoice-data.json"
import company_details from "./company-details.json"

SplashScreen.preventAutoHideAsync()

const html = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  </head>
  <body style="line-height: 1.5; font-size: 14px; background-color: white;">
    <hr>
    <div style="display: flex; justify-content: space-between;">
      <div>
        <div>${company_details.name},</div>
        <div>${company_details.billingAddress.city}, ${company_details.billingAddress.state}, ${company_details.billingAddress.country} </div>
        <div>${company_details.phone}</div>
      </div>
      <div style="text-align: right; font-weight: 500;">
        <h3 style="margin-top: 5px; margin-bottom: 5px;">INVOICE</h3>
        <h4 style="margin-top: 5px; margin-bottom: 5px;">${invoice_data[0].invoiceNumber}</h4>
        <div>Balance due</div>
        <div>NGN ${invoice_data[0].total}</div>
      </div>
    </div>
    <hr />
    <div style="display: flex; justify-content: space-between;">
      <div>
        <p style="font-size: 12px; font-weight: 500; margin-bottom: 5px;">Bill To</p>
        <div style="font-weight: bold; font-size: 16px;">${invoice_data[0].customerName}</div>
        <div>${invoice_data[0].billingAddress.street},</div>
        <div> ${invoice_data[0].billingAddress.city}, </div>
        <div>${invoice_data[0].billingAddress.state} State </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px">Invoice Date</div>
        <div style="font-weight: bold;">${new Date(invoice_data[0].invoiceDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
        <p style="font-size: 12px;">Due Date</p>
        <div style="font-weight: bold">${new Date(invoice_data[0].dueDate).toLocaleDateString('en-GB', {day: '2-digit', year: 'numeric', month: 'short'})}</div>
      </div>
    </div>
    <hr />
    <div>
      <div style="display: flex; font-weight: bold; justify-content: space-between;">
        <p style="margin-3; width: 40%;">Item</p>
        <p style="margin-3">Qty</p>
        <p style="margin-3">Amount</p>
      </div>
      ${invoice_data[0].items.map((item)=>{
        return `
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 40%;">${item.name}</div>
            <div>${item.quantity}</div>
            <div>N${item.price}</div>
          </div>
        `
      })}
    </div>
    <hr />
    <div>
      <div style="width: 50%; margin-left: auto;">
        <div style="display: flex; justify-content: space-between">
          <div>Sub-total</div>
          <div>N${invoice_data[0].subtotal}</div>
        </div>
        <div style="display: flex; justify-content: space-between">
          <div>Tax</div>
          <div>N${invoice_data[0].tax}</div>
        </div>
      </div>
    </div>
    <hr />
    <div>
      <div style="width: 50%; margin-left: auto;">
        <div style="display: flex; justify-content: space-between">
          <div style="color: ${color.primary_blue}; font-weight: 500">Total</div>
          <div style="color: ${color.primary_blue}; font-weight: 500">N${invoice_data[0].total}</div>
        </div>
        <div style="display: flex; justify-content: space-between">
          <div>Tax</div>
          <div>N${invoice_data[0].tax}</div>
        </div>
      </div>
      <div style="font-size: 12; padding: 10px;"><strong>Payment Details</strong> ${invoice_data[0].paymentDetails.accountNumber} ${invoice_data[0].paymentDetails.accountName}; ${invoice_data[0]?.paymentDetails?.bank} </div>
    </div>
  </body>
</html>
`;

export default function App() {
  const [selectedPrinter, setSelectedPrinter] = React.useState();
  let [recurringInvoice, setRecurringInvoice] = React.useState(false)

  const [fontsLoaded, fontError] = useFonts({
    "Fellix-Regular": require('./assets/fonts/Fellix-Regular.ttf'),
  })

  const onLayoutRootView = React.useCallback(async ()=>{
      if(fontsLoaded || fontError){
        await SplashScreen.hideAsync()
      }
  }, [fontsLoaded, fontError])

  if(!fontsLoaded && !fontError){
    return null
  }

  let data = invoice_data[0]

  let day = new Date().getDay()
  let month = new Date().getMonth()
  let year = new Date().getFullYear()



  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };



  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ScrollView contentContainerStyle={[styles.container]}>
        <View style={styles.topbar}>
          <AntDesign name='left' size={25} />
          <Text style={[{color: color.primary_blue, fontSize: 16, fontWeight: 500}]}>{data.invoiceNumber}</Text>
          <TouchableOpacity>
            <Text style={{color: color.primary_blue, fontWeight: "bold"}}>Refund</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 10, paddingVertical: 2}}>
          <View style={{backgroundColor: color.light_green, padding: 5, paddingHorizontal: 10, borderRadius: 5 }}>
            <Text style={{color: color.thick_green}}>Paid</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <MaterialIcons name='access-time' size={25} />
            <Text style={[styles.textfont,{fontWeight: '500'}]}>Created: <Text style={{color: color.primary_purple, fontWeight: 500}}>{`${day}/${month}/${year}`}</Text></Text>
          </View>
        </View>

        <View style={{padding: 10, paddingVertical: 2, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={[styles.textfont]}>You're due <Text style={{fontWeight: 'bold'}}>N{data.total}</Text></Text>
            <Text style={[styles.textfont]}>Exchange rate: N1 per $</Text>
          </View>
          <View>
            <TouchableOpacity onPress={()=>{alert('link copied')}}>
              <Text style={[styles.textfont, {fontWeight: "bold", color: color.primary_blue }]}>Copy Payment Link <EvilIcons name='link' size={25} /></Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{padding: 10, paddingVertical: 2}}>
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 3, padding: 10, borderWidth: 1, borderColor: '#999', borderRadius: 5}}>
              <Text style={{color: "#AAA"}}>Repeat every</Text>
              <AntDesign name='caretdown' color={"#CCC"} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 3, padding: 10, borderWidth: 1, borderColor: '#999', borderRadius: 5}}>
              <Text style={{color: "#AAA"}}>Repeat every</Text>
              <AntDesign name='caretdown' color={"#CCC"} />
            </View>
          </View>
          <Text style={[styles.textfont, {color: color.primary_blue, fontWeight: '700', fontSize: 12,}]}>The next recurring date is</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.textfont]}>Recurring Invoice</Text>
            <Switch value={recurringInvoice} onChange={()=>{setRecurringInvoice((prev)=> !prev)}} />
          </View>
        </View>

        <View style={{flex: 1}}>
          <WebView
            style={styles.webview}
            originWhitelist={['*']}
            source={{ html: html }}
          />
        </View>

        <View style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 5,
          backgroundColor: "#D9D9D933",
          margin: 10
          }}>
          <TouchableOpacity style={[{flexDirection: 'row', padding: 10, gap: 3,borderRightWidth: 1, 
          borderRightColor: "#CCC"}]} onPress={print}>
            <Text style={[styles.textfont, {fontWeight: 'bold', color: color.primary_blue}]}>Preview & Download</Text>
            <AntDesign name='download' size={15} color={color.primary_blue} />
          </TouchableOpacity>

          <View style={styles.spacer} />
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 3, margin: 5}} onPress={printToFile}>
            <Text style={[styles.textfont, {color: color.primary_blue, fontWeight: 'bold'}]}>Print</Text>
            <AntDesign name='printer' size={15} color={color.primary_blue} />
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.spacer} />
              <Button title="Select printer" onPress={selectPrinter} />
              <View style={styles.spacer} />
              {selectedPrinter ? (
                <Text style={styles.printer}>{`Selected printer: ${selectedPrinter.name}`}</Text>
              ) : undefined}
            </>
          )}
        </View>
        <TouchableOpacity
        onPress={()=>{alert("payment recorded :)")}}
         style={{
          backgroundColor: color.primary_blue,
          padding: 10,
          margin: 10,
          borderRadius: 5
        }}>
          <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white'}}>Record Payment</Text>
        </TouchableOpacity>
      </ScrollView>
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  textfont: {
    fontFamily: "Fellix-Regular"
  },
  webview: {
    flex: 1,
    fontFamily: "Fellix-Regular"
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  }
});
