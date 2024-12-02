import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useSelector } from "react-redux";
import BASE_URL from "../../../Config";

const OrderDetails = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { order_id,status } = route.params;
  console.log(route.params);
  
  console.log("varam",order_id);
  
  useEffect(() => {
    getOrderDetails();
  }, []);

  const getOrderDetails = async () => {
    const data = {
      method: 'post',
      url: BASE_URL+'erice-service/order/orderIdAndDbId', 
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { orderId: order_id },
    };

    try {
      const response = await axios(data);
      setOrderData(response.data);
      console.log("about order by id",response.data);
      
    } catch (error) {
      console.error("Error fetching order details:", error.response);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const orderDetails = orderData.length > 0 ? orderData[0] : null;
  if (!orderDetails) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Loading Order Details...</Text>
      </View>
    );
  }

  const { customerName, customerMobile, grandTotal, orderAddress, orderItems ,deliveryFee,paymentType} = orderDetails;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.receiptHeader}>
        <Text style={styles.headerText}>Order Receipt</Text>
        <Text style={styles.orderId}>Order ID: {order_id}</Text>
      </View>

      

      {/* Order Items */}
     {orderItems.length>0?(
  <View style={styles.section}>
  <Text style={styles.sectionTitle}>Order Items</Text>
  {/* Header Row */}
  <View style={styles.headerRow}>
    <Text style={styles.headerText}>Item Name</Text>
    <Text style={styles.headerText}>Quantity</Text>
    <Text style={styles.headerText}>Price</Text>
  </View>

  {/* FlatList */}
  <FlatList
    data={orderItems}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.itemRow}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.itemDetail}>{item.quantity}</Text>
        <Text style={styles.itemDetail}>₹{item.price}</Text>
      </View>
    )}
  />
</View>):null}
  
     {/* Billing Details */}
     <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Details</Text>
        <Text style={styles.detailText}>Customer Name: <Text style={styles.detailValue}>{customerName}</Text></Text>
        <Text style={styles.detailText}>Mobile: <Text style={styles.detailValue}>{customerMobile}</Text></Text>
        <Text style={styles.detailText}>Address:</Text>
        <Text style={styles.detailValue}>
          {orderAddress.flatNo}, {orderAddress.landMark}, {orderAddress.address}
        </Text>
      </View>


      {/* Grand Total */}
      <View style={styles.totalSection}>
  {/* Subtotal */}
  <View style={styles.row}>
    <Text style={styles.label}>Sub Total:</Text>
    <Text style={styles.value}>₹{grandTotal.toFixed(2)}</Text>
  </View>

  {/* Delivery Fee */}
  <View style={styles.row}>
    <Text style={styles.label}>Delivery Fee:</Text>
    <Text style={styles.value}>₹0.00</Text>
  </View>

  {/* Payment Type */}
  <View style={styles.row}>
    <Text style={styles.label}>Payment Type:</Text>
    <Text style={styles.value}>{paymentType === 2 ? 'ONLINE' : 'COD'}</Text>
  </View>

  {/* Order Status */}
  <View style={styles.row}>
    <Text style={styles.label}>Order Status:</Text>
    <Text style={styles.value}>{status}</Text>
  </View>

  {/* Grand Total */}
  <View style={styles.grandTotalRow}>
    <Text style={styles.grandTotalLabel}>Grand Total:</Text>
    <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
  </View>
</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptHeader: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderId: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    flex: 2,
  },
  itemDetail: {
    fontSize: 16,
    flex: 1,
    // textAlign: 'right',
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f2f2f2',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  totalSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30', 
  },
});

export default OrderDetails;


