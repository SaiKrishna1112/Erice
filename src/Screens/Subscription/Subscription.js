import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Dimensions, Linking ,ActivityIndicator} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import BASE_URL from '../../../Config';
import { useNavigation } from '@react-navigation/native';
import encryptEas from '../../Payments/components/encryptEas';
import decryptEas from '../../Payments/components/decryptEas';

const { width: screenWidth } = Dimensions.get('window');

const Subscription = () => {
  const userData = useSelector((state) => state.counter);
  // console.log({userData})
  const token = userData.accessToken;
  const [loading, setLoading] = useState(false);
  const [subscriptionHistoryData, setSubscriptionHistoryData] = useState([]);
  const[transactionId,setTransactionId]=useState('')
  const[paymentId,setPaymentId]=useState()
  // const[totalAmount,setTotalAmount]=useState('')
  const[paymentStatus,setPaymentStatus]=useState()
  const[loader,setLoader]=useState(false)
  const navigation = useNavigation();
  
  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });

  useEffect(() => {
    fetchSubscriptionData();
    getProfile();
  }, []);


  const getProfile = async () => {
    try {
      const response = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        url:
          BASE_URL +
          `erice-service/user/customerProfileDetails?customerId=${userData.userId}`,
      });
      console.log(response.data);

      if (response.status === 200) {
        console.log(response.data);
        // setUser(response.data);
        setProfileForm({
          customer_name: response.data.name,
          customer_email: response.data.email,
          customer_mobile: response.data.mobileNumber,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };





  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(BASE_URL + 'erice-service/wallet/getAllPlans', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("subscription",response.data);
        setLoading(false);
        setSubscriptionHistoryData(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = (plan) => {
    console.log("varam",plan.amount);
    
    setLoader(true)
    Alert.alert(
       'Confirm Subscription',
  `Subscribe to this plan for ₹${plan.amount} and get benefits worth ₹${plan.getAmount}. Would you like to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress:()=> setLoader(false)
        },
        {
          text: 'OK',
          // onPress: () =>{'SubscriptionConfirmation'},
          onPress:()=> SubscriptionConfirmation(plan)
        },
      ]
    );
    
  };
let postData

function SubscriptionConfirmation(details){
  console.log({details})
  console.log("amount",details.getAmount)

  // setTotalAmount(details.getAmount)
 postData=
  {
    "customerId": userData.userId,
    "planId": details.planId
  }
  axios.post(BASE_URL+`erice-service/wallet/userSubscriptionAmount`,postData,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  .then(function(response){
    setLoader(false)
    console.log(response.data)
    setTransactionId(response.data.paymentId)
    console.log("==========");
    const data = {
      mid: "1152305",
      // amount: details.getAmount,
      amount:1,
      merchantTransactionId: response.data.paymentId,
      transactionDate: new Date(),
      terminalId: "getepay.merchant128638@icici",
      udf1: profileForm.customer_mobile,
      udf2: profileForm.customer_name,
      udf3: profileForm.customer_email,
      udf4: "",
      udf5: "",
      udf6: "",
      udf7: "",
      udf8: "",
      udf9: "",
      udf10: "",
      ru: "https://app.oxybricks.world/interact/paymentreturn",
      callbackUrl:
        "https://fintech.oxyloans.com/oxyloans/v1/user/getepay",
      currency: "INR",
      paymentMode: "ALL",
      bankId: "",
      txnType: "single",
      productType: "IPG",
      txnNote: "Live Txn",
      vpa: "Getepay.merchant129014@icici",
    };
    console.log({ data });
    getepayPortal(data)

  })
  .catch(function(error){
    console.log(error.response)
  })

}

const getepayPortal = async (data) => {
  // console.log("getepayPortal", data);
  const totalAmount=data.amount
  const JsonData = JSON.stringify(data);

  var ciphertext = encryptEas(JsonData);
  
  var newCipher = ciphertext.toUpperCase();


  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  // console.log("ytfddd");

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
    redirect: "follow",
  };
  await fetch(
    "https://portal.getepay.in:8443/getepayPortal/pg/generateInvoice",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      //  console.log("===getepayPortal result======")
      //  console.log("result",result);
      var resultobj = JSON.parse(result);
      // console.log(resultobj);
      var responseurl = resultobj.response;
      var data = decryptEas(responseurl);
      // console.log("===getepayPortal data======");
      // console.log(data);
      data = JSON.parse(data);
      // console.log("Payment process",data);
      // localStorage.setItem("paymentId",data.paymentId)
      console.log(data.paymentId);
      // console.log(data.qrIntent)
      Requery(data.paymentId);
      // window.location.href = data.qrIntent;
      setPaymentId(data.paymentId);
      
      // paymentID = data.paymentId
      Alert.alert(
        "Congratulations!",
        "You’ve successfully subscribed to the plan ",
        [
          {
            text: "yes",
            onPress: () => {
             
              Linking.openURL(data.qrIntent);
              setLoader(false)
            },
          },
          {
            text: "No",
            onPress: () => {},
          },
        ]
      );
    })
    .catch((error) => console.log("getepayPortal", error.response));
  setLoader(false);
};
// Requery();
useEffect(() => {
  if (
    paymentStatus == "PENDING" ||
    paymentStatus == "" ||
    paymentStatus == null
  ) {
    const data = setInterval(() => {
      Requery();
    }, 2000);
    return () => clearInterval(data);
  } else {
    // setLoading(false)
  }
}, [paymentStatus, paymentId]);


function Requery() {
  console.log("requery",paymentId,paymentStatus);
  
  // setLoading(false);
  if (
    paymentStatus === "PENDING" ||
    paymentStatus === "" ||
    paymentStatus === null || paymentStatus === undefined
  ) {
    // console.log("Before.....",paymentId)

    const Config = {
      "Getepay Mid": 1152305,
      "Getepay Terminal Id": "getepay.merchant128638@icici",
      "Getepay Key": "kNnyys8WnsuOXgBlB9/onBZQ0jiYNhh4Wmj2HsrV/wY=",
      "Getepay IV": "L8Q+DeKb+IL65ghKXP1spg==",
    };

    const JsonData = {
      mid: Config["Getepay Mid"],
      paymentId: parseInt(paymentId),
      referenceNo: "",
      status: "",
      terminalId: Config["Getepay Terminal Id"],
      vpa: "",
    };
    // console.log(JsonData);

    var ciphertext = encryptEas(
      JSON.stringify(JsonData),
      Config["Getepay Key"],
      Config["Getepay IV"]
    );

    var newCipher = ciphertext.toUpperCase();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Cookie",
      "AWSALBAPP-0=remove; AWSALBAPP-1=remove; AWSALBAPP-2=remove; AWSALBAPP-3=remove"
    );

    var raw = JSON.stringify({
      mid: Config["Getepay Mid"],
      terminalId: Config["Getepay Terminal Id"],
      req: newCipher,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://portal.getepay.in:8443/getepayPortal/pg/invoiceStatus",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        // console.log("PaymentResult : ", result);
        var resultobj = JSON.parse(result);
        console.log(resultobj);
        // setStatus(resultobj);
        if (resultobj.response != null) {
          console.log("Requery ID result", paymentId);
          var responseurl = resultobj.response;
          console.log({ responseurl });
          var data = decryptEas(responseurl);
          data = JSON.parse(data);
          console.log("Payment Result", data);
          setPaymentStatus(data.paymentStatus);
          console.log("paymentStatus",data.paymentStatus);
          if (
            data.paymentStatus == "SUCCESS" ||
            data.paymentStatus == "FAILURE"
          ) {
            // clearInterval(intervalId); 294182409
            axios({
              method: "POST",
              url: BASE_URL + "erice-service/wallet/userSubscriptionAmount",
              data: {
                ...postData,
                paymentId: transactionId,
                paymentStatus: data.paymentStatus,
              },
              headers: {
                // "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
            // axios.post(BASE_URL+`erice-service/wallet/userSubscriptionAmount`,{
            //     ...postData,
            //     paymentId: transactionId,
            //     paymentStatus: data.paymentStatus,
           
            // },{
            //   headers:{
            //     Authorization:`Bearer ${token}`
            //   }
            // })
              .then(function(response) {
                console.log(
                  "Order Placed with Payment API:",
                  response
                );
                setLoading(false);
                // Alert.alert("Successfullt g!");
                Alert.alert(
                  data.paymentStatus,
                  "Successfully you have got subscription",
                  [
                    {
                      text: "yes",
                      onPress: () => {
                        navigation.navigate('Wallet');
                        // Requery(data.paymentId);
                      },
                    },
                 
                  ]
                );
              })
              .catch((error) => {
                console.error("Error in payment confirmation:", error);
              });
          } else {

          }
        }
      })
      .catch((error) => console.log("Payment Status", error.response));
  }
  // else{
  //   clearInterval(intervalId)
  // }
}






  const renderPlan = ({ item }) => (
    <View style={styles.planContainer}>
      <Text style={styles.title}>₹{item.amount}</Text>
      <Text style={styles.text}>Get Amount: ₹{item.getAmount}</Text>
      <Text style={styles.text}>
      Limit: ₹{item.limitAmount} <Text style={styles.note}>(per month)</Text>
     </Text>
     {loader==false?
      <TouchableOpacity style={styles.button} onPress={() => handleSubscription(item)}>
        <Text style={styles.buttonText}>Subscribe</Text>
      </TouchableOpacity>
      :
      <View style={styles.button} >
        <ActivityIndicator size="small" color="white"/>
      </View>
     }
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          <Text style={styles.header}>Subscription Plans</Text>
          {subscriptionHistoryData.length > 0 ? (
            <FlatList
              data={subscriptionHistoryData}
              renderItem={renderPlan}
              keyExtractor={(item) => item.planId.toString()}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
            />
          ) : (
            <Text style={styles.emptyText}>No subscriptions found!</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    width: (screenWidth / 2) - 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#03843b',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fd7e14',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 20,
  },
  note: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  
});

export default Subscription;
