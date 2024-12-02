import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import { Ionicons } from "react-native-vector-icons";
import BASE_URL from "../../../Config";
const AddressBook = ({ route }) => {
  const navigation = useNavigation();

  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [newAddress, setNewAddress] = useState({
    flatNo: "",
    landMark: "",
    pincode: "",
    address: "",
    type: "",
    status: true,
  });
  const [selectedAddress, setSelectedAddress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchOrderAddress();
    }, [])
  );

  const handleSubmitAddress = () => {
    if (
      !newAddress.flatNo ||
      !newAddress.landMark ||
      !newAddress.pincode ||
      !newAddress.address ||
      !selectedType
    ) {
      alert("Please fill all fields and select an address type.");
      return;
    }

    const locationdata = { ...newAddress, type: selectedType };
    navigation.navigate("Checkout", {
      locationdata,
    });

    setModalVisible(false);
    setNewAddress({
      flatNo: "",
      landMark: "",
      pincode: "",
      address: "",
      type: "",
    });
    setSelectedType("");
  };

  const handleAddAddress = () => {
    setModalVisible(true);
  };

  const handleTypePress = (type) => {
    setSelectedType(type);
  };

  const fetchOrderAddress = async () => {
    setLoading(true);
    try {
      const response = await axios({
        url:
          BASE_URL +
          `erice-service/checkout/orderAddress?customerId=${customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log the API response to inspect the structure
      console.log("API Response:", response.data);

      if (response && response.data) {
        setAddressList(response.data);
      } else {
        console.warn("API returned empty or invalid data");
        setAddressList([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching order address data:", error);
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };
  // const handleSendAddres =(address)=>{
  //   console.log("addressidconfirmation",address);

  //      navigation.navigate("Checkout",{
  //         addressdata:{
  //         addressId: address.addressId,
  //          hasId:true
  //         }
  //      })
  // }

  const handleSendAddress = (selectAddress) => {
    let locationdata;

    if (selectedAddress) {
      // If a radio button address is selected
      locationdata = {
        ...selectedAddress,
        // type: selectedAddress.type || "Default Type", 
        status: true,
      };
    } else if (
      newAddress.flatNo &&
      newAddress.landMark &&
      newAddress.pincode &&
      newAddress.address &&
      selectedType
    ) {
      // If a new address is added
      locationdata = {
        ...newAddress,
        type: selectedType,
        status: true,
      };
    } else {
      alert("Please select an address or add a new one.");
      return;
    }

    console.log("Location Data:", locationdata);
    navigation.navigate("Checkout", { locationdata });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <Text style={styles.title}>Your Delivery Addresses</Text>

          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
            <Text style={styles.addButtonText}>Add+</Text>
          </TouchableOpacity>

          {addressList.length > 0 ? (
            addressList.slice(0, 4).map((address, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.addressRow,
                    selectedAddress &&
                      selectedAddress.addressId === address.addressId &&
                      styles.selectedAddress,
                  ]}
                  onPress={() => handleAddressSelect(address)}
                >
                  <View style={styles.radioButtonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        selectedAddress &&
                          selectedAddress.addressId === address.addressId &&
                          styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.addressText}>
                      {address.flatNo}, {address.landMark}, {address.pinCode}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noDeliveryRow}>
              <Text style={styles.noDeliveryText}>
                No address found. Add a new address above.
              </Text>
            </View>
          )}
          {addressList.length != 0 ? (
            <TouchableOpacity
              style={styles.button1}
              onPress={() => handleSendAddress(selectedAddress)}
            >
              <Text style={styles.addButtonText}>SUBMIT ADDRESS</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Flat No"
              value={newAddress.flatNo}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, flatNo: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Landmark"
              value={newAddress.landMark}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, landMark: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={newAddress.pincode}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, pincode: text }))
              }
              keyboardType="numeric"
              maxLength={6}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={newAddress.address}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, address: text }))
              }
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedType === "Home" && styles.buttonSelected,
                ]}
                onPress={() => handleTypePress("Home")}
              >
                <Text style={styles.buttonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedType === "Work" && styles.buttonSelected,
                ]}
                onPress={() => handleTypePress("Work")}
              >
                <Text style={styles.buttonText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedType === "Others" && styles.buttonSelected,
                ]}
                onPress={() => handleTypePress("Others")}
              >
                <Text style={styles.buttonText}>Others</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSendAddress()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
    textAlign: "left",
  },
  addressRow: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 2,
  },
  selectedAddress: {
    borderWidth: 2,
    borderColor: "#4caf50",
  },
  addressText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#03843b",
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: "#fd7e14",
  },
  noDeliveryRow: {
    padding: 12,
    alignItems: "center",
  },
  noDeliveryText: {
    fontSize: 14,
    color: "#6c757d",
  },
  addButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginRight: 20,
    marginTop: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 2,
    right: 4,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#fd7e14",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonSelected: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  button1: {
    padding: 10,
    marginTop: 70,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 5,
    textAlign: "center",
    alignSelf: "center",
  },
});

export default AddressBook;
