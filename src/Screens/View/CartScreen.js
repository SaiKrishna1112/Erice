import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../../assets/theme/theme";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
const { width, height } = Dimensions.get("window");
import BASE_URL from "../../../Config";
const CartScreen = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  // console.log({userData})

  const [dats, setData] = useState();
  const navigation = useNavigation();
  const [cartData, setCartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grandTotal, setGrandTotal] = useState(null);
  const [cartId, setCartId] = useState();
  const [loadingItems, setLoadingItems] = useState({});
  const [removalLoading, setRemovalLoading] = useState({});
  const [user, setUser] = useState({});
  const [deleteLoader, setDeleteLoader] = useState(false);

  const [address, setAddress] = useState({
    email: "",
    mobileNumber: "",
    name: "",
    alterMobileNumber: "",
  });
  const locationdata = {
    // customerId: 4,data
    flatNo: "",
    landMark: "",
    pincode: "",
    address: "",
    addressType: "",
    latitude: "",
    longitude: "",
    status: false,
  };
  // const cartIds="";

  const addressdata = {
    addressId: "",
    hasId: false,
  };

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

  const handleRemove = async (item) => {
    setRemovalLoading((prevState) => ({ ...prevState, [item.cartId]: true }));
    await removeCartItem(item);
    setRemovalLoading((prevState) => ({ ...prevState, [item.cartId]: false }));
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
        console.log("Display cart items", response.data);
        setLoading(false);
        setData(response.data);
        setCartData(response.data);
        // console.log("cart length", cartData.length);

        // setCartId(response.data);
        // console.log("cartId",cartData);
        // cartIds = response.data.map(item => item.cartId);
        // console.log("cartids",cartIds);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        // console.log(error.response);

        setError("Failed to load cart data");
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartData();
      totalCart();
      getProfile();
    }, [])
  );

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
        // console.log("customerProfileDetails", response.data);
        setUser(response.data);
        setAddress(response.data);
        // console.log("user", user);
      }
      // console.log("user dress....",address)
      // showToast(response.data.msg || 'Profile loaded successfully');
    } catch (error) {
      console.error(error);
      showToast("Error loading profile");
    }
  };
  const totalCart = async () => {
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

      // console.log("Cart data:", response.data);
      setGrandTotal(response.data.totalSum);
      // setCartData(response.data.cartResponseList);
      // console.log("cart data1", cartData);

      // console.log("grand total",grandTotal);
    } catch (error) {
      console.error("Error fetching cart data:", error.response);
      setError("Failed to fetch cart data");
    }
  };
  useEffect(() => {
    fetchCartData();
    // totalCart();
  }, []);

  const handleImagePress = (item) => {
    navigation.navigate("ItemDetails", { item });
  };

  const increaseCartItem = async (item) => {
    // const accessToken = await AsyncStorage.getItem("accessToken");
    // setLoading(true)
    // console.log("Item to increase", item);
    // console.log("Item ID", item.itemId);
    // console.log("Current Cart Quantity", item.cartQuantity);

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
      // console.log("Cart item quantity updated successfully:", response.data);
    } catch (err) {
      // console.error("Error updating cart item quantity:", err.response);
    }
  };

  const decreaseCartItem = async (item) => {
    // setLoading(true)
    try {
      // console.log("Decreasing item ID:", item.itemId);

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

        // console.log("Item decremented successfully");

        fetchCartData();
        totalCart();
        setLoading(false);
        // console.log("Response data:", response.data);
      } else {
        // If cartQuantity is 1 or less, prompt user to remove item
        // setDeleteLoader(false)
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
      // console.error("Failed to decrease cart item:", error);
    }
  };

  const removeCartItem = async (item) => {
    // setLoading(true)
    // Show confirmation dialog before deleting the item
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
              // console.log("Removing cart item with ID:", item.cartId);
              setDeleteLoader(true);
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

              // console.log("Item removed successfully", response.data);
              setDeleteLoader(false);
              // Fetch updated cart data and total after item removal
              fetchCartData();
              totalCart();
              setLoading(false);
            } catch (error) {
              // console.error(
              //   "Failed to remove cart item:",
              //   error.response || error.message
              // );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : cartData && cartData.length > 0 ? (
        <FlatList
          data={cartData}
          keyExtractor={(item) => item.itemId.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              {removalLoading[item.cartId] ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              ) : (
                <>
                  {/* <Text>dcx</Text> */}
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
                    <View>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        onError={() => console.log("Failed to load image")}
                      />
                    </View>
                    <View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        {/* <Text style={styles.itemPrice}>
                        Mrp: ₹{item.priceMrp} 
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₹{item.itemPrice} 
                      </Text> */}
                        <View style={styles.priceContainer}>
                          <Text style={[styles.itemPrice, styles.crossedPrice]}>
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
                            disabled={loadingItems[item.cartId]}
                          >
                            <Text style={styles.buttonText}>-</Text>
                          </TouchableOpacity>
                          {/* Show loader in the middle when loading */}
                          {loadingItems[item.cartId] ? (
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
                              disabled={loadingItems[item.cartId]}
                            >
                              <Text style={styles.buttonText}>+</Text>
                            </TouchableOpacity>
                          ) : (
                            <View
                              style={styles.quantityButton1}
                              onPress={() => handleIncrease(item)}
                              disabled={loadingItems[item.cartId]}
                            >
                              <Text style={styles.buttonText}>+</Text>
                            </View>
                          )}
                          <Text style={styles.itemTotal}>
                            Total: ₹
                            {(item.itemPrice * item.cartQuantity).toFixed(2)}
                          </Text>
                        </View>
                        {/* {deleteLoader==false? */}
                        <TouchableOpacity
                          style={{ marginLeft: 180 }}
                          onPress={() => handleRemove(item)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={23}
                            color="#FF0000"
                          />
                        </TouchableOpacity>
                        {/* :
                      <View
                        style={{ marginLeft: 180 }}
                      >
                        <ActivityIndicator name="delete" size={23} color="#FF0000" />
                      </View>
            }  */}
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
        />
      ) : (
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
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>Browse Items</Text>
          </TouchableOpacity>
        </View>
      )}
      {cartData && cartData.length > 0 && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Grand Total : ₹{grandTotal}</Text>
          </View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.actionButtonText}>Add More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                if (
                  (address.email.trim() == null ||
                    address.email.trim() == "") &&
                  (address.name.trim() == null || address.name.trim() == "") &&
                  (address.mobileNumber.trim() !== null ||
                    address.mobileNumber.trim() !== "") &&
                  (address.alterMobileNumber.trim() !== null ||
                    address.alterMobileNumber.trim() !== "")
                ) {
                  // Show alert if user profile is incomplete
                  Alert.alert(
                    "Incomplete Profile",
                    "Please fill out your profile to proceed.",
                    [
                      {
                        text: "OK",
                        onPress: () => navigation.navigate("Profile"),
                      },
                    ]
                  );
                } else {
                  // Navigate to checkout page if profile is complete
                  navigation.navigate("Checkout", {
                    subtotal: cartData.reduce(
                      (acc, item) => acc + item.priceMrp * item.cartQuantity,
                      0
                    ),
                    locationdata,
                    addressdata,
                  });
                }
              }}
            >
              <Text style={styles.actionButtonText}> Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 20,
  },
  error: {
    color: "#EF4444",
    textAlign: "center",
    marginTop: 20,
  },
  cartItem: {
    // height:"auto",
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
  itemImage: {
    width: width * 0.2,
    height: height / 8,
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
    width: width * 0.6,
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
  emptyCartText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    marginBottom: 70,
  },
  checkoutButton: {
    backgroundColor: "#F97316",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginBottom: 70,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  totalContainer: {
    fontWeight: "bold",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
    // marginBottom: 10,
    // paddingLeft: 0,
    //  marginTop:100
    marginLeft: 0,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    // marginVertical: 4,
    marginLeft: 10,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  card: {
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
  loader: {
    // marginHorizontal: 10,
    alignSelf: "center",
    // backgroundColor: "#808080",
    // padding: 8,
    borderRadius: 4,
    // marginHorizontal: 8,

  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional semi-transparent background
    zIndex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
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
});

export default CartScreen;
