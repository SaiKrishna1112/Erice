import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartData, setCartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grandTotal,setGrandTotal] = useState(null)
  const customerId = "1";

 

  const fetchCartData = async () => {

    axios
      .get(
        `https://meta.oxyloans.com/api/erice-service/cart/customersCartItems?customerId=4`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4IiwiaWF0IjoxNzMwODkxMDQ2LCJleHAiOjE3MzE3NTUwNDZ9.J4zeUAJtwDap40bvXA9zkQz7tHGRkdgMkIPfY8oJcYILhlYQ8_qi75YSEPlG0Zszah03oqIitj7NJ49I1pe4qg`,
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




  const totalCart = async () => {
    try {
      const response = await axios({
        url: 'https://meta.oxyloans.com/api/erice-service/cart/cartItemData',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzMwOTc1NTExLCJleHAiOjE3MzE4Mzk1MTF9.YEDnYZBtnICi3laH39b1IIc5OdtEUR_xkoBncCgfiEXTALqyo8HB7tgoGgpe7VwZ8k8ap-82V_zIvG2M_BI-kQ'
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
        console.error("Failed to increase cart item:", err);
      });
  };

  const decreaseCartItem = async (item) => {
    console.log(item.itemId);

    const accessToken = await AsyncStorage.getItem("accessToken");
    if (item.cartQuantity > 1) {
      axios
        .patch(
          `https://meta.oxyloans.com/api/erice-service/cart/decrementCartData`,
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
        .then((response) => {
          console.log("item decremented successfully");
          
          fetchCartData();
          totalCart();
        console.log("item deleted successfully");
        console.log(response.data);
        
        
        })
        .catch((err) => {
          console.error("Failed to decrease cart item:", err);
        });
    }
  };

  const removeCartItem = async (item) => {
    console.log("remove cart id");
    
    console.log(item.cartId);
    
    const accessToken = await AsyncStorage.getItem("accessToken");
    console.log(accessToken);
    
    // axios
    //   .delete(
    //     `https://meta.oxyloans.com/api/erice-service/cart/remove`,
    //     {
    //       id: item.cartId,
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   )
    axios({
      method:"delete",
      url:`https://meta.oxyloans.com/api/erice-service/cart/remove`,
      data:{
        id: item.cartId,
      },
      headers:{
         Authorization: `Bearer ${accessToken}`
      }
    })
      .then(() => {
        console.log("removed");
        console.log(response.data);
       fetchCartData();
       totalCart();
      })
      .catch((err) => {
        console.error("Failed to remove cart item:", err.response);
      });
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
                  style={styles.removeButton}
                  onPress={() => removeCartItem(item)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
                
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <Text style={styles.emptyCartText}>Your cart is empty.</Text>
      )}
      {cartData && cartData.length > 0 && (
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
              })
            }
          >
            <Text style={styles.actionButtonText}>Checkout</Text>
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
  },
  checkoutButton: {
    backgroundColor: "#F97316",
    padding: 12,
    borderRadius: 8,
    flex: 1,
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
});

export default CartScreen;
