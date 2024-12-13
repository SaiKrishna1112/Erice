/**
 * CheckOut component handles the checkout process for a user.
 * It allows the user to view and select a delivery address, choose a payment method,
 * and place an order with the selected options.
 *
 * Props:
 * - navigation: The navigation object for navigating between screens.
 * - route: The route object containing parameters passed to this screen.
 *
 * State:
 * - addressList: An array of user's addresses fetched from the server.
 * - selectedAddressId: The ID of the currently selected address.
 * - paymentType: The selected payment method (COD or ONLINE).
 * - couponCode: The entered coupon code for discounts.
 * - couponApplied: A boolean indicating whether a coupon has been applied.
 * - applyWalletAmount: A boolean indicating whether wallet amount is being applied.
 * - availableWalletAmount: The available amount in the user's wallet.
 * - subTotal: The subtotal amount of the cart.
 * - discount: The discount amount applied to the cart.
 * - deliveryFee: The delivery fee for the order.
 * - grandTotal: The grand total amount for the order after all calculations.
 * - waitingLoader: A boolean indicating whether a loading indicator should be shown.
 * - addressData: The data of the selected address.
 * - status: A boolean indicating whether a location has been selected.
 * - locationData: The data structure to hold location details.
 *
 * Effects:
 * - useFocusEffect: Calculates totals and sets up address data when component is focused.
 * - useEffect: Fetches cart data when component mounts.
 *
 * Functions:
 * - fetchOrderAddress: Fetches user's address from the server.
 * - totalCart: Fetches and sets the grand total of the cart.
 * - calculateTotal: Calculates the grand total of the order.
 * - changeLocation: Navigates to the MyLocationPage screen.
 * - selectAddress: Selects an address from the list and updates location data.
 * - applyCoupon: Applies the entered coupon code.
 * - removeCoupon: Removes the applied coupon code.
 * - changePaymentType: Sets the payment method.
 * - placeOrder: Places an order with the selected details and handles payment.
 */

import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Linking,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { RadioButton, Checkbox } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import encryptEas from "../Payments/components/encryptEas";
import decryptEas from "../Payments/components/decryptEas";
import { COLORS } from "../../assets/theme/theme";
const { width, height } = Dimensions.get("window");
import BASE_URL from "../../Config";

const CheckOut = ({ navigation, route }) => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;

  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentType, setPaymentType] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyWalletAmount, setApplyWalletAmount] = useState(false);
  const [availableWalletAmount, setAvailableWalletAmount] = useState(1000);
  const [subTotal, setSubTotal] = useState();
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentID, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [waitingLoader, setWaitingLoader] = useState(false);
  const [addressData, setAddressData] = useState();
  const [status, setStatus] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [cartData, setCartData] = useState();
  const [removalLoading, setRemovalLoading] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [loading, setLoading] = useState();

  const [locationData, setLocationData] = useState({
    // customerId:4,
    flatNo: "",
    landMark: "",
    pincode: "",
    address: "",
    addressType: "",
    latitude: "",
    longitude: "",
  });

  useFocusEffect(
    useCallback(() => {
      getProfile();
      calculateTotal();
      totalCart();
      fetchCartData();
      fetchOrderAddress();
      console.log("from my location page", route.params.locationdata);
      setStatus(route.params.locationdata.status);
      setAddressData(route.params.locationdata);
      setLocationData({
        customerId: customerId,
        flatNo: route.params.locationdata.flatNo,
        landMark: route.params.locationdata.landMark,
        pincode: route.params.locationdata.pinCode,
        address: route.params.locationdata.address,
        addressType: route.params.locationdata.type,
        latitude: "",
        longitude: "",
      });

      return () => {
        // Clean up any side effects here if needed
      };
    }, [route.params.locationdata])
  );

  const handleIncrease = async (item) => {
    setLoadingItems((prevState) => ({ ...prevState, [item.cartId]: true }));
    await increaseCartItem(item);
    setLoadingItems((prevState) => ({ ...prevState, [item.cartId]: false }));
  };

  const handleDecrease = async (item) => {
    setLoadingItems((prevState) => ({ ...prevState, [item.cartId]: true }));
    await decreaseCartItem(item);
    setLoadingItems((prevState) => ({ ...prevState, [item.cartId]: false }));
  };

  const fetchCartData = async () => {
    setLoading(true);
    axios
      .get(
        BASE_URL +
          `erice-service/cart/customersCartItems?customerId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      .then((response) => {
        console.log("sudheesh", response.data);

        setCartData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load cart data");
      });
  };

  const handlePlaceOrder = () => {
    if (locationData.address == "" || locationData.address == null) {
      Alert.alert(
        "Address is Mandatory",
        "Please select an address / Add new address before proceeding.",
        [{ text: "OK" }]
      );
    } else {
      navigation.navigate("Order Summary", { addressData: locationData });
    }
    // Alert.alert('Handle Place Order',locationData.address)
  };

  const increaseCartItem = async (item) => {
    const currentQuantity = item.cartQuantity;
    const newQuantity = currentQuantity + 1;

    try {
      const response = await axios.patch(
        BASE_URL + `erice-service/cart/incrementCartData`,
        {
          cartQuantity: newQuantity,
          customerId: customerId,
          itemId: item.itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCartData();
      totalCart();
      setLoading(false);
    } catch (err) {
      console.error("Error updating cart item quantity:", err.response);
    }
  };

  const decreaseCartItem = async (item) => {
    try {
      if (item.cartQuantity > 1) {
        const newQuantity = item.cartQuantity - 1;

        const response = await axios.patch(
          BASE_URL + `erice-service/cart/decrementCartData`,
          {
            cartQuantity: newQuantity,
            customerId: customerId,
            itemId: item.itemId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        fetchCartData();
        totalCart();
        setLoading(false);
      } else {
        Alert.alert(
          "Remove Item",
          "Cart quantity is at the minimum. Do you want to remove this item from the cart?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Yes, Remove",
              onPress: () => removeCartItem(item),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Failed to decrease cart item:", error);
    }
  };

  const removeCartItem = async (item) => {
    console.log("removed items from cart", item);

    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Removing cart item with ID:", item.cartId);

              const response = await axios.delete(
                BASE_URL + "erice-service/cart/remove",
                {
                  data: {
                    id: item.cartId,
                  },
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log("Item removed successfully", response.data);

              fetchCartData();
              totalCart();
              setLoading(false);
            } catch (error) {
              console.error(
                "Failed to remove cart item:",
                error.response || error.message
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
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

  const fetchOrderAddress = async () => {
    try {
      const response = await axios({
        url:
          BASE_URL +
          `erice-service/checkout/orderAddress?customerId=${customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddressList(response.data);
    } catch (error) {
      console.error("Error fetching order address data:", error);
      setError("Failed to fetch order address data");
    }
  };

  const totalCart = async () => {
    setLoading(true);
    try {
      const response = await axios({
        url: BASE_URL + "erice-service/cart/cartItemData",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          customerId: customerId,
        },
      });

      setGrandTotal(response.data.totalSum);
      console.log("sravani grand total ", response.data.totalSum);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setError("Failed to fetch cart data");
    }
  };

  const calculateTotal = () => {
    let total = subTotal + deliveryFee - discount;
    setGrandTotal(total);
    return total;
  };

  const changeLocation = () => {
    console.log("varam");
    console.log(route.params.locationdata);
    navigation.navigate("Address Book");
  };

  const selectAddress = (address) => {
    setSelectedAddressId(address.addressId);

    setLocationData({
      customerId: customerId,
      flatNo: address.flatNo,
      landMark: address.landMark,
      pincode: address.pinCode,
      address: address.address,
      addressType: address.addressType,
      latitude: "",
      longitude: "",
    });
  };

  const applyCoupon = () => {
    if (couponCode) {
      setCouponApplied(true);
    } else {
      Alert.alert("Enter a valid coupon");
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
  };

  const changePaymentType = (type) => {
    console.log({ type });

    setPaymentType(type);
  };

  const placeOrder = () => {
    console.log("Location Data:", locationData);

    // Ensure that locationData contains the necessary data
    const postData = {
      address: locationData.address,
      amount: grandTotal,
      customerId: locationData.customerId,
      flatNo: locationData.flatNo,
      landMark: locationData.landMark,
      orderStatus: paymentType,
      pincode: locationData.pincode,
      sellerId: locationData.sellerId,
    };

    console.log("Post Data:", postData);

    // axios({
    //     method: 'POST',
    //     url: BASE_URL+'erice-service/checkout/orderPlacedPaymet',
    //     data: postData,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //     }
    // })
    // .then((response) => {
    //     console.log("Order Placed Response:", response.data);

    //     // Handle COD or other payment types here
    //     if (paymentType === null || paymentType === 'COD') {
    //         Alert.alert("Order Placed!");
    //         totalCart()
    //     } else {
    //         setTransactionId(response.data.paymentId)
    //         // onlinePaymentFunc()
    //         const data = {
    //             mid: "786437",
    //             amount: 1,
    //             merchantTransactionId: response.data.paymentId,
    //             transactionDate: new Date(),
    //             terminalId: "Getepay.merchant129014@icici",
    //             udf1: profileForm.customer_mobile,
    //             udf2: profileForm.customer_name,
    //             udf3: profileForm.customer_email,
    //             udf4: "",
    //             udf5: "",
    //             udf6: "",
    //             udf7: "",
    //             udf8: "",
    //             udf9: "",
    //             udf10: "",
    //             ru: "https://app.oxybricks.world/interact/paymentreturn",
    //             callbackUrl: "https://fintech.oxyloans.com/oxyloans/v1/user/getepay",
    //             currency: "INR",
    //             paymentMode: "ALL",
    //             bankId: "",
    //             txnType: "single",
    //             productType: "IPG",
    //             txnNote: "Live Txn",
    //             vpa: "Getepay.merchant129014@icici",

    //           }
    //           console.log({ data })
    //           getepayPortal(data);
    //     }
    // })
    // .catch((error) => {
    //     console.error("Order Placement Error:", error);
    // });
  };

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
          "Amount of cart details: INR " + grandTotal,
          [
            {
              text: "yes",
              onPress: () => {
                Linking.openURL(data.qrIntent);
                // Requery(data.paymentId)
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
  };

  function Requery(paymentId) {
    if (
      paymentStatus === "PENDING" ||
      paymentStatus === "" ||
      paymentStatus === null
    ) {
      // console.log("Before.....",paymentId)

      const Config = {
        "Getepay Mid": 786437,
        "Getepay Terminal Id": "Getepay.merchant129014@icici",
        "Getepay Key": "h9OfpK2eT1L8kU6PQaHK/w==",
        "Getepay IV": "PaLE/C1iL1IX/o4nmerh5g==",
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
      <Text style={styles.title}>Delivery Address</Text>
      <TouchableOpacity onPress={changeLocation}>
        <Text style={styles.addButton}>+ Add New Address</Text>
      </TouchableOpacity>

      {status ? (
        <View style={styles.addressRow}>
          <Text style={styles.addressText}>
            {locationData.flatNo}, {locationData.landMark}
          </Text>
          <Text style={styles.addressDetail}>
            Address: {locationData.address}
          </Text>
          <TouchableOpacity>
            <Text style={styles.selectedButton}>Selected</Text>
          </TouchableOpacity>
        </View>
      ) : addressList.length > 0 ? (
        addressList.slice(0, 1).map((address, index) => (
          <View key={index} style={styles.addressRow}>
            <Text style={styles.addressText}>
              {address.flatNo}, {address.landMark}, {address.pinCode}
            </Text>
            <Text style={styles.addressDetail}>Address: {address.address}</Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Address Confirmation",
                  "Are you sure you want to select this address?",
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Selection Cancelled"),
                      style: "cancel",
                    },
                    {
                      text: "Confirm",
                      onPress: () => {
                        // Update the selected address only if the user confirms
                        setSelectedAddressId(address.addressId);
                        setLocationData({
                          flatNo: address.flatNo,
                          landMark: address.landMark,
                          pincode: address.pinCode,
                          address: address.address,
                          addressType: "",
                          latitude: "",
                          longitude: "",
                        });
                        console.log("Address Selected:", address.addressId);
                      },
                    },
                  ]
                );
              }}
            >
              <Text
                style={
                  selectedAddressId === address.addressId
                    ? styles.selectedButton
                    : styles.selectButton
                }
              >
                {selectedAddressId === address.addressId
                  ? "Selected"
                  : "Select"}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.noDeliveryRow}>
          <Text style={styles.noDeliveryText}>
            No address found. Add a new address above.
          </Text>
        </View>
      )}

      <View style={styles.container1}>
        <Text>My Cart</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={cartData}
            keyExtractor={(item) => item.itemId.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                {removalLoading[item.itemId] ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#000" />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        onError={() => console.log("Failed to load image")}
                      />
                    </TouchableOpacity>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemPrice}>
                        Price: ₹{item.priceMrp}
                      </Text>
                      <Text style={styles.itemWeight}>
                        Weight: {item.itemQuantity} {item.units}
                      </Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleDecrease(item)}
                          disabled={loadingItems[item.itemId]}
                        >
                          <Text style={styles.buttonText}>-</Text>
                        </TouchableOpacity>

                        {/* Show loader in the middle when loading */}
                        {loadingItems[item.itemId] ? (
                          <ActivityIndicator
                            size="small"
                            color="#000"
                            style={styles.loader}
                          />
                        ) : (
                          <Text style={styles.quantityText}>
                            {item.cartQuantity}
                          </Text>
                        )}

                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleIncrease(item)}
                          disabled={loadingItems[item.itemId]}
                        >
                          <Text style={styles.buttonText}>+</Text>
                        </TouchableOpacity>

                        <Text style={styles.itemTotal}>
                          Total: ₹
                          {(item.priceMrp * item.cartQuantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Payment Details */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <View style={styles.paymentDetails}>
          <Text style={styles.detailText}>Sub Total: ₹{grandTotal}</Text>
          <Text style={styles.detailText}>Discount: ₹{discount}</Text>
          <Text style={styles.detailText}>Delivery Fee: ₹{deliveryFee}</Text>
          {applyWalletAmount && (
            <Text style={styles.detailText}>
              From Wallet: ₹{availableWalletAmount}
            </Text>
          )}
          <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        {/* <Text style={styles.grandTotalText1}> ₹{grandTotal}</Text> */}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: addressData ? "#fd7e14" : "#d3d3d3" },
          ]}
          onPress={() => handlePlaceOrder()}
          // onPress={()=>navigation.navigate("Order Summary",{addressData:selectedAddressId})}
          // disabled={ !addressData}
        >
          <Text style={styles.placeOrderButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
    width: "100%",
  },
  container1: {
    marginTop: 5,
    padding: 10,
    // borderColor:"#000",
    // borderWidth:5,
    height: height * 0.2,
    // backgroundColor: '#f8f9fa',
    // width:'100%',
    flex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
    textAlign: "left",
    marginTop: 10,
  },
  addButton: {
    // color: '#007bff',
    color: COLORS.primary,
    textAlign: "right",
    fontWeight: "600",
    marginBottom: 15,
  },
  addressRow: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  addressDetail: {
    fontSize: 12,
    color: "#6c757d",
  },
  noDeliveryRow: {
    backgroundColor: "#e9ecef",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  noDeliveryText: {
    color: "#6c757d",
  },
  selectButton: {
    color: "#28a745",
    fontWeight: "600",
    marginTop: 5,
  },
  selectedButton: {
    color: "#007bff",
    fontWeight: "600",
    marginTop: 5,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#343a40",
    marginTop: 15,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 2,
  },
  paymentImage: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  applyButton: {
    color: "#007bff",
    marginLeft: 8,
    fontWeight: "600",
  },
  removeCouponButton: {
    color: "#dc3545",
    marginLeft: 8,
    fontWeight: "600",
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentDetails: {
    // marginTop:30,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 5,
    marginLeft: 40,
  },
  grandTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    // marginTop:5,
  },
  grandTotalText1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    // marginTop:0,
    marginBottom: 2,
    marginTop: 9,
  },
  placeOrderButton: {
    // flex:3,
    // backgroundColor: '#007bff',
    backgroundColor: COLORS.primary,
    padding: 10,

    alignSelf: "center",
    borderRadius: 8,
    width: width * 1,
    // marginTop: 5,
    borderRadius: 20,
    alignItems: "center",

    // marginBottom:100
  },
  placeOrderButtonText: {
    marginBottom:20,
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign:"center",
    alignSelf:"center",
    justifyContent:"center"
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
  itemImage: {
    width: width * 0.2,
    height: 80,
    marginRight: 16,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#16A34A",
  },
  itemWeight: {
    color: "#6B7280",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#D1D5DB",
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  buttonText: {
    fontWeight: "bold",
  },
  quantityText: {
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    width: 150,
  },
  removeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  flatListContent: {
    paddingBottom: 80,
  },
  loader: {
    marginHorizontal: 10,
    alignSelf: "center",
  },
});

export default CheckOut;
