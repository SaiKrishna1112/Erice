import { View, Text ,TouchableOpacity,StyleSheet} from 'react-native'
import React from 'react'
import encryptEas from "./components/encryptEas";
import decryptEas from "./components/decryptEas";
import { Alert } from 'react-native';
import { Linking } from 'react-native';



const Getepay=()=> {
 
  const getepayPortal = async(data) => {
    console.log(data);
    const JsonData = JSON.stringify(data);
  
    var ciphertext = encryptEas(JsonData);
    var newCipher = ciphertext.toUpperCase();
  
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    var raw = JSON.stringify({
        mid: data.mid,
        terminalId: data.terminalId,
        req: newCipher,
    });
  
    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };
  await	fetch(
        "https://portal.getepay.in:8443/getepayPortal/pg/generateInvoice",
        requestOptions
    )
        .then((response) => response.text())
        .then((result) => {
          console.log(result);
            var resultobj = JSON.parse(result);
            // console.log(resultobj);
            var responseurl = resultobj.response;
            var data = decryptEas(responseurl);
            console.log(data);
            data = JSON.parse(data);
            // console.log("Payment process",data);
            // localStorage.setItem("paymentId",data.paymentId)
            console.log(data.paymentId);
            // window.location.href = data.qrIntent;
            Alert.alert(
              "Amount",
              "confirm",
              [
                {
                  text:"yes",onPress:()=>Linking.openURL(data.qrIntent)
                }
              ]
            )
            // console.log("data.paymentId.....");
            // console.log(data.paymentId)
  
        })
        .catch((error) => console.log("error", error.response));
  };

const Config = {
    "Getepay Terminal Id": "Getepay.adaasd51021@icici",
    "Getepay Key": "h9OfpK2eT1L8kU6PQaHK/w==",
    "Getepay IV": "PaLE/C1iL1IX/o4nmerh5g==",
    "Getepay Url":
      "https://portal.getepay.in:8443/getepayPortal/pg/generateInvoice",
  };

  const data = {
    mid: "786437",
    amount: "1.00",
    merchantTransactionId: "7889",
    transactionDate: "Sat Apr 22 18:34:33 IST 2023",
    terminalId: "Getepay.merchant129014@icici",
    udf1: "8341189900",
    udf2: "Test",
    udf3: "test@gmail.com",
    udf4: "",
    udf5: "",
    udf6: "",
    udf7: "",
    udf8: "",
    udf9: "",
    udf10: "",
    ru: "https://app.oxybricks.world/interact/paymentreturn",
    callbackUrl: "",
    currency: "INR",
    paymentMode: "ALL",
    bankId: "",
    txnType: "single",
    productType: "IPG",
    txnNote: "Test Txn",
    vpa: "Getepay.merchant129014@icici",
  }; 

  return (
    <View style={{flex:1,justifyContent:"center",marginTop:10}}>
        {/* <Text style={styles.txt}>sreeja</Text> */}
      <TouchableOpacity style={styles.btn} onPress={() => getepayPortal(data)} >
        <Text style={styles.txt}>Pay</Text>
      </TouchableOpacity>
    </View>
  )
}
export default Getepay;

const styles=StyleSheet.create({

  txt: {
    justifyContent:"center",
    alignSelf: "center",
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 15,
    color: "white"
  },
  btn: {
    backgroundColor: "#464B8B",
    width: 150,
    // borderWidth: 1,
    borderRadius: 15,
    alignSelf: "center",
    marginTop: 20,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
})