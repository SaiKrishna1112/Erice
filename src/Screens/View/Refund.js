import React from "react";
import {View,Text,Button} from "react-native"
import encryptEas from "../../Payments/components/encryptEas";
import decryptEas from "../../Payments/components/decryptEas";

const Refund = () =>{
    const data = {
        mid: "1152305",
        amount: 1899.0,
        transactionId: 453076575,
        terminalId: "getepay.merchant128638@icici",
        refundRefNo:"ERICE202412190549119677a1957e6-7121-43d8-9f45-abf35cb8c034"
      };

     async function RefundApi(){
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
        console.log("========");
        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        //   redirect: "follow",
        };
        await fetch(
          "https://portal.getepay.in:8443/getepayPortal/pg/refundRequest",
          requestOptions
        )
          .then((response) => response.text())
          .then((result) => {
             console.log("===getepayPortal result======")
             console.log("result",result);
            var resultobj = JSON.parse(result);
            var responseurl = resultobj.response;
            var data = decryptEas(responseurl);
            console.log("===getepayPortal data======");
            console.log(data);
          }
          )

      }

      return(
        <View style={{flex:1,justifyContent:"center",}}>
            <Text>
      
            </Text>
            <Button title="Refund" onPress={RefundApi}> </Button>
        </View>
      )
}

export default Refund