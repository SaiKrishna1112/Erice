import React, { useEffect, useState ,useCallback} from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { StyleSheet } from "react-native";
import { useNavigation ,useFocusEffect} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../../assets/theme/theme'
import {Alert} from 'react-native'
const CartScreen = () => {
  const navigation = useNavigation();
  const [cartData, setCartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grandTotal,setGrandTotal] = useState(null)
 
  const locationdata = {
    customerId: 4,
    flatNo:'',
    landMark:'',
    pincode:'',
    address:'',
    addressType:'',
    latitude:'',
    longitude:'',
    status:false,
  };
 

  const fetchCartData = async () => {

    axios
      .get(
        `https://meta.oxyloans.com/api/erice-service/cart/customersCartItems?customerId=4`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzMxMTM1MTQ2LCJleHAiOjE3MzE5OTkxNDZ9.L5ifXxdF9bzuG5tgtK-AAS-DWNKoZ1sXNLl_OydCgC5m9ApGzXKCEIUjdET5mMXhhwmqFbY_nip-KPLjLoaZbQ`,
          },
        }
      )

      .then((response) => {
        // console.log(response);
        setCartData(response.data);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load cart data");
        setLoading(false);
      });
  };


  useFocusEffect(
    useCallback(() => {
      fetchCartData();
      totalCart();
    }, [])
  );

  const totalCart = async () => {
    try {
      const response = await axios({
        url: 'https://meta.oxyloans.com/api/erice-service/cart/cartItemData',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzMxMTM1MTQ2LCJleHAiOjE3MzE5OTkxNDZ9.L5ifXxdF9bzuG5tgtK-AAS-DWNKoZ1sXNLl_OydCgC5m9ApGzXKCEIUjdET5mMXhhwmqFbY_nip-KPLjLoaZbQ'
        },
        data: {
          customerId: 4
        }
      });
  
      console.log('Cart data:', response.data);
      setGrandTotal(response.data.totalSum)
      console.log("grand total",grandTotal);
      
    } catch (error) {
      console.error('Error fetching cart data:', error.response);
      setError('Failed to fetch cart data');
    }
  }
  useEffect(() => {
    fetchCartData();
    totalCart();
  }, []);

  const handleImagePress = (item) => {
    navigation.navigate("ItemDetails", { item });
  };

  const increaseCartItem = async (item) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    console.log(item.itemId);

    axios
      .patch(
        `https://meta.oxyloans.com/api/erice-service/cart/incrementCartData`,
        {
          cartQuantity: 1,
          customerId: 4,
          itemId: item.itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        fetchCartData();
        totalCart();
        console.log("hello");
        console.log(response.data);
      })
      .catch((err) => {
        // console.error("Failed to increase cart item:", err);
      });
  };

  const decreaseCartItem = async (item) => {
    try {
      console.log(item.itemId);
  
      const accessToken = await AsyncStorage.getItem("accessToken");
  
      // Check if cartQuantity is greater than 1 before making the API call
      if (item.cartQuantity > 1) {
        const response = await axios.patch(
          `https://meta.oxyloans.com/api/erice-service/cart/decrementCartData`,
          {
            cartQuantity: 1,
            customerId: 4,
            itemId: item.itemId,
          },
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzMxMTM1MTQ2LCJleHAiOjE3MzE5OTkxNDZ9.L5ifXxdF9bzuG5tgtK-AAS-DWNKoZ1sXNLl_OydCgC5m9ApGzXKCEIUjdET5mMXhhwmqFbY_nip-KPLjLoaZbQ`,
              "Content-Type": "application/json",
            },
          }
        );
  
        console.log("Item decremented successfully");
        fetchCartData();
        totalCart();
        console.log("Response data:", response.data);
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
      )
      }
    } catch (error) {
      console.error("Failed to decrease cart item:", error);
    }
  };
  

const removeCartItem = async (item) => {
    // Show confirmation dialog before deleting the item
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
    
              // Retrieve the access token dynamically
              const accessToken = await AsyncStorage.getItem("accessToken");
              if (!accessToken) {
                console.error("No access token found");
                return;
              }
    
              // Make the DELETE request
              const response = await axios.delete("https://meta.oxyloans.com/api/erice-service/cart/remove", {
                data: {
                  id: item.cartId,
                },
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });
    
              console.log("Item removed successfully", response.data);
              
              // Fetch updated cart data and total after item removal
              fetchCartData();
              totalCart();
            } catch (error) {
              console.error("Failed to remove cart item:", error.response || error.message);
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
              <TouchableOpacity onPress={() => handleImagePress(item)}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  onError={() => console.log("Failed to load image")}
                />
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.itemPrice}>Price: ₹{item.priceMrp}</Text>
                <Text style={styles.itemWeight}>
                  Weight: {item.itemQuantity} {item.units}
                </Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseCartItem(item)}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.cartQuantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseCartItem(item)}
                  >
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemTotal}>Total: ₹{(item.priceMrp * item.cartQuantity).toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={{marginLeft:230}}
                  onPress={() => removeCartItem(item)}
                >
                  {/* <Text style={styles.removeButtonText}>Remove</Text> */}
                  <MaterialIcons name="delete" size={23} color="#FF0000"/>
                </TouchableOpacity>
                
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <View style={styles.card}>
      <MaterialIcons name="shopping-cart" size={80} color="#A9A9A9" style={styles.icon} />
       <Text style={{fontSize: 18,color: '#333', marginBottom: 20,}}>Your cart is empty</Text>
        <TouchableOpacity style={{ backgroundColor: COLORS.primary, paddingVertical: 10,paddingHorizontal: 20, borderRadius: 5,}} onPress={()=>navigation.navigate("Rice")}>
          <Text style={{color: '#fff', fontSize: 16,}}>Browse Products</Text>
        </TouchableOpacity>
      </View>
      )}
      {/* {cartData && cartData.length > 0 && ( */}
        <>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Grand Total:₹{grandTotal}</Text>
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
            onPress={() =>
              navigation.navigate("Checkout", {
                subtotal: cartData.reduce(
                  (acc, item) => acc + item.priceMrp * item.cartQuantity,
                  0
                ),
               locationdata

              })
            }
          >
            <Text style={styles.actionButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
        </>
      {/* )} */}
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
  itemImage: {
    width: 80,
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
    marginBottom:70
  },
  checkoutButton: {
    backgroundColor: "#F97316",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginBottom:70
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  totalContainer: {
    fontWeight:"bold",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 20,
   paddingLeft:250
  },
  itemTotal: {
   
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    // marginVertical: 4,
    marginLeft:40,
    marginBottom:20
  },totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  card: {
    width: '80%',
    alignItems: 'center',
    padding: 20,
    marginLeft:35,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default CartScreen;
