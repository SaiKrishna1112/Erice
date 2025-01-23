import React, { useEffect, useState,useLayoutEffect  } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Pressable, Dimensions,ScrollView} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
import Icon from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../Config";

// ItemDetailsScreen Component
const ItemDetails = ({ route,navigation }) => {
  const { item } = route?.params;
  console.log("Item details page", item);

  const userData = useSelector((state) => state.counter);
  const token = userData?.accessToken;
  const customerId = userData?.userId;

  const [cartData, setCartData] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {

    fetchCartData();
    
  }, []);



  const fetchCartData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}erice-service/cart/customersCartItems?customerId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const cartItemsMap = response.data.reduce((acc, item) => {
        acc[item.itemId] = item.cartQuantity;
        return acc;
      }, {});
     console.log("cart data in item details",cartItemsMap[item.itemId]);
      
       
      setCartData(response.data);
      console.log("cart data",cartData);
      setCartItems(cartItemsMap);
      setCartCount(response.data.length);
    } catch (error) {
      console.error("Error fetching cart items:", error.response);
    }
  };


  const handleRemove = async (item) => {
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: true }));
    await removeCartItem(item);
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: false }));
  };
  
  const handleIncrease = async (item) => {
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: true }));
    await increaseCartItem(item);
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: false }));
  };

  const handleDecrease = async (item) => {
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: true }));
    await decreaseCartItem(item);
    setLoadingItems((prevState) => ({ ...prevState, [item.itemId]: false }));
  };

 


  const decreaseCartItem = async (item) => {
        try {
          // Use cartItems state to get the current quantity for the item
          const currentQuantity = cartItems[item.itemId];
          console.log("Decreasing item ID:", item.itemId, "Current Quantity:", currentQuantity);
      
          if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
      
            const response = await axios.patch(
              `${BASE_URL}erice-service/cart/decrementCartData`,
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
      
            console.log("Item decremented successfully");
            // Update the cartItems state with the new quantity
            setCartItems((prevCartItems) => ({
              ...prevCartItems,
              [item.itemId]: newQuantity,
            }));
            fetchCartData();
          } else {
            // Show the alert only when the current quantity is 1
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
      


const increaseCartItem = async (item) => {
    try {
      console.log("Increasing item ID:", item.itemId);
  
      // Use the current quantity from the cartItems state
      const currentQuantity = cartItems[item.itemId] || 0;
      const newQuantity = currentQuantity + 1;
  
      const response = await axios.patch(
        `${BASE_URL}erice-service/cart/incrementCartData`,
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
  
      console.log("Item incremented successfully");
  
      // Update the cartItems state with the new quantity
      setCartItems((prevCartItems) => ({
        ...prevCartItems,
        [item.itemId]: newQuantity,
      }));
  
      // Optionally fetch the updated cart data to ensure synchronization
      fetchCartData();
    } catch (error) {
      console.error("Failed to increase cart item:", error);
    }
  };

  const getCartItemById = (targetCartId) => {

    console.log({targetCartId});
    
    // Filter the cartData to find the item with the matching cartId
    const filteredCart = cartData.filter(item => item.itemId === targetCartId)
  
    if (filteredCart.length > 0) {
      console.log("Item found:", filteredCart[0]);
      return filteredCart[0]; // Return the first matching item
    } else {
      console.log("No item found with cartId:", targetCartId);
      return null; // Return null if no matching item is found
    }
  };
  
  const removeCartItem = async () => {
    console.log("removed items from cart", cartData);
    console.log("Item",item.itemId);
    
    
    const getRemoveId = getCartItemById(item.itemId);

        // Output result
        if (getRemoveId) {
        console.log("Item found:", getRemoveId);
        } else {
        console.log("Item not found with cartId:", getRemoveId);
        }
       

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
              console.log("Removing cart item with ID:", getRemoveId);

              const response = await axios.delete(
                BASE_URL + "erice-service/cart/remove",
                {
                  data: {
                    id: getRemoveId.cartId,
                  },
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log("Item removed successfully", response.data);

              // Fetch updated cart data and total after item removal
              fetchCartData();
            } catch (error) {
              console.error("Failed to remove cart item:", error.response || error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddToCart = async (item) => {
     if(!userData){
          Alert.alert("Alert","Please login to continue",[{text:"OK",onPress:()=>navigation.navigate("Login")},{text:"Cancel"}])
          return
        }
    const data = { customerId: customerId, itemId: item.itemId, quantity: 1 };
    try {
      const response = await axios.post(
        BASE_URL + "erice-service/cart/add_Items_ToCart",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Item added to cart successfully");
      console.log("Added item to cart:", response.data);

      // Update cart items and cart count
      setCartItems((prevCartItems) => ({
        ...prevCartItems,
        [item.itemId]: 1,
      }));
      setCartCount((prevCartCount) => prevCartCount + 1);
      fetchCartData();
    } catch (error) {
      console.error("Error adding item to cart:", error.response);
    }
  };

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.itemImage }} style={styles.detailImage} />
        <Text style={styles.itemName}>{item.itemName.toUpperCase()}</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 5 }}>
      <View style={styles.descriptionCard}>
  <Text style={styles.descriptionLabel}>Description:</Text>
  <Text style={styles.descriptionText}>{item.itemDescription}</Text>
   </View>
    <View style={styles.infoContainer}>
     {/* Item Info */}
  <View style={styles.infoRow}>
  <Text style={styles.label}>Mrp:</Text>
  <Text style={styles.mrpvalue}>₹ {item.itemMrp}/-</Text>
  </View>
  <View style={styles.infoRow}>
    <Text style={styles.label}>Price:</Text>
    <Text style={styles.value}>₹ {item.itemPrice}/-</Text>
  </View>
  
  <View style={styles.infoRow}>
    <Text style={styles.label}>Weight:</Text>
    <Text style={styles.value}>
      {item.quantity} {item.units}
    </Text>
  </View>
  <View style={styles.infoRow1}>
     <Text style={{alignSelf:"center",alignItems:"center"}}>{item.itemQuantity1}</Text>
  </View>

  {/* Action Section */}
  <View style={styles.actionRow}>
    {cartItems[item.itemId] || loadingItems[item.itemId] ? (
      <View style={styles.quantityContainer}>
        {/* Decrease Button */}
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleDecrease(item)}
          disabled={loadingItems[item.itemId]}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        {/* Loader or Quantity */}
        {loadingItems[item.itemId] ? (
          <ActivityIndicator size="small" color="#000" style={styles.loader} />
        ) : (
          <Text style={styles.quantityText}>{cartItems[item.itemId]}</Text>
        )}

        {/* Increase Button */}
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleIncrease(item)}
          disabled={loadingItems[item.itemId]}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <>
      {item.itemPrice!=1?(
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
        disabled={loadingItems[item.itemId]}
      >
        {loadingItems[item.itemId] ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.addbuttontext}>Add to Cart</Text>
        )}
      </TouchableOpacity>
      ):null}
      </>
    )}
  </View>
 
</View>
</ScrollView>


      <View style={styles.footer}>
  <View style={styles.rowContainer}>
    <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={styles.smallButton}>
      <Text style={styles.buttonText}>Add More</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() =>{
      if (userData){ 
      navigation.navigate("My Cart")
    }else{
      Alert.alert("Alert", "Please login to continue", [{text:"OK", onPress:()=>navigation.navigate("Login")}, {text:"Cancel"}])
    }
    }} style={styles.smallButton}>
      <Text style={styles.buttonText}>View Cart</Text>
    </TouchableOpacity>
  </View>
  
</View>
 
    </View>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  actionRow: {
    height:height/3,
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  detailImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
    backgroundColor: '#eaeaea',
  },
  itemName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoRow1:{
   alignSelf:"center",
   justifyContent:"center",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  descriptionContainer: {
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  quantityContainer: {
  
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#FF6F00',
    padding: 10,
    borderRadius: 5,
    alignSelf:"center",
    alignItems:"center"
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    color: '#fff',
    alignItems: "center",
    alignSelf:"center",
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
    color: '#000',
  },
  loader: {
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: "#FF6F00",
    width: 100,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
    alignItems: "center",
    alignSelf:"center",
    
  },
  addbuttontext:{
    fontSize: 14,
    fontWeight: "bold",
    color: '#fff'
  },
ViewButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 70,
  },
  viewButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop:70,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20, 
  },
  rowContainer: {
    flexDirection: "row", 
    justifyContent: "space-between",
    marginBottom: 20, 
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 10, 
    backgroundColor: "#FF6F00", 
    paddingVertical: 12, 
    borderRadius: 5, 
    alignItems: "center", 
  },
  largeButton: {
    width: "60%", 
    backgroundColor: "#4CAF50", 
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff", // Text color
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 4, // Adds a shadow effect
  },
  mrpvalue:{
    textDecorationLine: 'line-through', 
    color: '#D32F2F', 
  }
});
