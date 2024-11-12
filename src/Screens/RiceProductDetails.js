import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import Animated from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import CartScreen from "./View/CartScreen";
const { height, width } = Dimensions.get("window");
import { useSelector } from 'react-redux';


const RiceProductDetails = ({ route, navigation }) => {

      
  const userData = useSelector(state => state.counter);
  const token=userData.accessToken
  const customerId=userData.userId

  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartCount,setCartCount] = useState(0);

  useEffect(() => {
    setItems(route.params.details.itemsResponseDtoList);
    
  }, []);

  useEffect(() => {
    // Fetch cart items for the user
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          `https://meta.oxyloans.com/api/erice-service/cart/customersCartItems?customerId=${customerId}`,
          {
            headers: { 
              Authorization: `Bearer ${token}` 
            },
          }
        );
        
        const cartData = response.data;
        const cartItemsMap = cartData.reduce((acc, item) => {
          acc[item.itemId] = item.cartQuantity;
          // console.log({acc});
          
          return acc;
        }, {});
        // console.log(cartItemsMap);
        setCartItems(cartItemsMap);
        setCartCount(cartData.length);
        console.log("cart count",cartCount);
        
      } catch (error) {
        console.error("Error fetching cart items:", error.response);
      }
    };

    fetchCartItems();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 15 }}>
          <Pressable onPress={() => navigation.navigate("My Cart")}>
            <View style={styles.cartIconContainer}>
              <Icon name="cart-outline" size={30} color="#FFF" />
              {cartCount > 0 && (
                <View style={{position: "absolute",
                  right: -8,
                  top: -5,
                  backgroundColor: "#FF6F00",
                  borderRadius: 10,
                  paddingHorizontal: 5,
                  paddingVertical: 1,}}>
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold",}}>{cartCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      ),
    });
  }, [navigation,cartCount]);
  
  const UpdateCartCount = (newCount)=>setCartCount(newCount);
  const handleAddToCart = async (item) => {
    const data = { customerId: customerId, itemId: item.itemId, quantity: 1 };
    try {
      const response = await axios.post(
        "https://meta.oxyloans.com/api/erice-service/cart/add_Items_ToCart",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Item added to cart successfully");

      setCartItems((prevCartItems) => ({
        ...prevCartItems,
        [item.itemId]: 1, // Item is added with a quantity of 1
      }));
      UpdateCartCount(cartCount+1);
    } catch (error) {
      console.error("Error adding item to cart:", error.response);
    }
  };

  const incrementQuantity = async (item) => {
    const newQuantity = cartItems[item.itemId] + 1;

    const data = { customerId: customerId, itemId: item.itemId, quantity: newQuantity };
    try {
      await axios.patch(
        "https://meta.oxyloans.com/api/erice-service/cart/incrementCartData",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCartItems((prevCartItems) => ({
        ...prevCartItems,
        [item.itemId]: newQuantity,
      }));
      console.log("increment data");
      // UpdateCartCount(cartCount+1);
      // console.log(response.data);
      
    } catch (error) {
      console.error("Error incrementing item quantity:", error.response);
    }
  };

  const decrementQuantity = async (item) => {
    const newQuantity = cartItems[item.itemId] - 1;
    if (newQuantity === 0) {
      // Optionally, remove the item from the cart
      setCartItems((prevCartItems) => {
        const updatedCartItems = { ...prevCartItems };
        delete updatedCartItems[item.itemId];
        return updatedCartItems;
      });
      Alert.alert("Item removed", "Item removed from the cart");
    } else {
      const data = { customerId: customerId, itemId: item.itemId, quantity: newQuantity };
      try {
        await axios.patch(
          "https://meta.oxyloans.com/api/erice-service/cart/decrementCartData",
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCartItems((prevCartItems) => ({
          ...prevCartItems,
          [item.itemId]: newQuantity,
        }));
        console.log("decremented cart data");
        UpdateCartCount(cartCount - 1);
      } catch (error) {
        console.error("Error decrementing item quantity:", error.response);
      }
    }
  };

  const renderItem = ({ item }) => {
    const itemQuantity1 = cartItems[item.itemId] || 0;
    
    return (
      <Animated.View key={item.itemId}>
        <View style={styles.productContainer}>
          <Image
            source={{ uri: item.itemImage }}
            style={styles.productImage}
          />
          <View>
            <Text>{item.priceMrp}</Text>
            <Text style={styles.productName}>{item.itemName}</Text>
            <Text style={styles.productPrice}>MRP: Rs.{item.itemMrp}/-</Text>
            <Text style={styles.productWeight}>
              {item.quantity} {item.units}
            </Text>
            {itemQuantity1 > 0 ? (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(item)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{itemQuantity1}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(item)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={require("../../assets/Images/1.jpg")}
          style={styles.banner}
        />
        <FlatList
          data={items}
          keyExtractor={(item) => item.itemId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};

export default RiceProductDetails;

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    width: width,
    height: 250,
    resizeMode: "cover",
    marginVertical: 10,
  },
  cartIconContainer: {
    position: "relative",
  },
  productContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
  },
  productImage: {
    height: height / 8,
    width: width * 0.25,
    alignSelf: "center",
    margin: 5,
    marginRight: 30,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "bold",
    marginTop: 4,
  },
  productWeight: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: "#FF6F00",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
});




