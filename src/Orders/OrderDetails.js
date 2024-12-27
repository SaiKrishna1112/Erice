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
import Checkbox from "expo-checkbox"; // Assuming you're using expo-checkbox
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
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedCancelItems, setSelectedCancelItems] = useState({});
  const [hideCancelbtn, setHideCancelBtn] = useState(false);
  const [isExchangeComplete, setIsExchangeComplete] = useState(false);

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
      
    };

    try {
      const response = await axios(data);
      // Update order data
      setOrderData(response.data);

      const orderStatus = response.data[0].orderstatus;
      setOrderStatus(orderStatus);

      console.log("Fetched order details:", response.data);
      // console.log("Order status (direct from response):", orderStatus);
    } catch (error) {
      // console.error("Error fetching order details:", error.response);
    }
  };

  // for exchange item

  // const toggleExchangeItemSelection = (id) => {
  //   setSelectedCancelItems((prev) => ({
  //     ...prev,
  //     [id]: prev[id]
  //       ? { ...prev[id], checked: !prev[id].checked }
  //       : { checked: true, reason: "" },
  //   }));
  // };
  // const handleExchangeReason = (id, text,quantity) => {
  //   setSelectedCancelItems((prev) => ({
  //     ...prev,
  //     [id]: { ...prev[id], reason: text ,quantity:quantity},
  //   }));
  // };

  const toggleExchangeItemSelection = (id, quantity) => {
    console.log("quntity", quantity);

    setSelectedCancelItems((prev) => ({
      ...prev,
      [id]: prev[id]
        ? { ...prev[id], checked: !prev[id].checked }
        : { checked: true, reason: "", quantity },
    }));
  };

  const handleExchangeReason = (id, text) => {
    setSelectedCancelItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason: text },
    }));
  };

  const handleExchangeSubmit = () => {
    const result = Object.entries(selectedCancelItems)
      .filter(([_, value]) => value.checked)
      .map(([key, value]) => ({
        itemId: key,
        cancelReason: value.reason,
      }));

    const hasEmptyReasons = result.some((item) => !item.cancelReason);

    if (hasEmptyReasons) {
      Alert.alert("Error", "Please provide a reason for Exchange.");
      return;
    }

    console.log("Cancel Data:", result);

    const data = {
      exchangeListItemRequest: result,
      exchangeQuantity: 1,
      orderId: order_id,
      type: "exchange",
      userId: customerId,
    };
    console.log("exchange data", data);
    axios({
      url: `${BASE_URL}erice-service/order/exchangeOrder`,
      method: "patch",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json",
      },
      data: data,
    })
      .then((res) => {
        console.log("response", res);
        Alert.alert("Success", res.data.type, [
          {
            text: "OK",
            onPress: () => navigation.navigate("My Exchanged Item Details"),
          },
        ]);

        getOrderDetails();
      })
      .catch((err) => {
        console.log("error cancel", err.response);
      });
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
  } = orderDetails;
  // console.log("Order details",orderDetails);

  const toggleCancelItemSelection = (id) => {
    setSelectedCancelItems((prev) => ({
      ...prev,
      [id]: prev[id]
        ? { ...prev[id], checked: !prev[id].checked }
        : { checked: true, reason: "" },
    }));
  };

  const handleCancelReason = (id, text) => {
    setSelectedCancelItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason: text },
    }));
  };

  const handleCancelSubmit = () => {
    const result = Object.entries(selectedCancelItems)
      .filter(([_, value]) => value.checked)
      .map(([key, value]) => ({
        itemId: key,
        cancelReason: value.reason,
        orderId: order_id,
      }));

    const hasEmptyReasons = result.some((item) => !item.cancelReason);

    if (hasEmptyReasons) {
      Alert.alert(
        "Error",
        "Please provide a reason for cancelling all selected items."
      );
      return;
    }

    // console.log("cancel Data:", result);
    const data = {
      userId: customerId,
      refundDtoList: result,
    };

    // console.log({ data });

    axios({
      url: `${BASE_URL}erice-service/order/user_cancel_orderBasedOnItemId`,
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json",
      },
      data: data,
    })
      .then((res) => {
        console.log("response", res.data);
        Alert.alert("Success", res.data.message, [
          {
            text: "OK",
            onPress: () => navigation.navigate("My Cancelled Item Details"),
          },
        ]);
        setIsmodelVisible(false)
        getOrderDetails();
      })
      .catch((err) => {
        console.log("error cancel", err.response);
      });
  };

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
            <Text style={styles.detailValue}>{customerName} </Text>
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

      {orderstatus === "6" ? (
        <View style={styles.footer}>
          <Text style={styles.cancelButtonText1}>
            You Already Cancelled This Order
          </Text>
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
        {orderstatus !== "6" ? (
          <View>
            {orderstatus == 1 || orderstatus == 2 || orderstatus == 3 ? (
              // ["1", "2", "3"].includes(orderstatus) && (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  marginHorizontal: 5,
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsmodelVisible(true)}
                >
                  <View>
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : orderstatus == 4 ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  marginHorizontal: 5,
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                }}
              >
                {/* <TouchableOpacity style={styles.cancelButton} onPress={()=>setIsExchangeVisible(true)}>
                <View>
                  <Text style={styles.cancelButtonText}>Exchange Order</Text>
                </View>
              </TouchableOpacity> */}
                {isExchangeVisible && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsExchangeVisible(false)}
                  >
                    <View>
                      <Text style={styles.cancelButtonText}>
                        Exchange Order
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate("Rice")}
          >
            <View>
              <Text style={styles.cancelButtonText}>Reorder</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate("Write To Us")}
        >
          <Text style={styles.cancelButtonText}>Write To Us</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate("User Cancelled Order Details")}
        >
          <Text style={styles.cancelButtonText}>Cancellation</Text>
        </TouchableOpacity> */}
      </View>

      {isModalVisible && (
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Cancel Items</Text>
              <FlatList
                data={orderItems}
                keyExtractor={(item) => item.itemId.toString()}
                renderItem={({ item }) => (
                  <View>
                    <View style={styles.itemRow}>
                      <Checkbox
                        value={
                          selectedCancelItems[item.itemId]?.checked || false
                        }
                        onValueChange={() =>
                          toggleCancelItemSelection(item.itemId)
                        }
                        color="green"
                      />
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemDetail}>{item.quantity}</Text>
                      <Text style={styles.itemDetail}>₹{item.price}</Text>
                    </View>
                    {selectedCancelItems[item.itemId]?.checked && (
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Please enter a reason for cancellation"
                        multiline
                        numberOfLines={4}
                        value={selectedCancelItems[item.itemId]?.reason || ""}
                        onChangeText={(text) =>
                          handleCancelReason(item.itemId, text)
                        }
                      />
                    )}
                  </View>
                )}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsmodelVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleCancelSubmit()}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
              <Text style={styles.modalTitle}>Exchange Items</Text>
              <FlatList
                data={orderItems}
                keyExtractor={(item) => item.itemId.toString()}
                renderItem={({ item }) => (
                  <View>
                    <View style={styles.itemRow}>
                      <Checkbox
                        value={
                          selectedCancelItems[item.itemId]?.checked || false
                        }
                        onValueChange={() =>
                          toggleExchangeItemSelection(
                            item.itemId,
                            item.quantity
                          )
                        }
                        color="green"
                      />
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemDetail}>{item.quantity}</Text>
                      <Text style={styles.itemDetail}>₹{item.price}</Text>
                    </View>
                    {selectedCancelItems[item.itemId]?.checked && (
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Please enter a reason for cancellation"
                        multiline
                        numberOfLines={4}
                        value={selectedCancelItems[item.itemId]?.reason || ""}
                        onChangeText={(text) =>
                          handleExchangeReason(item.itemId, text)
                        }
                      />
                    )}
                  </View>
                )}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsExchangeVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleExchangeSubmit()}
                >
                  <Text style={styles.buttonText}>Submit</Text>
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
    marginLeft: 15,
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
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: width * 0.4,
  },
  submitButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    width: width * 0.4,
    alignSelf: "center",
    justifyContent: "center",
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
    // marginTop:-30,
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
    width: width * 0.8,
    height: height / 8,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    marginBottom: 25,
    marginLeft: 10,
  },
  modalInput1: {
    width: width * 0.8,
    // height: height/2,
    borderColor: "#ccc",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.8,
  },
  cancelButtonModal: {
    backgroundColor: "grey",
    width: width * 0.35,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    // marginRight:10
  },
  submitButtonModal: {
    backgroundColor: "#4caf50",
    width: width * 0.35,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
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
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "black",
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
    justifyContent: "space-between",
    flexDirection: "row",
  },
  checkboxSelected: {
    backgroundColor: "blue",
    borderColor: "blue",
  },
  checkboxTick: {
    color: "white",
    fontSize: 16,
  },
});

export default OrderDetails;
