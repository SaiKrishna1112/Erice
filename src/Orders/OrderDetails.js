import React, { useState, useEffect } from "react";
import {
  TextInput,
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import BASE_URL from "../../Config";

const OrderDetails = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [orderstatus, setOrderStatus] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsmodelVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { order_id, status } = route.params;
  // console.log(route.params);

  // console.log("varam", order_id);

  useEffect(() => {
    getOrderDetails();
  }, []);

  const getOrderDetails = async () => {
    const data = {
      method: "get",
      url: BASE_URL + "erice-service/order/getOrdersByOrderId/" + order_id,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // data: { orderId: order_id },
    };

    try {
      const response = await axios(data);
      // Update order data
      setOrderData(response.data);

      const orderStatus = response.data[0].orderstatus;
      setOrderStatus(orderStatus);

      console.log("Fetched order details:", response.data);
      console.log("Order status (direct from response):", orderStatus);
    } catch (error) {
      console.error("Error fetching order details:", error.response);
    }
  };

  const handlecancelOrder = () => {
    setIsmodelVisible(true);
  };

  const cancelOrder = async (order_id, cancelReason, customerId) => {
    try {
      const data = {
        method: "post",
        url: BASE_URL + "erice-service/order/user_cancel_order",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          orderId: order_id,
          reason: cancelReason,  
          userId: customerId,
        },
      };
  
      const response = await axios(data);
      
      if (response.data.status === true) {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK", // On press of OK, navigate to the orders page
            onPress: () => {
              setIsmodelVisible(false);  // Close the modal
              navigation.navigate("My Orders"); // Replace "Orders" with your actual screen name
            },
          },
        ]);
       

      } else {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK", // On press of OK, navigate to the orders page
            onPress: () => {
              setIsmodelVisible(false);  // Close the modal
              navigation.navigate("My Orders"); // Replace "Orders" with your actual screen name
            },
          },
        ]);
        
      }
    } catch (error) {
      console.error("Error canceling the order:", error.response);
      Alert.alert("Error", "An error occurred while canceling the order. Please try again.");
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

  const {
    customerName,
    customermobilenumber,
    granttotal,
    orderItems,
    deliveryFee,
    paymentType,
    flatNo,
    landMark,
    address,
  } = orderDetails;

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.receiptHeader}>
          <Text style={styles.headerText}>Order Receipt</Text>
          <Text style={styles.orderId}>Order ID: {order_id}</Text>
        </View>

        {/* Order Items */}
        {orderItems.length > 0 ? (
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
          </View>
        ) : null}

        {/* Billing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <Text style={styles.detailText}>
            Customer Name:{" "}
            <Text style={styles.detailValue}>{customerName}</Text>
          </Text>
          <Text style={styles.detailText}>
            Mobile:{" "}
            <Text style={styles.detailValue}>{customermobilenumber}</Text>
          </Text>
          <Text style={styles.detailText}>Address:</Text>
          <Text style={styles.detailValue}>
            {" "}
            {orderDetails.flatNo}, {orderDetails.landMark},{" "}
            {orderDetails.address}
          </Text>
        </View>

        {/* Grand Total */}
        <View style={styles.totalSection}>
          {/* Subtotal */}
          <View style={styles.row}>
            <Text style={styles.label}>Sub Total:</Text>
            <Text style={styles.value}>₹{granttotal}</Text>
          </View>

          {/* Delivery Fee */}
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>₹0.00</Text>
          </View>

          {/* Payment Type */}
          <View style={styles.row}>
            <Text style={styles.label}>Payment Type:</Text>
            <Text style={styles.value}>
              {paymentType === 2 ? "ONLINE" : "COD"}
            </Text>
          </View>

          {/* Order Status */}
          <View style={styles.row}>
            <Text style={styles.label}>Order Status:</Text>
            <Text style={styles.value}>{status}</Text>
          </View>

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>₹{granttotal}</Text>
          </View>
        </View>
      </ScrollView>
      {orderstatus === "6" ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelOrder()}
            disabled={true}
          >
            <Text style={styles.cancelButtonText}>
              You Already Cancled This Order
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {orderstatus === "1" ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handlecancelOrder()}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isModalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cancel Reason</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason"
              value={cancelReason}
              onChangeText={(text) => setCancelReason(text)}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setIsmodelVisible(false)} // Close the modal
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButtonModal}
                onPress={() => {
                  cancelOrder(order_id, cancelReason, customerId);
                  
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  receiptHeader: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  orderId: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
    // alignSelf:"center"
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  detailValue: {
    fontWeight: "600",
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f2f2f2",
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  totalSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3b30",
  },
  flatNo: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  landMark: {
    fontSize: 16,
    color: "#000",
    fontStyle: "italic",
  },
  address: {
    fontSize: 16,
    color: "#000",
    textDecorationLine: "underline",
  },
  cancelButton: {
    backgroundColor: "#FA7070",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Slightly darker background for more contrast
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30, // Increased padding inside the modal
    borderRadius: 15, // Rounded corners for a more spacious look
    width: "85%", // Increased width of the modal
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22, // Larger title text
    fontWeight: "bold",
    marginBottom: 25, // Increased margin for more space
  },
  modalInput: {
    width: "100%",
    height: 50, // Larger height for the input field
    borderColor: "#ccc",
    borderWidth: 1.5, // Slightly thicker border
    borderRadius: 10, // Rounded corners
    paddingLeft: 15, // More padding inside the input field
    fontSize: 18, // Larger font size for easier readability
    marginBottom: 25, // More space between input and buttons
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButtonModal: {
    backgroundColor: "grey",
    padding: 15, // Increased padding for the button
    borderRadius: 10,
    color:"#fff",
    flex: 1,
    marginRight: 15, // Increased space between buttons
    alignItems: "center",
  },
  submitButtonModal: {
    backgroundColor: "#4caf50",
    padding: 15, // Increased padding for the button
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18, // Larger text for the button
    fontWeight: "bold",
  },
});

export default OrderDetails;
