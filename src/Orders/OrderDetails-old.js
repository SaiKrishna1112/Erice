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
  Modal,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import { Checkbox } from "react-native-paper";
import BASE_URL from "../../Config";

const { width, height } = Dimensions.get("window");
const OrderDetails = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [orderstatus, setOrderStatus] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsmodelVisible] = useState(false);
  const [isExchangeVisible, setIsExchangeVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { order_id, status } = route.params;
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCancelItems, setSelectedCancelItems] = useState([]);
  // console.log("route",route.params.new_Order_Id);

  console.log("varam", order_id);

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

  const handleExchangeOrder = () => {
    setIsExchangeVisible(true);
  };

  const handlecancelOrder = () => {
    setIsmodelVisible(true);
  };

  const toggleCancelItemSelection = (itemId) => {
    if (selectedCancelItems.includes(itemId)) {
      setSelectedCancelItems(selectedCancelItems.filter((id) => id !== itemId));
    } else {
      setSelectedCancelItems([...selectedCancelItems, itemId]);
    }
  };

  // for exchange item
  const toggleItemSelection = (item) => {
    setSelectedItems((prevSelected) => {
      const updatedItems = prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item];
      console.log("Updated selectedItems:", updatedItems);
      return updatedItems;
    });
  };

  const handleConfirmExchange = () => {
    console.log("Selected Items for Exchange:", selectedItems);
    setIsExchangeVisible(false);
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      Alert.alert(
        "Error",
        "Please provide a reason for cancelling the selected items."
      );
      return;
    }

    try {
      const response = await fetch(
        BASE_URL + "erice-service/order/user_cancel_orderBasedOnItemId",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedItemIds: selectedCancelItems,
            orderId: order_id,
            customerId: customerId,
            cancelReason: cancelReason,
          }),
        }
      );

      if (response.data.status === true) {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              setIsmodelVisible(false);
              navigation.navigate("My Orders");
            },
          },
        ]);
      } else {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              setIsmodelVisible(false);
              navigation.navigate("My Orders");
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error canceling the order:", error);
      Alert.alert(
        "Error",
        "An error occurred while cancelling the order. Please try again."
      );
    }
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
              setIsmodelVisible(false);
              navigation.navigate("My Orders");
            },
          },
        ]);
      } else {
        Alert.alert("Success", response.data.message, [
          {
            text: "OK", 
            onPress: () => {
              setIsmodelVisible(false);
              navigation.navigate("My Orders"); 
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error canceling the order:", error.response);
      Alert.alert(
        "Error",
        "An error occurred while cancelling the order. Please try again."
      );
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
    payment,
    flatNo,
    landMark,
    address,
    pinCode,
    couponValue,
    walletAmount,
    subtotal,
  } = orderDetails;
  console.log("Order details", orderDetails);

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.receiptHeader}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 15,
              color: "#626262",
              alignSelf: "center",
            }}
          >
            Order ID :{" "}
            <Text style={{ fontWeight: "normal", color: "black" }}>
              {route.params.new_Order_Id}
            </Text>
          </Text>
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
                  <Text style={styles.itemDetail}>
                    ₹{item.price * item.quantity}
                  </Text>
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
          <Text style={styles.detailText}>
            Pincode: <Text style={styles.detailValue}>{pinCode}</Text>
          </Text>
          <Text style={styles.detailText}>Address:</Text>
          <Text style={styles.detailValue}>
            {" "}
            {orderDetails.flatNo}, {orderDetails.landMark},
            {orderDetails.address}
          </Text>
        </View>

        {/* Grand Total */}
        <View style={styles.totalSection}>
          {/* Subtotal */}
          <View style={styles.row}>
            <Text style={styles.label}>Sub Total:</Text>
            <Text style={styles.value}>₹{subtotal}</Text>
          </View>

          {/* Delivery Fee */}
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>₹0.00</Text>
          </View>
          {/* coupen value */}
          {couponValue != null && couponValue != 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Coupon Value:</Text>
              <Text style={styles.value}>-₹{couponValue}</Text>
            </View>
          )}
          {/* wallet amount */}
          {walletAmount != null && walletAmount != 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Wallet Amount:</Text>
              <Text style={styles.value}>-₹{walletAmount}</Text>
            </View>
          )}
          {/* Payment Type */}
          <View style={styles.row}>
            <Text style={styles.label}>Payment Type:</Text>
            <Text style={styles.value}>{payment == 2 ? "ONLINE" : "COD"}</Text>
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

      {/* {orderstatus === "6" ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelOrder()}
            disabled={true}
          >
            <Text style={styles.cancelButtonText1}>
              You Already Cancled This Order
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* // yesterday changes */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        {(payment === 1 || payment === 2) &&
        ["1", "2", "3"].includes(orderstatus) ? (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginHorizontal: 5,
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            {/* <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handlecancelOrder()}
              
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
            */}
          </View>
        ) : null}

        {/* {((payment === 1 || payment === 2) && orderstatus == "4") ? (
    <View style={{ flex: 1,justifyContent:"space-between",flexDirection:"row"}}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleExchangeOrder()}
       
      >
        <Text style={styles.cancelButtonText}>Exchange Order</Text>
      </TouchableOpacity>
    </View>
  ) : null} */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate("Write To Us")}
        >
          <Text style={styles.cancelButtonText}>Write To Us</Text>
        </TouchableOpacity>
      </View>

      {isModalVisible && (
        //  <KeyboardAvoidingView>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cancel Reason</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Please enter  a reason"
              multiline={true}
              numberOfLines={4}
              value={cancelReason}
              onChangeText={(text) => setCancelReason(text)}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setIsmodelVisible(false)} // Close the modal
              >
                <Text style={styles.cancelButtonTextModal}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButtonModal}
                onPress={() => {
                  if (!cancelReason.trim()) {
                    Alert.alert(
                      "Sorry",
                      "Please provide a reason for cancelling the order."
                    );
                    return;
                  }
                  cancelOrder(order_id, cancelReason, customerId);
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        // </KeyboardAvoidingView>
      )}

      {/* {isModalVisible && (
  <Modal visible={isModalVisible} transparent animationType="slide">
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Cancel Items</Text>
        <FlatList
          data={orderItems}
          keyExtractor={(item) => item.itemId.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
         <Checkbox
        status={selectedCancelItems.includes(item.itemId) ? 'checked' : 'unchecked'}
       onPress={() => toggleCancelItemSelection(item.itemId)}
       color="blue" 
/>
            <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.itemDetail}>{item.quantity}</Text>
              <Text style={styles.itemDetail}>₹{item.price}</Text>
            </View>
          )}
        />
        <TextInput
          style={styles. modalInput1}
          placeholder="Please enter a reason for cancellation"
          multiline={true}
          numberOfLines={4}
          value={cancelReason}
          onChangeText={(text) => setCancelReason(text)}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton1}
            onPress={() => setIsmodelVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              if (!cancelReason.trim()) {
                Alert.alert(
                  "Error",
                  "Please provide a reason for cancelling the selected items."
                );
                return;
              }
              handleCancelSubmit();
            }}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)} */}

      {orderstatus === "4" ? (
        <View style={styles.footer1}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelOrder()}
            disabled={true}
          >
            <Text style={styles.cancelButtonText1}>
              This Order Has Already Been Delivered
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isExchangeVisible && (
        <Modal visible={isExchangeVisible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Items to Exchange</Text>
              <FlatList
                data={orderItems}
                keyExtractor={(item, index) => index.toString()}
                // keyExtractor={(item)=>item.toString()}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <Checkbox
                      status={
                        selectedCancelItems.includes(item.itemId)
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => toggleCancelItemSelection(item.itemId)}
                      color="blue"
                    />
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemDetail}>{item.quantity}</Text>
                    <Text style={styles.itemDetail}>₹{item.price}</Text>
                  </View>
                )}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton1}
                  onPress={() => setIsExchangeVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmExchange}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    // backgroundColor: "#4CAF50",
    // padding: 15,
    // borderRadius: 8,
    // marginBottom: 20,
    // alignItems: "center",
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
    color: "#000",
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
    color: "#FA7070",
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
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    // alignItems: "center",
    marginTop: 10,
    marginRight: 10,
  },
  cancelButtonTextModal: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButtonText1: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    alignSelf: "center",
  },
  footer: {
    padding: 5,
    borderTopColor: "#ccc",
    // backgroundColor: "#fff",
  },
  footer1: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  modalContainer: {
    position: "absolute",

    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    marginTop: height * 0.3,
    width: width * 0.9,
    height: "auto",
  },
  modal: {
    // backgroundColor: "#c0c0c0",
    padding: 30,
    borderRadius: 15,
    width: width * 0.85,
    // elevation:5,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  modalTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  modalInput: {
    width: width * 0.7,
    height: height / 8,
    // borderColor: "white",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    marginBottom: 25,
  },
  modalInput1: {
    width: width * 0.8,
    height: height / 20,
    borderColor: "#ccc",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.8,
  },
  cancelButtonModal: {
    // backgroundColor: "grey",
    // padding: 10, // Increased padding for the button
    // borderRadius: 10,
    // color: "#fff",
    // flex: 1,
    // marginRight: 15, // Increased space between buttons
    // alignItems: "center",
    backgroundColor: "grey",
    width: width * 0.35,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    // marginRight:10
  },
  submitButtonModal: {
    // backgroundColor: "#4caf50",
    // padding: 15, // Increased padding for the button
    // borderRadius: 10,
    // flex: 1,
    // alignItems: "center",
    backgroundColor: "#4caf50",
    width: width * 0.35,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18, // Larger text for the button
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // modalContainer: {
  //   backgroundColor: "#fff",
  //   marginHorizontal: 20,
  //   borderRadius: 10,
  //   padding: 20,
  //   elevation: 5,
  // },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  cancelButton1: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#00bfff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  checkboxSelected: {
    backgroundColor: "blue",
    borderColor: "blue",
  },
  checkboxTick: {
    color: "white", // Color of the tick mark
    fontSize: 16,
  },
});

export default OrderDetails;
