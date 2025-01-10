import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import { Ionicons } from "react-native-vector-icons";
import BASE_URL from "../../../Config";
import { isWithinRadius,getCoordinates } from "./LocationService";
import { getDistance } from "geolib";

const AddressBook = ({ route }) => {
  const navigation = useNavigation();
  const [errors, setErrors] = useState({});
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isWithinStatus, setIsWithinStatus] = useState(false);
  const [distance, setDistance] = useState();
  const [newAddress, setNewAddress] = useState({
    customerId: customerId,
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
      // getCoordinates();
    }, [])
  );


  const validateFields = () => {
    const newErrors = {};
    if (!newAddress.flatNo) newErrors.flatNo = "Flat No is required.";
    if (!newAddress.landMark) newErrors.landMark = "Landmark is required.";
    if (!newAddress.pincode) newErrors.pincode = "Pincode is required.";
    else if (newAddress.pincode.length < 6)
      newErrors.pincode = "Pincode must be 6 digits.";
    if (!newAddress.address) newErrors.address = "Address is required.";
    if (!selectedType) newErrors.type = "Please select an address type.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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
      addressType: "",
    });
    setSelectedType("");
  };

  const handleAddAddress = () => {
    setModalVisible(true);
  };

  const handleTypePress = (type) => {
    setSelectedType(type);
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: null }));
    }
  };

  const fetchOrderAddress = async () => {
    setLoading(true);
    try {
      const response = await axios({
        url: BASE_URL + `erice-service/user/getAllAdd?customerId=${customerId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All addresss are :", response.data);

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
    const value =
      address.address + "," + address.landMark + "," + address.pincode;
    console.log({ value });
    getCoordinates(value);
  };

  const saveAddress = async () => {
    
    if (!validateFields()) {
      return;
    }
    const value =
      newAddress.address + "," + newAddress.landMark + "," + newAddress.pincode;
    console.log("value for saving api", value);
      const { status,isWithin, distanceInKm,coord1 } =await getCoordinates(value);
      console.log({status,isWithin,distanceInKm,coord1});

    if (isWithin == true && coord1) {
      console.log("Address saved as it is within the radius.");
      try {
        const data = {
          method: "post",
          url: BASE_URL + "erice-service/user/addAddress",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            address: newAddress.address,
            addressType: selectedType,
            customerId: customerId,
            flatNo: newAddress.flatNo,
            landMark: newAddress.landMark,
            latitude: coord1.latitude,
            longitude: coord1.longitude,
            pincode: newAddress.pincode,
          },
        };
        console.log("data", data);

        const response = await axios(data);
        console.log("Added address:", response.data);
        Alert.alert("Address saved successfully");
        setModalVisible(false);
        setNewAddress({
          address: "",
          flatNo: "",
          landMark: "",
          pincode: "",
        });
        setSelectedType("");
        setCoordinates(null);
        setIsWithinStatus(false);
        setCoordinates(null);
        fetchOrderAddress();
      } catch (error) {
        console.error("Error adding address:", error);
      }
    } else {
      console.log("Address not saved as it is outside the radius.");
      // alert("Address not saved. It is outside the allowed distance.");
      setNewAddress({
        address: "",
        flatNo: "",
        landMark: "",
        pincode: "",
      });
      setSelectedType("");
      setCoordinates(null);
      setIsWithinStatus(false);
      // Alert.alert("Sorry",`We cannot deliver to this address because your distance is ${distance} km, which is not within the 20 km radius.`);
    }
  };

  const handleSendAddress = async (selectAddress) => {
    if (selectAddress == null) {
      Alert.alert("Please select address to proceed");
    }
    let locationdata;
    console.log("selected type", selectedType);
    if (selectAddress) {
      // If a radio button address is selected
      locationdata = {
        ...selectAddress,
        status: true,
      };
    } else if (!validateFields()) {
      return;
    } else {
      alert("Please select an address");
      return;
    }
    console.log("Location Data:", locationdata);
    const value =
    locationdata.address + "," + locationdata.landMark + "," + locationdata.pincode;
    console.log("value for saving api", value);
      const { status,isWithin, distanceInKm,coord1 } =await getCoordinates(value);
      console.log({status,isWithin,distanceInKm,coord1});
  if(isWithin == true && coord1){
    console.log("Address saved as it is within the radius.");
    navigation.navigate("Checkout", { locationdata });
  }else{
    console.log("Address not saved as it is outside the radius.");
    Alert.alert("Sorry",`We cannot deliver to this address because your distance is ${distanceInKm} km, which is not within the 20 km radius.`);
  }
 
    // navigation.navigate("Checkout", { locationdata });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View>
            <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.noteText}>
        <Text style={styles.noteLabel}>Note:</Text> Order will be delivered within a 20 km radius only
      </Text>            
      <Text style={styles.title}>Your Delivery Addresses</Text>
              <View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddAddress()}
                >
                  <Text style={styles.addButtonText}>Add +</Text>
                </TouchableOpacity>
              </View>

              {/* <ScrollView> */}
              {addressList.length > 0 ? (
                addressList
                  .slice(-4)
                  .reverse()
                  .map((address, index) => {
                    return (
                      <View>
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.addressRow,
                            selectedAddress &&
                              selectedAddress.id === address.id &&
                              styles.selectedAddress,
                          ]}
                          onPress={() => handleAddressSelect(address)}
                        >
                          <View style={styles.radioButtonContainer}>
                            <TouchableOpacity
                              style={[
                                styles.radioButton,
                                selectedAddress &&
                                  selectedAddress.id === address.id &&
                                  styles.radioButtonSelected,
                              ]}
                            />

                            <Text style={styles.addressText}>
                              <Text style={styles.label}>Address: </Text>
                              <Text style={styles.value}>
                                {address.address}
                              </Text>
                              {"\n"}
                              <Text style={styles.label}>Flat No: </Text>
                              <Text style={styles.value}>{address.flatNo}</Text>
                              {"\n"}

                              <Text style={styles.label}>Landmark: </Text>
                              <Text style={styles.value}>
                                {address.landMark}
                              </Text>
                              {"\n"}

                              <Text style={styles.label}>Address Type: </Text>
                              <Text style={styles.value}>
                                {address.addressType}
                              </Text>
                              {"\n"}

                              <Text style={styles.label}>Pinode: </Text>
                              <Text style={styles.value}>
                                {address.pincode}
                              </Text>
                              {"\n"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
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
            </ScrollView>
            {/* </ScrollView> */}
          </View>

          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>
              Order will be delivered within 20 km radius only
            </Text>
          </View> */}
        </>
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

            <View style={{ marginTop: 25 }}>
              <TextInput
                style={styles.input}
                placeholder="Flat No"
                value={newAddress.flatNo}
                onChangeText={(text) => {
                  setNewAddress((prev) => ({ ...prev, flatNo: text }));
                  if (errors.flatNo) {
                    setErrors((prev) => ({ ...prev, flatNo: null }));
                  }
                }}
              />
              {errors.flatNo && (
                <Text style={styles.errorText}>{errors.flatNo}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Landmark"
                value={newAddress.landMark}
                onChangeText={(text) => {
                  setNewAddress((prev) => ({ ...prev, landMark: text }));
                  if (errors.landMark) {
                    setErrors((prev) => ({ ...prev, landMark: null }));
                  }
                }}
              />
              {errors.landMark && (
                <Text style={styles.errorText}>{errors.landMark}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Address"
                value={newAddress.address}
                onChangeText={(text) => {
                  setNewAddress((prev) => ({ ...prev, address: text }));
                  if (errors.address) {
                    setErrors((prev) => ({ ...prev, address: null }));
                  }
                }}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={newAddress.pincode}
                onChangeText={(text) => {
                  setNewAddress((prev) => ({ ...prev, pincode: text }));
                  if (errors.pincode) {
                    setErrors((prev) => ({ ...prev, pincode: null }));
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
            </View>
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
            {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

            <TouchableOpacity
              style={styles.submitButton}
              // onPress={() => handleSendAddress()}
              onPress={() => saveAddress()}
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
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
    textAlign:"center"
  },
  addressRow: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    // marginBottom: 8,
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
    padding: 5,
    // paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
    margin: 5,
    marginRight: 10,
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
    margin: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
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
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
    // marginTop:20,
    // marginBottom:50
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  button1: {
    padding: 10,
    marginTop: 10,
    marginBottom: 20,

    backgroundColor: "#007bff",
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 5,
    textAlign: "center",
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 1,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#000", 
  },
  footer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerText: {
    color: "#333",
    fontSize: 14,
  },
  noteText:{
    fontSize: 15,
  color: '#555', 
  // fontStyle: 'italic', 
  marginBottom: 10, 
  lineHeight: 20, 
  alignSelf:"center",
  fontWeight:"bold"
  },
  noteLabel:{
    color:"red"
  }
});

export default AddressBook;
