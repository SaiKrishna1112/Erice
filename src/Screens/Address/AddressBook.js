import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";

const AddressBook = ({ route }) => {

      
  const userData = useSelector(state => state.counter);
  const token=userData.accessToken
  const customerId=userData.userId
  const [addres, setAddress] = useState(null);
  const [addressList, setAddressList] = useState([]);

  // // Setting address only when `route.params.profile` changes
  // useEffect(() => {
  //   if (route.params?.profile) {
  //     setAddress(route.params.profile);
  //     console.log("Address book", route.params.profile.customer_email);
  //     console.log("delivery address", addres);
  //   }
  // }, [route.params?.profile]);

  // Fetching order address when screen is focused
  
  useFocusEffect(
    useCallback(() => {
      fetchOrderAddress();
      setAddress(route.params.profile)
    }, [])
  );
   console.log("addressssss",addres);
   
  const fetchOrderAddress = async () => {
    try {
      const response = await axios({
        url: `https://meta.oxyloans.com/api/erice-service/checkout/orderAddress?customerId=${customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          },
      });

      console.log("address data", response.data);
      setAddressList(response.data);
    } catch (error) {
      console.error("Error fetching order address data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Delivery Addresses</Text>
      {addressList.length > 0 ? (
        addressList.slice(0, 4).map((address, index) => (
          <View key={index} style={styles.addressRow}>
            <Text style={styles.addressText}>
              {address.flatNo}, {address.landMark}, {address.pinCode}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.noDeliveryRow}>
          <Text style={styles.noDeliveryText}>
            No address found. Add a new address above.
          </Text>
        </View>
      )}
    </View>
  );
};

export default AddressBook;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
    // textAlign: "left",
    marginTop: 10,
    alignItems:"center",
    textAlign:"center"
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
  noDeliveryRow: {
    padding: 12,
    alignItems: "center",
  },
  noDeliveryText: {
    fontSize: 14,
    color: "#6c757d",
  },
});
