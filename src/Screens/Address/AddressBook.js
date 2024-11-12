import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MyLocationPage from "./MyLocationPage";
import axios from "axios";
const AddressBook = () => {
  const [addressData, setAddressData] = useState();
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");
  const [display_name, setDisplay_name] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState({
    customerId: "",
    flatNo: "",
    landMark: "",
    pincode: "",
    address: "",
    addressType: "",
    dob: "",
    latitude: "",
    longitude: "",
  });
  const navigation = useNavigation();

  const openModal = (address) => {
    console.log({address});
    setUpdateData({
      customerId: address.customerId,
      flatNo: address.flatNo,
      landMark: address.landMark,
      pincode: address.pincode,
      address: address.address,
      addressType: address.addressType,
      dob: address.dob,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setModalVisible(true);
  };
  const fetchLocationData = async () => {
    const apiUrl = "https://nominatim.openstreetmap.org/reverse";
    const params = {
      lat: 17.4752339,
      lon: 78.3847481,
      format: "json",
    };

    try {
      const response = await axios.get(apiUrl, { params ,headers: {
        'User-Agent': 'MyGeocodingApp/1.0 (your-email@example.com)', // Custom user agent
      },});
      console.log("API Response:", response.data);

      setDisplay_name(response.data.display_name);
      console.log(display_name);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  const getAddress = async (customerId) => {
    const apiurl =
      "https://meta.oxyloans.com/api/erice-service/user/getCustomerData";
    try {
      const response = await axios.post(apiurl, {
        customerId: customerId,
      });
      console.log(response.data);
      console.log(response.data.customerId);
      setCustomerId(response.data.customerId);
      setAddressData(response.data);
    } catch (error) {
      console.error("Error fecthing address:" + error);
      setError("Error fecthing address.Please try again later");
    }
  };
  useEffect(() => {
    getAddress(1);
  }, []);

  const handleTypePress = (type) => {
    setSelectedType(type);
  };
  const deleteAddress = (addressId) => {
    console.log(addressId);
    
    Alert.alert("Confirm!", "Do you want to delete this address?", [
      {
        text: "Ok",
        onPress: async () => {
          try {
            // Make the DELETE API call with a JSON body containing the ID
            const response = await fetch(`https://meta.oxyloans.com/api/erice-service/user/delete`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: addressId }), // Send the address ID in the body as JSON
            });
  
            // Check if the response was successful (HTTP status 200)
            if (response.ok) {
              const result = await response.json(); // Assuming the API returns JSON data
              Alert.alert("Success", "Address deleted successfully");
              
              // You can add logic to update the state and remove the address from your local list
              const updatedData = addressData.filter((address) => address.id !== addressId);
              setAddressData(updatedData);
            } else {
              console.error("Failed to delete the address");
              Alert.alert("Error", "Failed to delete the address");
            }
          } catch (error) {
            console.error("Error deleting the address:", error);
            Alert.alert("Error", "An error occurred while deleting the address");
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };
  
  

  // const updateAddress = (address) => {
  //   navigation.navigate("AddAddress", { customerId });
  // };

  const changeLocation = () => {
    navigation.navigate("Add Address");
  };
  const handleInputChange = (field, value) => {
    setUpdateData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  const submitUpdatedAddress = async () => {
    const updatePayload = {
      ...updateData,
    };
    const apiurl =
      "https://meta.oxyloans.com/api/erice-service/user/addCustomerData";
    try {
      const response = await axios.patch(apiurl, updatePayload);
      console.log("Address updated successfully", response.data);
      Alert.alert(response.data.message);
      setModalVisible(false);
      // getAddress(updateData.customerId); // Refresh the data
    } catch (error) {
      console.error("Error updating address:" + error);
      setError("Error updating address. Please try again later.");
    }
  };
  return (
    <View style={styles.container}>
      {addressData ? (
        <View style={styles.addressContainer}>
          <View style={styles.addressDetails}>
            <View style={{ flexDirection: "row" }}>
              {/* Location Icon */}
              <Ionicons
                name="location-outline"
                size={24}
                color="grey"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.addressDetail}>
                {addressData.pincode + " , "}
              </Text>
              <Text style={styles.addressDetail}>{addressData.landMark}</Text>
            </View>
            <Text style={{ fontWeight: "bold" }}>address : </Text>
            <Text style={{ fontWeight: "bold" }}>{display_name}</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => openModal(addressData)}>
              <Ionicons name="pencil" size={24} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteAddress(addressData.addressId)}
            >
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noAddressContainer}>
          <Text style={styles.noAddressText}>No Address Added Yet</Text>
          <Text>Please Add Address</Text>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={changeLocation}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
      {/* Modal for updating address */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Address</Text>
            {/* Close Button (Cross Icon) */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Flat No"
              value={updateData.flatNo}
              onChangeText={(text) =>
                setUpdateData({ ...updateData, flatNo: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Landmark"
              value={updateData.landMark}
              onChangeText={(text)=>setUpdateData({...updateData, landMark: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={updateData.pincode}
              onChangeText={(text)=>setUpdateData({...updateData, pincode: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              value={updateData.address}
              onChangeText={(text)=>setUpdateData({...updateData,address:text})}
            />

            {/* Dropdown for selecting Address Type */}
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
              onPress={submitUpdatedAddress}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>

            {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addressContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#d8d8d8",
    paddingVertical: 10,
  },
  addressDetails: {
    marginTop: -25,
    flex: 1, // Allow the details to take up available space
  },
  addressContent: {
    width: 250,
    flexDirection: "row",
  },
  addressText: {
    marginLeft: 10,
    fontWeight: "bold",
    color: "red",
  },
  addressDetail: {
    fontWeight: "450",
  },
  addressDescription: {
    color: "gray",
  },
  iconContainer: {
    flexDirection: "row",
  },
  noAddressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAddressText: {
    fontSize: 18,
    color: "#e90d0b",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#e90d0b",
    padding: 15,
    borderRadius: 50,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  iconContainer: {
    flexDirection: "row", // Arrange icons in a row
    alignItems: "center", // Center align icons
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  pickerInput: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 15,
    backgroundColor: "#e90d0b",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noAddressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAddressText: {
    fontSize: 18,
    color: "#e90d0b",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingLeft: 15,
    paddingRight: 15,
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "grey",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonSelected: {
    backgroundColor: "#f77f00",
  },
  saveButton: {
    backgroundColor: "#f7941e",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, 
  },
});

export default AddressBook;