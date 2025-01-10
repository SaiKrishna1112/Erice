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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../assets/theme/theme";
const { width, height } = Dimensions.get("window");
import Icon from "react-native-vector-icons/FontAwesome";
import BASE_URL from "../../Config";
import { getCoordinates } from "../Screens/Address/LocationService";

const CheckOut = ({ navigation, route }) => {
  // console.log("from cartscreen", route.params);

  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  console.log({customerId})

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
  const [grandStatus, setGrandStatus] = useState(false);

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
      console.log("from my location page", route.params.locationdata);
    

      if(route.params.locationdata.status==false){
        fetchOrderAddress();
      }
      else{
        setStatus(route.params.locationdata.status);
        setAddressData(route.params.locationdata);
        setLocationData({
          customerId: customerId,
          flatNo: route.params.locationdata.flatNo,
          landMark: route.params.locationdata.landMark,
          pincode: route.params.locationdata.pincode,
          address: route.params.locationdata.address,
          addressType: route.params.locationdata.type,
          latitude: "",
          longitude: "",
        });
      }
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
        console.log("mrpprices", response.data);

        setCartData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load cart data");
      });
  };

  // useEffect(()=>{
  //   fetchOrderAddress()
  // },[])
  let alertShown = false;
  const handlePlaceOrder = async() => {
    console.log({ grandTotal });
    console.log("locationdata==================================", locationData);
   console.log("addresslist",addressList);
   const value = locationData.address + "," + locationData.landMark + "," + locationData.pincode;
   if (!alertShown && (locationData.address == "" || locationData.address == null) &&( addressList == null||addressList.length==0)) {
     
    Alert.alert(
      "Address is Mandatory",
      "Please select an address / Add new address before proceeding.",
      [{ text: "OK", onPress: () => navigation.navigate("Address Book") }]
      );
    alertShown = true;
    return false
  }
   if(value != null || value != ""){
    const { status,isWithin, distanceInKm,coord1 }  = await getCoordinates(value);
  // console.log("results for checkout",results);
  if(isWithin == true){
    console.log("within radius");
    if (grandTotal == 0 || grandTotal == null) {
      setGrandStatus(true);
      return false;
    } else {
      navigation.navigate("Order Summary", { addressData: locationData });
    }
  }else{
    console.log("not within radius");
    return false;
  }
}
 
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

  function handleAddress(address){
    setSelectedAddressId(address.id);
    setLocationData({
      flatNo: address.flatNo,
      landMark: address.landMark,
      pincode: address.pincode,
      address: address.address,
      addressType: "",
      latitude: "",
      longitude: "",
    });
  }

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
        url: BASE_URL + `erice-service/user/getAllAdd?customerId=${customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
       console.log("address response",response.data);
       
      setAddressList(response.data);
      response.data.slice(-1).map((address) => (
      setSelectedAddressId(address.id),
      setLocationData({
        flatNo: address.flatNo,
        landMark: address.landMark,
        pincode: address.pincode,
        address: address.address,
        addressType: "",
        latitude: "",
        longitude: "",
      })
    ))
      console.log("address response", response.data);
    } catch (error) {
      console.error("Error fetching order address data:", error.response);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Address</Text>
      <TouchableOpacity onPress={changeLocation}>
        {addressList === undefined || addressList.length==0 || locationData == null? (
        <Text style={styles.addButton}>+ Add Address</Text>
      ):
      
      (
      <View style ={{flexDirection:"row",marginLeft:180}}>
        <Icon name="edit" size={18} color="#fd7e14" style={styles.icon} />
        <Text style={styles.addButton}>Change Address</Text>
      </View>
      )
      }
      </TouchableOpacity>

      {status ? (
        <View style={styles.addressRow}>
          <Text style={styles.addressText}>
            {locationData.flatNo}, {locationData.landMark}
          </Text>
          <Text style={styles.addressDetail}>
            Address: {locationData.address}
          </Text>
         {/* <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Selected</Text>
          </TouchableOpacity> */}
        </View>
      ) : addressList.length > 0 ? (
        addressList.slice(-1).map((address, index) => (
          <View key={index} style={styles.addressRow}>
            {/* {handleAddress(address)} */}
            <View style={styles.iconAndTextContainer}>
              <Icon
                name="map-marker"
                size={30}
                color="#007bff"
                style={styles.icon}
              />
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>
                  {address.flatNo}, {address.landMark},{address.pincode}
                </Text>
             

                <Text style={styles.addressText}>{address.address}</Text>
              </View>
            </View>

            {/* <TouchableOpacity
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
                        setSelectedAddressId(address.id);
                        setLocationData({
                          flatNo: address.flatNo,
                          landMark: address.landMark,
                          pincode: address.pincode,
                          address: address.address,
                          addressType: "",
                          latitude: "",
                          longitude: "",
                        });
                        console.log("Address Selected:", address);
                      },
                    },
                  ]
                );
              }}
            >
              <Text
                style={
                  selectedAddressId === address.id
                    ? styles.smallButton
                    : styles.smallButton
                }
              >
                {selectedAddressId === address.id ? "Selected" : "Selected"}
              </Text>
            </TouchableOpacity> */}
          </View>
        ))
      ) : (
        <View style={styles.noDeliveryRow}>
          <Text style={styles.noDeliveryText}>
            No address found. Add a new address above.
          </Text>
        </View>
      )}

      {grandStatus == true ? (
        <View>
          {/* <Text>Browse</Text> */}

          <View style={styles.card}>
            <MaterialIcons
              name="shopping-cart"
              size={80}
              color="#A9A9A9"
              style={styles.icon}
            />
            <Text style={{ fontSize: 18, color: "#333", marginBottom: 20 }}>
              Your cart is empty
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate("Rice")}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                Browse Products
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.container1}>
        {!grandStatus ? <Text>My Cart</Text> : null}
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : cartData || cartData != null || cartData != [] ? (
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
                    {item.itemQuantity == 1 ? (
                      <Text
                        style={{
                          textAlign: "center",
                          color: "red",
                          marginBottom: 5,
                          fontWeight: "bold",
                        }}
                      >
                        Note : Only one free sample is allowed per user.
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                          onError={() => console.log("Failed to load image")}
                        />
                      </TouchableOpacity>
                      <View>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.itemName}</Text>
                          {/* <Text style={styles.itemPrice}>
                        Price: ₹{item.priceMrp}
                      </Text> */}
                          <View style={styles.priceContainer}>
                            <Text
                              style={[styles.itemPrice, styles.crossedPrice]}
                            >
                              MRP: ₹{item.priceMrp}
                            </Text>
                            <Text style={[styles.itemPrice, styles.boldPrice]}>
                              ₹{item.itemPrice}
                            </Text>
                          </View>
                          <Text style={{marginTop:5}}>
                                ({Math.round(((item.priceMrp- item.itemPrice) / item.priceMrp) * 100)}% OFF)
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

                            {item.itemQuantity != 1 ? (
                              <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleIncrease(item)}
                                disabled={loadingItems[item.itemId]}
                              >
                                <Text style={styles.buttonText}>+</Text>
                              </TouchableOpacity>
                            ) : (
                              <View
                                style={styles.quantityButton1}
                                onPress={() => handleIncrease(item)}
                                disabled={loadingItems[item.itemId]}
                              >
                                <Text style={styles.buttonText}>+</Text>
                              </View>
                            )}
                            <Text style={styles.itemTotal}>
                              Total: ₹
                              {(item.itemPrice* item.cartQuantity).toFixed(2)}
                            </Text>
                          </View>
                        </View>
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
        ) : (
          <View>
            <Text>Cart is empty</Text>
          </View>
        )}
      </View>
      {/* Payment Details */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <View style={styles.paymentDetails}>
          <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        {/* <Text style={styles.grandTotalText1}> ₹{grandTotal}</Text> */}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            // { backgroundColor: addressData ? "#fd7e14" : "#d3d3d3" },
          ]}
          onPress={() => handlePlaceOrder()}
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
    height: height * 0.3,

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
    marginLeft:0
  },
  addressRow: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
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
    alignSelf: "center",
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 5,
    marginLeft: 40,
  },
  grandTotalText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    // marginLeft:30
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
    backgroundColor: COLORS.primary,
    padding: 10,

    alignSelf: "center",
    borderRadius: 8,
    width: width * 0.9,

    borderRadius: 5,
    alignItems: "center",

    marginBottom: 20,
  },
  placeOrderButtonText: {
    // marginBottom:20,
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  cartItem: {
    // flexDirection: "row",
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
    width: width * 0.5,
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
    backgroundColor: "#808080",
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  quantityButton1: {
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
    // marginHorizontal: 10,
    alignSelf: "center",
  },
  cardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "column",
    borderColor: "#FA7070",
    borderStyle: "solid",
  },
  iconAndTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  addressContainer: {
    flex: 1,
  },
  addressText: {
    paddingLeft:15,
    marginLeft:5,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  card: {
    marginTop: 40,
    width: "80%",
    alignItems: "center",
    padding: 20,
    marginLeft: 35,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  smallButton: {
    marginTop: 10,
    marginLeft: 280,
    backgroundColor: "#fd7e14",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: width / 5,
    textDecorationColor: "white",
    fontWeight: "bold",
  },
  smallButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom:3,
  },
  itemPrice: {
    fontSize: 16,
    marginRight: 10,
  },
  crossedPrice: {
    textDecorationLine: "line-through",
    color: "#D32F2F",
  },
  boldPrice: {
    fontWeight: "bold",
    color: "#388E3C",
  },
  icon: {
    paddingLeft:30,
    marginRight: 5,
    fontWeight:"bold"
  },
});

export default CheckOut;
