import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import React, { useState, useCallback } from "react";
import BASE_URL from "../../Config";
import { useSelector } from "react-redux";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import axios from "axios";
const { height, width } = Dimensions.get("window");

const UserExchangeOrderDetails = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  //  const [cancelledItems,setCancelledItems] = useState([])
  const navigation = useNavigation();
  console.log(customerId);
const [exchangedItems,setExchangedItems]=useState([])
  useFocusEffect(
    useCallback(() => {
      getUserExchangedItems();
    }, [])
  );
  const getUserExchangedItems = async () => {
    try {
      const response = await axios({
        url: `${BASE_URL}erice-service/order/getExchangeOrders/${customerId}`,
        method: "get",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response Data:", response.data);
      setExchangedItems(response.data)
    } catch (error) {
      console.error("Error fetching canceled items:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text>OrderId: ₹{item.orderId}</Text>
      <Text>ItemPrice: {item.itemPrice}</Text>
      <Text>Exchange Reason: {item.reason}</Text>
    
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.button} onPress={()=>getUserExchangedItems()}>
        <Text style={styles.buttonText}>User Exchanged Items</Text>
      </TouchableOpacity> */}

      {exchangedItems.length > 0 ? (
        <FlatList
        showsVerticalScrollIndicator={false}
          data={exchangedItems}
          keyExtractor={(item) => item.itemId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No Exchanged items to display.</Text>
      )}
    </View>
  );
};

export default UserExchangeOrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#605678",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 16,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  reOrderButton: {
    width: width * 0.3,
    backgroundColor: "#FF7F3E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: "center",
    alignItems: "center",
  },
});
