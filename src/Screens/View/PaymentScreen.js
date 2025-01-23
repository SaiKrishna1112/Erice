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
  ScrollView,
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
import Icon from "react-native-vector-icons/Ionicons";
const { width, height } = Dimensions.get("window");

const PaymentDetails = ({ navigation, route }) => {
  console.log("payment screen", route.params);

  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [transactionId, setTransactionId] = useState();
  const [couponCode, setCouponCode] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [coupenDetails, setCoupenDetails] = useState("");
  const [coupenApplied, setCoupenApplied] = useState(false);
  const [walletTotal, setWalletTotal] = useState("");
  // wallet states
  const [useWallet, setUseWallet] = useState(false);
  const [totalSum, setTotalSum] = useState("");
  const [walletAmount, setWalletAmount] = useState();
  const [billAmount, setBillAmount] = useState();
  const [status, setStatus] = useState();
  const [grandTotalAmount, setGrandTotalAmount] = useState();
  const [message, setMessge] = useState();
  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });
  const [loading, setLoading] = useState(false);

  // console.log({ customerId });
  const items = route.params?.items || [];

  // console.log("Items:", items);
  // console.log(route.params)
  var addressDetails = route.params.address;

  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  var calculatedTotal;
  useEffect(() => {
    calculatedTotal = items.reduce(
      (total, item) => total + item.cartQuantity * item.itemPrice,
      0
    );
    console.log(
      "grand total",
      items.reduce(
        (total, item) => total + item.cartQuantity * item.itemPrice,
        0
      )
    );
    // Alert.alert("calculatedTotal",calculatedTotal)
    console.log("calculated total", calculatedTotal);

    setTotalAmount(calculatedTotal);
    setGrandTotal(calculatedTotal);
    // setBillAmount(coupenDetails+walletAmount);
  }, [items]);

  const handlePaymentModeSelect = (mode) => {
    setSelectedPaymentMode(mode);
    console.log({ mode });
  };

  const deleteCoupen = () => {
    setCouponCode("");
    setCoupenApplied(false);
    // setTotalAmount(calculatedTotal);
    console.log("coupen removed");
    Alert.alert("coupen removed successfully");
  };

  const confirmPayment = () => {
    if (selectedPaymentMode == null || selectedPaymentMode == "") {
      Alert.alert("Please select payment method");
    } else {
      placeOrder();
    }
    // Alert.alert("payment have to be done")
  };

  useEffect(() => {
    getProfile();
    getOffers();
    getWalletAmount();
  }, []);

  // get wallet amount
  const getWalletAmount = async () => {
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/cart/applyWalletAmountToCustomer`,
        {
          customerId: customerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        console.log("==========useWallet=============");
        console.log("getWalletAmount:", response.data);
        setWalletAmount(response.data.usableWalletAmountForOrder);
        console.log("wallet amount", walletAmount);
        setMessge(response.data.message);
        setTotalSum(response.data.totalSum);
        setStatus();
        setWalletTotal(
          response.data.totalSum - response.data.usableWalletAmountForOrder
        );
        console.log("wallet total", walletTotal);
        console.log("==========useWallet=============");
      }
    } catch (error) {
      console.error(
        "Error applying wallet amount:",
        error.response?.data || error.message
      );
    }
  };

 
  // Handle checkbox toggle
  const handleCheckboxToggle = () => {
    const newValue = !useWallet;
    console.log({ newValue });
    setUseWallet(newValue);
    getWalletAmount();

    if (newValue) {
      // Show alert when the checkbox is checked
      Alert.alert(
        "Wallet Amount Used",
        `You are using ${walletAmount} from your wallet.`,
        [
          {
            text: "OK",
          },
        ]
      );
    } else {
      // Show alert when the checkbox is unchecked
      Alert.alert(
        "Wallet Amount Deselected",
        `You have removed the usage of ${walletAmount} from your wallet.`,
        [
          {
            text: "OK",
          },
        ]
      );
    }
  };

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
        // console.log(response.data);
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
    console.log({ selectedPaymentMode });
    // Ensure that locationData contains the necessary data
    let wallet;
    if (useWallet) {
      wallet = walletAmount;
    } else {
      wallet = null;
    }
    let coupon, coupenAmount;
    if (coupenApplied && coupenDetails > 0) {
      coupon = couponCode.toUpperCase();
      coupenAmount = coupenDetails;
    } else {
      coupon = null;
      coupenAmount = 0;
    }
    postData = {
      address: addressDetails.address,
      amount: grandTotalAmount,
      customerId: customerId,
      flatNo: addressDetails.flatNo,
      landMark: addressDetails.landMark,
      orderStatus: selectedPaymentMode,
      pincode: addressDetails.pincode,
      walletAmount: wallet,
      couponCodeUsed: coupon,
      couponCodeValue: coupenDetails,
      // paymentStatus:{selectedPaymentMode=="COD" ? "":"ONLINE"}
    };

    // console.log({ postData });
    console.log("postdata", postData);

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
          Alert.alert(
            "Order Confirmed!",
            "Your order has been placed successfully . Thank you for shopping with us!",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("My Orders"),
              },
            ]
          );
          // setLoading(false);
          // totalCart()
        } else {
          console.log("paymentId==================", response.data);
          setTransactionId(response.data.paymentId);
          // onlinePaymentFunc()
          console.log("==========");
          const data = {
            mid: "1152305",
            amount: grandTotalAmount,
            // amount: 1,
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
            txnNote: "Rice Order In Live",
            vpa: "Getepay.merchant129014@icici",
          };
          console.log({ data });
          getepayPortal(data);
        }

        // setTimeout(() => {
        //   setLoading(false);
        // }, 7000);
      })
      .catch((error) => {
        console.error("Order Placement Error:", error.response);
        Alert.alert("Error", error.response.data.error);
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
          "Cart Summary",
          `The total amount for your cart is ₹${totalAmount.toFixed(
            2
          )}. Please proceed to checkout to complete your purchase.`,
          [
            // {
            //   text: "yes",
            //   onPress: () => {
            //     Linking.openURL(data.qrIntent);
            //     Requery(data.paymentId);
            //   },
            // },
            {
              text: "No",
              onPress: () => {},
            },
            {
              text: "yes",
              onPress: () => {
                Linking.openURL(data.qrIntent);
                Requery(data.paymentId);
              },
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
        BASE_URL + "erice-service/coupons/getallcoupons",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        // console.log("coupen code", response.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error.response);
    }
  };
  //for applying coupen
  const handleApplyCoupon = () => {
    const data = {
      couponCode: couponCode.toUpperCase(),
      customerId: customerId,
      subTotal: totalAmount,
    };
    console.log("Total amount is  :", totalAmount);

    const response = axios
      .post(BASE_URL + "erice-service/coupons/applycoupontocustomer", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("coupen applied", response.data);
        const { discount, grandTotal } = response.data;
        // setGrandTotal(grandTotal);
        setCoupenDetails(discount);
        Alert.alert(response.data.message);
        setCoupenApplied(response.data.couponApplied);
        console.log("coupenapplied state", response.data.couponApplied);
      })
      .catch((error) => {
        console.log("error", error.response);
      });
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
          var resultobj = JSON.parse(result);
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
                  // setLoading(false);
                  Alert.alert(
                    "Order Confirmed!",
                    "Your order has been placed successfully . Thank you for shopping with us!",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          navigation.navigate("My Orders"), setLoading(false);
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
        .catch((error) => console.log("Payment Status", error));
    }
    // else{
    //   clearInterval(intervalId)
    // }
  }

  function grandTotalfunc() {
    if (coupenApplied === true && useWallet === true) {
      // Alert.alert("Coupen and useWallet Applied",(grandTotal-billAmount))
      setGrandTotalAmount(grandTotal - (coupenDetails + walletAmount));
      console.log(
        "grans total after wallet and coupen",
        grandTotal,
        coupenDetails,
        walletAmount,
        grandTotal - (coupenDetails + walletAmount)
      );
    } else if (coupenApplied === true || useWallet === true) {
      if (coupenApplied === true) {
        setGrandTotalAmount(grandTotal - coupenDetails);
        // Alert.alert("Coupen Applied",grandTotal)
        console.log({ grandTotal });

        console.log(grandTotal - coupenDetails);
      }
      if (useWallet === true) {
        setGrandTotalAmount(walletTotal);
        console.log(walletAmount);

        // Alert.alert("Wallet Applied",(grandTotal-walletAmount))
      }
    } else {
      setGrandTotalAmount(totalAmount);
      // Alert.alert("None",totalAmount)
    }
  }

  useEffect(() => {
    grandTotalfunc();
  }, [coupenApplied, useWallet, grandTotalAmount]);

  return (
    <View style={styles.container}>
      {/* Apply Coupon Section */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.cardHeader}>Apply Coupon</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!coupenApplied}
            />
            {coupenApplied == true ? (
              <TouchableOpacity
                style={styles.delete}
                onPress={() => deleteCoupen()}
              >
                <Text
                  style={{
                    color: "#fd7e14",
                    fontSize: 15,
                    fontStyle: "normal",
                    fontWeight: "bold",
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApplyCoupon()}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {walletAmount > 0 ? (
          <View style={styles.walletContainer}>
            <View style={styles.walletHeader}>
              <Checkbox
                status={useWallet ? "checked" : "unchecked"}
                onPress={handleCheckboxToggle}
                color="#00bfff"
                uncheckedColor="#ccc"
              />
              <Text style={styles.checkboxLabel}>Use Wallet Balance</Text>
            </View>
            <Text style={styles.walletMessage}>
              You can use up to{" "}
              <Text style={styles.highlight}>₹{walletAmount}</Text> from your
              wallet for this order.
            </Text>
          </View>
        ) : (
          <View style={styles.wallet}>
            <Text style={styles.label}>Note:</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        )}
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
              color={selectedPaymentMode === "ONLINE" ? "green" : "black"}
            />
            <Text style={styles.optionText}>Online Payment</Text>
          </TouchableOpacity>
          {grandTotalAmount != 1?(
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
              color={selectedPaymentMode === "COD" ? "green" : "black"}
            />
            <Text style={styles.optionText}>Cash on Delivery</Text>
          </TouchableOpacity>
          ):null}
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetails}>
          <Text style={styles.detailsHeader}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabel}>Sub Total</Text>
            <Text style={styles.detailsValue}>₹{totalAmount}</Text>
          </View>

          {coupenApplied == true && (
            <View style={styles.paymentRow}>
              <Text style={styles.detailsLabel}>Coupon Applied</Text>
              <Text style={styles.detailsValue}>-₹{coupenDetails}</Text>
            </View>
          )}
          {useWallet == true && (
            <View style={styles.paymentRow}>
              <Text style={styles.detailsLabel}>from Wallet</Text>
              <Text style={styles.detailsValue}>-₹{walletAmount}</Text>
            </View>
          )}
          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabel}>Delivery Fee</Text>
            <Text style={styles.detailsValue}>₹0.00</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabelBold}>Grand Total</Text>
            <Text style={styles.detailsValueBold}>₹{grandTotalAmount}</Text>
          </View>
      

          {loading == true ? (
            <View style={styles.confirmButton}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmPayment}
            >
              <Text style={styles.confirmText}>Confirm Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  orderDetails: {
    flex: 1,
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
  paymentHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  paymentOptions: {
    width: width * 0.7,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#4DA1A9",
    borderRadius: 12,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // Shadow for Android
  },
  paymentOption: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    // width: "40%",
    width: width * 0.4,
    backgroundColor: "#c0c0c0",
    borderRadius: 10,
    // width: 180,
    height: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  selectedOption: { borderColor: "green", backgroundColor: "#e6f7ff" },
  optionText: { fontSize: 16, marginTop: 8 },
  confirmButton: {
    backgroundColor: "#fd7e14",
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 7,
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
  // paymentOption: {
  //   alignItems: "center",
  //   padding: 10,
  //   borderWidth: 1,
  //   borderColor: "#ddd",
  //   borderRadius: 8,
  //   width: width * 0.4,
  // },
  selectedOption: {
    borderColor: "green",
    borderWidth: 2,
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
  couponDetails: {
    flexDirection: "row",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  couponText: {
    fontSize: 16,
    color: "#333",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  delete: {
    marginLeft: 20,
    marginRight: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  wallet: {
    padding: 16,
    margin: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  walletContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 10,
    color: "#333",
  },
  walletMessage: {
    fontSize: 12,
    color: "#000",
  },
  highlight: {
    color: "#00bfff",
    fontWeight: "bold",
  },
});

export default PaymentDetails;
