import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import BASE_URL from "../../../Erice/Config";
const OrderSummaryScreen = ({ navigation, route }) => {
 

  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState([]);
  const [user,setUser] = useState();
  const[totalAmount,setTotalAmount]=useState('')

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
      getProfile ();
      console.log("from checkout screen", route.params.addressData);
      setAddress(route.params.addressData);
    }, [])
  );

  const fetchCartItems = async () => {
    try {
      const response = await fetch(
        BASE_URL +
          `erice-service/cart/customersCartItems?customerId=${customerId}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCartItems(data);
      
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };


  const getProfile = async () => {
    // const mobile_No = AsyncStorage.getItem('mobileNumber');
   
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
      // console.log(response.data);

      if (response.status === 200) {
        console.log("customerProfileDetails",response.data);
        setUser(response.data);
       
      }
      // showToast(response.data.msg || 'Profile loaded successfully');
    } catch (error) {
      console.error(error);
      showToast("Error loading profile");
    }
  };
  
 
  const formatOrderDetails = () => {
    let orderDetails = "📦 *Order Summary* 📦\n\n";
  
    // Define column headers with proper spacing
    orderDetails += `Item Name               Quantity   Price\n`;
    orderDetails += `${"-".repeat(45)}\n`;
  
    // Format each cart item with dynamic spacing
    cartItems.forEach((item) => {
      const maxItemNameLength = 20;
      const itemName = item.itemName.length > maxItemNameLength
        ? `${item.itemName.substring(0, maxItemNameLength)}...`
        : item.itemName;
  
      const quantity = item.cartQuantity.toString();
      const price = `₹${item.priceMrp.toFixed(2)}`;
  
      // Add formatted item details with consistent spacing
      orderDetails += `${itemName.padEnd(22)} ${quantity.padStart(8)} ${price.padStart(10)}\n`;
    });
  
    // Calculate total price
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.priceMrp * item.cartQuantity,
      0
    );
  
    // Add summary section
    orderDetails += `${"-".repeat(45)}\n`;
    orderDetails += `🔢 Total Items: ${cartItems.length.toString().padStart(29)}\n`;
    orderDetails += `💸 Total Price: ₹${totalAmount.toFixed(2).padStart(10)}\n`;
    // console.log(totalAmount)
    return orderDetails;
  };
  

  // Function to handle continue button press
  // const handleContinuePress = () => {
  //   const orderDetails = formatOrderDetails();
  //   console.log("user",user);
    
  //      if(user.email && user.name && user.mobileNumber != null){
   
  //   Alert.alert(
  //     "Confirm Order",
  //     orderDetails,
  //     [
  //       {
  //         text: "Cancel",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Confirm",
  //         onPress: () =>
  //           navigation.navigate("Payment Details", {
  //             items: cartItems,
  //             address: address,
  //           }),
  //       },
  //     ],
     
  //   );
  // } else{
  //    Alert.alert(
  //     "please fill the profile",
  //     [
  //       {
  //         text: "OK",
  //         onPress: () => navigation.navigate("Profile"), 
  //       },
  //     ]
  //    )
  // }
  // };


  const handleContinuePress = () => {
    const orderDetails = formatOrderDetails();
    console.log("user", user);
  
    if (
      user.email?.trim() &&
      user.name?.trim() &&
      user.mobileNumber?.trim()
    ) {
      Alert.alert(
        "Confirm Order",
        orderDetails,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: () =>
              navigation.navigate("Payment Details", {
                items: cartItems,
                address: address,
              }),
          },
        ]
      );
    } else {
      Alert.alert(
        "Incomplete Profile",
        "Please fill in your profile before proceeding.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Navigating to profile");
              navigation.navigate("Profile"); 
            },
          },
        ]
      );
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.progressTracker}>
        <View style={styles.step}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Address</Text>
        </View>
        <View style={styles.connector} />
        <View style={styles.step}>
          <View style={[styles.stepCircle, styles.activeStepCircle]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>
            Order Summary
          </Text>
        </View>
        <View style={styles.connector} />
        <View style={styles.step}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Payment</Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <Icon name="home" size={20} color="#000" style={styles.addressIcon} />
          <Text style={styles.addressTitle}>{address.address}</Text>
        </View>
        <Text style={styles.addressDetails}>{address.flatNo}</Text>
        <Text style={styles.addressDetails}>{address.landMark}</Text>
        {/* <TouchableOpacity onPress={() => navigation.navigate("AddressScreen")} style={styles.changeButton}>
        <Text style={styles.changeText}>Change</Text>
      </TouchableOpacity> */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartId.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={{
                  uri: item.image || "https://via.placeholder.com/150",
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text>
                  Quantity: {item.cartQuantity} {item.units}
                </Text>
                <Text>Price: ₹{item.priceMrp}</Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinuePress}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  progressTracker: { flexDirection: "row", justifyContent: "space-around" },
  activeStep: { fontWeight: "bold", color: "#fd7e14" },

  changeText: { color: "blue", marginTop: 8 },
  loader: { marginVertical: 20 },
  cartItem: {
    flexDirection: "row",
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  itemImage: { width: 60, height: 60, marginRight: 16, borderRadius: 8 },
  itemDetails: { flex: 1, justifyContent: "center" },
  itemName: { fontWeight: "bold", marginBottom: 4 },
  continueButton: {
    padding: 16,
    // backgroundColor: "blue",
    backgroundColor: "#fd7e14",
    alignItems: "center",
    marginTop: 16,
  },
  continueText: { color: "#fff", fontWeight: "bold" },
  progressTracker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  step: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  completedStep: {
    backgroundColor: "green",
  },
  activeStepCircle: {
    backgroundColor: "blue",
    borderWidth: 2,
    borderColor: "blue",
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  activeStepLabel: {
    color: "blue",
    fontWeight: "bold",
  },
  connector: {
    height: 2,
    backgroundColor: "#ddd",
    flex: 1,
    marginHorizontal: 8,
  },
  addressIcon: {
    marginRight: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // flex:1
  },
  addressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressIcon: {
    marginRight: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  addressDetails: {
    fontSize: 14,
    color: "#555",
    marginLeft: 30,
    marginBottom: 5,
  },
});

export default OrderSummaryScreen;