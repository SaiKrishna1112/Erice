import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
  Image,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { RadioButton, Checkbox, ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import encryptEas from "../../Payments/components/encryptEas";
import decryptEas from "../../Payments/components/decryptEas";
import { COLORS } from "../../../assets/theme/theme";
import BASE_URL from "../../../Config";
import { err } from "react-native-svg";
const {width,height} = Dimensions.get('window')



const PaymentDetails = ({ navigation, route }) => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [transactionId, setTransactionId] = useState();

  const [couponCode, setCouponCode] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });
  const [loading, setLoading] = useState(false);

  console.log({ customerId });
  const items = route.params?.items || [];

  console.log("Payment screen items:", items);
  // console.log(route.params)
  var addressDetails = route.params.address;

  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  // Calculate total amount
  const totalAmount = items.reduce(
    (total, item) => total + item.cartQuantity * item.priceMrp,
    0
  );

  const handlePaymentModeSelect = (mode) => {
    setSelectedPaymentMode(mode);
    console.log({ mode });
  };

  //   const changePaymentType = (type) => {
  //     console.log({type});

  //     setPaymentType(type);
  // };
  const confirmPayment = () => {
    if (selectedPaymentMode == null || selectedPaymentMode == "") {
      // navigation.navigate("OrderConfirmationScreen", {
      //   paymentMode: selectedPaymentMode,
      //   items,
      //   totalAmount,
      // });
      Alert.alert("Please select payment mode");
    } else {
      // alert("Please select a payment mode.");
      placeOrder();
    }
    // Alert.alert("payment have to be done")
  };

  useEffect(() => {
    getProfile();
    getOffers();
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
          `erice-service/user/customerProfileDetails?customerId=${customerId}`,
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
var postData;
  const placeOrder = () => {
    // console.log("Location Data:", addressDetails);

    // Ensure that locationData contains the necessary data
     postData = {
      address: addressDetails.address,
      amount: totalAmount,
      customerId: customerId,
      flatNo: addressDetails.flatNo,
      landMark: addressDetails.landMark,
      orderStatus: selectedPaymentMode,
      pincode: addressDetails.pincode,
      // paymentStatus:{selectedPaymentMode=="COD" ? "":"ONLINE"}
    };

    console.log({ postData });
    setLoading(true);
    axios({
      method: "POST",
      url: BASE_URL + "erice-service/checkout/orderPlacedPaymet",
      data: postData,
      headers: {
        // 'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Order Placed Response:", response.data);

        // Handle COD or other payment types here
        if (selectedPaymentMode === null || selectedPaymentMode === "COD") {
          Alert.alert("Order Placed!");
          setLoading(false);
          // totalCart()
        } else {
          setTransactionId(response.data.paymentId);
          // onlinePaymentFunc()
          console.log("==========");
          const data = {
            mid: "1152305",
            amount: 1,
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
          getepayPortal(data);
        }
      })
      .catch((error) => {
        console.error("Order Placement Error:", error.response);
        setLoading(false);
      });
  };

  useEffect(() => {
    // console.log("djhftghngdxhkjhfghjcvyhds");
    if (
      paymentStatus == "PENDING" ||
      paymentStatus == "" ||
      paymentStatus == null
    ) {
      const data = setInterval(() => {
        Requery(paymentId);
      }, 4000);
      return () => clearInterval(data);
    } else {
      // setLoading(false)
    }
  }, [paymentStatus, paymentId]);

  const getepayPortal = async (data) => {
    console.log("getepayPortal", data);
    const JsonData = JSON.stringify(data);
    console.log("ytfddd");

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
        console.log("===getepayPortal data======");
        console.log(data);
        data = JSON.parse(data);
        // console.log("Payment process",data);
        // localStorage.setItem("paymentId",data.paymentId)
        // console.log(data.paymentId);
        // console.log(data.qrIntent)
        // window.location.href = data.qrIntent;
        setPaymentId(data.paymentId);
        // paymentID = data.paymentId
        Alert.alert(
          "Total Amount",
          "Amount of cart details: INR " + totalAmount,
          [
            {
              text: "yes",
              onPress: () => {
                Linking.openURL(data.qrIntent);
                Requery(data.paymentId);
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
    setLoading(false);
  };

  const getOffers = async () => {
    setLoading(true);
    try {
      // Updated API URL and headers
      const response = await axios.get(
        BASE_URL+'erice-service/coupons/getallcoupons',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if(response.data){
      console.log("coupen code",response.data);
      setLoading(false);
      }
    }catch(error){
      console.log(error.response);
    }
  }
//for applying coupen
  const handleApplyCoupon = () => {
    alert(`Coupon "${couponCode}" applied!`);
  };


  function Requery(paymentId) {
    setLoading(false);
    if (
      paymentStatus === "PENDING" ||
      paymentStatus === "" ||
      paymentStatus === null
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
          // console.log(resultobj);
          // setStatus(resultobj);
          if (resultobj.response != null) {
            console.log("Requery ID result", paymentId);
            var responseurl = resultobj.response;
            console.log({ responseurl });
            var data = decryptEas(responseurl);
            data = JSON.parse(data);
            console.log("Payment Result", data);
            setPaymentStatus(data.paymentStatus);
            console.log(data.paymentStatus);
            if (
              data.paymentStatus == "SUCCESS" ||
              data.paymentStatus == "FAILURE"
            ) {
              // clearInterval(intervalId); 294182409
              axios({
                method: "POST",
                url: BASE_URL + "erice-service/checkout/orderPlacedPaymet",
                data: {
                  ...postData,
                  paymentId: transactionId,
                  paymentStatus: data.paymentStatus,
                },
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              })
                .then((secondResponse) => {
                  console.log(
                    "Order Placed with Payment API:",
                    secondResponse.data
                  );
                  setLoading(false);
                  Alert.alert("Order Placed!");
                })
                .catch((error) => {
                  console.error("Error in payment confirmation:", error);
                });
            } else {
            }
          }
        })
        .catch((error) => console.log("Payment Status", error));
    }
    // else{
    //   clearInterval(intervalId)
    // }
  }

  return (
    
    <View style={styles.container}>
    {/* Apply Coupon Section */}
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Apply Coupon</Text>
      <View style={styles.couponRow}>
        <TextInput
          style={styles.couponInput}
          placeholder="Enter coupon code"
          value={couponCode}
          onChangeText={setCouponCode}
        />
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Payment Methods */}
    <Text style={styles.paymentHeader}>Choose Payment Method</Text>
    <View style={styles.paymentOptions}> 
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPaymentMode === "ONLINE" && styles.selectedOption,
        ]}
        onPress={() => handlePaymentModeSelect("ONLINE")}
      >
        <FontAwesome5
          name="credit-card"
          size={24}
          color={selectedPaymentMode === "ONLINE" ? "blue" : "black"}
        />
        <Text style={styles.optionText}>Online Payment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPaymentMode === "COD" && styles.selectedOption,
        ]}
        onPress={() => handlePaymentModeSelect("COD")}
      >
        <MaterialIcons
          name="delivery-dining"
          size={24}
          color={selectedPaymentMode === "COD" ? "blue" : "black"}
        />
        <Text style={styles.optionText}>Cash on Delivery</Text>
      </TouchableOpacity>
    </View>

    {/* Payment Details */}
    <View style={styles.paymentDetails}>
  <Text style={styles.detailsHeader}>Payment Details</Text>
  <View style={styles.paymentRow}>
    <Text style={styles.detailsLabel}>Sub Total</Text>
    <Text style={styles.detailsValue}>₹{totalAmount.toFixed(2)}</Text>
  </View>
  <View style={styles.paymentRow}>
    <Text style={styles.detailsLabel}>Delivery Fee</Text>
    <Text style={styles.detailsValue}>₹0.00</Text>
  </View>
  <View style={styles.divider} />
  <View style={styles.paymentRow}>
    <Text style={styles.detailsLabelBold}>Grand Total</Text>
    <Text style={styles.detailsValueBold}>₹{totalAmount.toFixed(2)}</Text>
  </View>
</View>



    {/* Confirm Order Button */}
    {loading ? (
      <View style={styles.confirmButton}>
        <ActivityIndicator size="small" color="white" />
      </View>
    ) : (
      <TouchableOpacity style={styles.confirmButton} onPress={confirmPayment}>
        <Text style={styles.confirmText}>Confirm Order</Text>
      </TouchableOpacity>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  orderDetails: {
    flex:1,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
  },
  itemName: { fontSize: 16, fontWeight: "bold" },
  itemQuantity: { fontSize: 14, color: "#555" },
  itemPrice: { fontSize: 16, fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "green" },
  paymentHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 16},
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  paymentOption: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "45%",
  },
  selectedOption: { borderColor: "blue", backgroundColor: "#e6f7ff" },
  optionText: { fontSize: 16, marginTop: 8 },
  confirmButton: {
    backgroundColor: "#fd7e14",
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: "#fd7e14",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paymentHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentOption: {
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: width * 0.4,
  },
  selectedOption: {
    borderColor: "blue",
  },
  optionText: {
    marginTop: 5,
    fontSize: 14,
  },
  paymentDetails: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  detailsLabel: {
    fontSize: 16,
    color: "#555",
  },
  detailsLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsValue: {
    fontSize: 16,
    color: "#555",
  },
  detailsValueBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default PaymentDetails;
