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
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import Checkbox from "expo-checkbox";
import BASE_URL from "../../Config";

const { width, height } = Dimensions.get("window");
const OrderDetails = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [orderstatus, setOrderStatus] = useState();
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
  const [comments, setComments] = useState();
  const [orderFeedback, setOrderFeedback] = useState([]);
  console.log("order id",order_id);
  
  const emojis = [
    { emoji: "😡", label: "Very Bad", color: "#FFB3B3", value: "POOR" },
    { emoji: "😟", label: "Bad", color: "#FFD9B3", value: "BELOWAVERAGE" },
    { emoji: "🙂", label: "Average", color: "#FFFFB3", value: "AVERAGE" },
    { emoji: "😃", label: "Good", color: "#D9FFB3", value: "GOOD" },
    { emoji: "🤩", label: "Excellent", color: "#B3FFB3", value: "EXCELLENT" },
  ];

  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const handleEmojiPress = (index) => {
    setSelectedEmoji(index);
    console.log("Selected emoji:", emojis[index].value);
  };
  let selectedLabel = "";
  const handleSubmit = () => {
    if (selectedEmoji === null || selectedEmoji === undefined) {
      Alert.alert("Feedback Required", "Please select an emoji to proceed.");
    } else {
      selectedLabel = emojis[selectedEmoji].value;
      console.log("Selected feedback:", selectedLabel);
    }
    console.log(comments);

    let data = {
      comments: comments,
      feedbackStatus: selectedLabel,
      feedback_user_id: customerId,
      orderid: order_id,
    };
    console.log({ data });

    axios({
      method: "post",
      url: BASE_URL + "erice-service/checkout/submitfeedback",
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("feedback submitted response", response.data);
        Alert.alert("Success", "Feedback submitted successfully!");
        getOrderDetails();
        // navigation.navigate("Home");
      })
      .catch((error) => {
        console.log(error.response);
        Alert.alert("Error", "Failed to submit feedback.");
      });
  };

  useEffect(() => {
    // handleSubmit()
    // feedbackGet();
  }, []);

  const feedbackGet = async () => {
    axios({
      method: "get",
      url:
        BASE_URL +
        `erice-service/checkout/feedback?feedbackUserId=${customerId}&orderid=${order_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("feedbackGet", response.data);
        setOrderFeedback(response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

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
      console.log("order status", orderStatus);

      console.log("Fetched order details:", response.data);
    } catch (error) {
      // console.error("Error fetching order details:", error.response);
    }
  };

  const toggleExchangeItemSelection = (id, quantity) => {
    // console.log("quntity", quantity);

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
        reason: value.reason,
      }));

    const hasEmptyReasons = result.some((item) => !item.reason);

    if (hasEmptyReasons) {
      Alert.alert("Error", "Please provide a reason for Exchange.");
      return;
    }

    // console.log("Cancel Data:", result);

    const data = {
      exchangeListItemRequest: result,
      exchangeQuantity: 1,
      orderId: order_id,
      type: "exchange",
      userId: customerId,
    };
    // console.log("exchange data", data);
    setLoading(true);
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
        console.log(" exchange response", res);
        Alert.alert("Success", res.data.type, [
          {
            text: "OK",
            onPress: () => navigation.navigate("My Exchanged Item Details"),
          },
        ]);
        setIsExchangeVisible(false);
        getOrderDetails();
        setLoading(false);
      })
      .catch((err) => {
        // console.log("error cancel", err.response);
      });
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
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
    setLoading(true);
    const data = {
      userId: customerId,
      refundDtoList: result,
    };

    console.log({ data });

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
        setIsmodelVisible(false);
        getOrderDetails();
        setLoading(false);
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
          <Text style={styles.sectionTitle}>Order Items</Text>
        ) : null}
        {orderItems.length > 0 ? (
          <View>
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Item Name</Text>
                <Text style={styles.headerText}>Qty</Text>
                <Text style={styles.headerText}>Price</Text>
                <Text style={styles.headerText}>Total</Text>
              </View>

              <FlatList
                data={orderItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemDetail}>{item.quantity}</Text>
                    <Text style={styles.itemDetail}>
                      ₹{item.price / item.quantity}
                    </Text>

                    <Text style={styles.itemDetail}>₹{item.price}</Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        ) : null}

        {/* Feedback */}
        {orderstatus === "4" ? (
          <View>
            {orderFeedback.length === 0 ? (
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
                >
                  Rate your order Experience{" "}
                </Text>
                <View style={styles.section}>
                  <View>
                    {/* <Text style={styles.inputLabel}>Rate your experience</Text> */}
                    <View style={styles.emojiContainer}>
                      {emojis.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.emojiBox,
                            selectedEmoji === index && {
                              backgroundColor: item.color,
                            },
                          ]}
                          onPress={() => handleEmojiPress(index)}
                        >
                          <Text style={styles.emoji}>{item.emoji}</Text>
                          <Text style={styles.emojiLabel}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your feedback (Optional)"
                        value={comments}
                        multiline={true}
                        onChangeText={(text) => setComments(text)}
                        noOfLines={4}
                        scrollEnabled="true"
                      />

                      {selectedEmoji != null ? (
                        <TouchableOpacity
                          onPress={handleSubmit}
                          style={styles.sendBtn}
                        >
                       
                          <Icon name="send" size={20} color="white" />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.ViewSendBtn}>
                          <Icon name="send" size={18} color="white" />
                        </View>
                      )}
                    </View>
                    {/* <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity> */}
                  </View>
                </View>
              </View>
            ) : (
              // <Text>{orderstatus}</Text>
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
                >
                  Rate your order Experience{" "}
                </Text>
                <View style={styles.section}>
                  <Text>Already you have submitted feedback</Text>
                </View>
              </View>
            )}
          </View>
        ) : null}

        {/* Address Details */}
        <Text style={styles.sectionTitle}>Address Details</Text>

        <View style={styles.section}>
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

        {/* Billing Details */}
        <Text style={styles.sectionTitle}>Billing Details</Text>
        <View style={styles.totalSection}>
          {/* Subtotal */}
          <View style={styles.row}>
            <Text style={styles.label}>Sub Total:</Text>
            <Text style={styles.value}>₹{subtotal}</Text>
          </View>

          {/* Delivery Fee */}
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>+₹0.00</Text>
          </View>

          
          {/* coupen value */}
          {(couponValue != null && couponValue !=0) && (
            <View style={styles.row}>
              <Text style={styles.label}>Coupon Value:</Text>
              <Text style={styles.value}>-₹{couponValue}</Text>
            </View>
          )}
          {/* wallet amount */}
          {(walletAmount != null && walletAmount!=0)&& (
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
        {orderstatus !== "6" && orderItems.length != 0 && (
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
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsExchangeVisible(true)}
                >
                  <View>
                    <Text style={styles.cancelButtonText}>Exchange Order</Text>
                  </View>
                </TouchableOpacity>
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
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate("Write To Us")}
        >
          <Text style={styles.cancelButtonText}>Write To Us</Text>
        </TouchableOpacity>
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
                {loading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    <ActivityIndicator size="large" color="#000" />
                  </View>
                )}
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
                {loading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    <ActivityIndicator size="large" color="#000" />
                  </View>
                )}
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

  orderId: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    backgroundColor: "#dcdcdc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    width: width * 0.9,
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
    paddingLeft: 15,
    fontSize: 13,
    flex: 1.5,
    color: "#000",
    width: width * 0.3,
  },
  itemDetail: {
    fontSize: 15,
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
    alignSelf: "center",
  },

  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  feebacksection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    width: width * 0.7,
    // height: 40,
  },
  sendBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: width * 0.1,
    height: 40,
  },
  ViewSendBtn: {
    backgroundColor: "#808080",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: width * 0.1,
    height: 40,
    marginRight: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  emojiBox: {
    // width: 65,
    // height: 65,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 7,
  },
  emoji: {
    fontSize: 32,
  },
  emojiLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
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
    alignItems: "center",
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
    // marginLeft:5,
    // marginRight:25
  },
  headerText1: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  totalSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#dcdcdc",
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
  separator: {
    height: 1,
    backgroundColor: "#A6AEBF",
    marginHorizontal: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default OrderDetails;
