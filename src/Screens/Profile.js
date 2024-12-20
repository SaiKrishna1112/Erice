import React, { useState, useEffect, useCallback ,useLayoutEffect} from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ToastAndroid,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
import Ionicons from 'react-native-vector-icons/Ionicons';

import axios from "axios";
import { useSelector } from "react-redux";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../Config";
const ProfilePage = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  // console.log({customerId})

  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
    user_mobile:"",
    // customer_address:"",
    // customer_flatNo:"",
    // customer_landmark:"",
    // customer_pincode:""
  });
  const [errors, setErrors] = useState({
    customer_name: "",
    customer_email: "",
    user_mobile:"",
    // customer_address:"",
    // customer_flatNo:"",
    // customer_landmark:"",
    // customer_pincode:""
  });
  const [user, setUser] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const navigation = useNavigation();
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isInitiallySaved, setIsInitiallySaved] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const [profileData, setProfileData] = useState();
  
  useFocusEffect(
    useCallback(() => {
      
      animateProfile();
      getProfile();
    }, [getProfile])
  );
 
  

  const animateProfile = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,

          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getProfile = async () => {
    // const mobile_No = AsyncStorage.getItem('mobileNumber');
   
    try {
      const response = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        url:
          BASE_URL +
          `erice-service/user/customerProfileDetails?customerId=${customerId}`,
      });
      console.log("customerProfileDetails",response.data);

      if (response.status === 200) {
        console.log("customerProfileDetails",response.data);
        setUser(response.data);
        setProfileForm({
          customer_name: response.data.name,
          customer_email: response.data.email,
          customer_mobile:response.data.mobileNumber,
          user_mobile : response.data.alterMobileNumber,
        //   customer_address: response.data.address,
        //  customer_flatNo:response.data.flatNo,
        //  customer_landmark:response.data.landMark,
        //  customer_pincode:response.data.pinCode
        });
      }
    } catch (error) {
      console.error(error);
      showToast("Error loading profile");
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileForm.customer_name || !profileForm.customer_email|| errors.customer_email||!profileForm.user_mobile) {
      setErrors({
        customer_name: profileForm.customer_name
          ? ""
          : "Name should not be empty",
        customer_email: profileForm.customer_email
          ?  errors.customer_email
          : "Email should not be empty",
        user_mobile: profileForm.user_mobile? "":"Mobile number should not be empty",
        // customer_address: profileForm.customer_address?"":"Address should not be empty",
        // customer_flatNo: profileForm.customer_flatNo? "":"Flatno should not be empty",
        // customer_landmark: profileForm.customer_landmark? "":"Landmark should not be empty",
        // customer_pincode: profileForm.customer_pincode? "":"pincode should not be empty",
      });
      return;
    }
    else if(profileForm.user_mobile.length!=10){
      Alert.alert("Error","Alternative Mobile Number should be 10 digits")
      return false
    }
    // if (customer_mobile == user_mobile) {
    //   Alert.alert(
    //     "Validation Error",
    //     "The alternate mobile number must be different from the login mobile number.",
    //     [{ text: "OK" }]
    //   );
    //   return; 
    // }

    try {
      const response = await axios.patch(
        BASE_URL + "erice-service/user/profileUpdate",
        {
          customerName: profileForm.customer_name,
          customerEmail: profileForm.customer_email,
          customerId: customerId,
          // customerMobile: profileForm.customer_mobile,
          alterMobileNumber:profileForm.user_mobile,
          // address:profileForm.customer_address,
          // flatNo:profileForm.customer_flatNo,
          // landMark:profileForm.customer_landmark
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("profile",response.data)
      if (response.data.errorMessage == null) {
        console.log("Profile call response: ", response.data);
        setErrors({ ...errors, customer_email: "" });
        setProfileData(response.data);
        console.log("Profile data:", profileData);
          getProfile();
      
        // Mark profile as saved and show success alert
        setIsProfileSaved(true);
        Alert.alert("Success", "Profile saved successfully");
      
        console.log("Profile form data:", profileForm);
      } else {
        // Show error message from the response
        Alert.alert("Alert", response.data.errorMessage);
      }
      } catch (error) {
      console.error(error.response);
      Alert.alert("Alert Error saving profile");
    }
  };

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const changePassword = () => {
    Alert.alert(
      "Change Password",
      "Enter new and old passwords",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: () => {
            if (newPassword.length >= 6) {
              updatePassword({
                newpassword: newPassword,
                oldpassword: oldPassword,
              });
            } else {
              showToast("Minimum length of password is 6 characters");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const updatePassword = async (params) => {
    try {
      const response = await axios.post("customer/update_password", params);
      showToast(response.data.msg || "Password updated successfully");
    } catch (error) {
      console.error(error);
      showToast("Error updating password");
    }
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Please share to your friends/family! https://play.google.com/store/apps/details?id=com.BMV.Money",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert("Oops", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.outerContainer}
  >
    <View style={styles.mainContainer}> 
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={profileForm?.customer_name || ""}
          onChangeText={(text) => {
            setProfileForm({ ...profileForm, customer_name: text });
            setErrors({ ...errors, customer_name: "" });
          }}
        />
        {errors.customer_name ? (
          <Text style={styles.errorText}>{errors.customer_name}</Text>
        ) : null}

      <TextInput
          style={styles.input}
          placeholder="Enter your e-mail "
          keyboardType="email-address"
          value={profileForm?.customer_email || ""}
          // editable={profileForm.customer_email==null?true:false}
          onChangeText={(text) => {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
              setProfileForm({ ...profileForm, customer_email: text });
              setErrors({ ...errors, customer_email: "" }); 
            } else {
              setProfileForm({ ...profileForm, customer_email: text });
              setErrors({
                ...errors,
                customer_email: "Please enter a valid gmail address",
              });
            }
          }}
        />
        {errors.customer_email ? (
          <Text style={styles.errorText}>{errors.customer_email}</Text>
        ) : null}

       

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor:
                isProfileSaved ||
                (profileForm?.customer_mobile?.length || 0) === 10
                  ? "#e0e0e0"
                  : "#fff",
            },
          ]}
          placeholder ="Enter your mobile number"
          value={profileForm?.customer_mobile || ""}
          onChangeText={(text) => {
            if (text.length <= 10) {
              setProfileForm({ ...profileForm, customer_mobile: text });
            }
          }}
          maxLength={10}
          editable={
            !isProfileSaved && (profileForm?.customer_mobile?.length || 0) < 10
          }
          disabled={true}
        />

        <TextInput
          style={styles.input}
          placeholder ="Enter your alternate mobile number"
          value={profileForm?.user_mobile || ""}
          maxLength={10}
          keyboardType="number-pad"
          onChangeText={(text) => {
            setProfileForm({ ...profileForm, user_mobile: text });
            setErrors({ ...errors, user_mobile: "" });
          }}
        />
          {errors.user_mobile ? (<Text style={styles.errorText}>{errors.user_mobile}</Text> ) : null}
       <View style={styles.noteContainer}>
         <Text style={styles.noteText}>
          Please provide a backup mobile number. We’ll use it only if your registered number can’t be reached.
          </Text>
    </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginTop: 5,
          }}
          onPress={()=>handleProfileSubmit()}
        >
          <Text style={{ color: "white", fontSize: 16 }}>
            {isProfileSaved || isInitiallySaved
              ? "Save Profile"
              : "Save Profile"}
          </Text>
        </TouchableOpacity>
        <View style={styles.optionContainer}>
        
                   

          <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Subscription')}>
                        <Text style={styles.optionText}>Subscription</Text>
                    </TouchableOpacity> 
         

          <TouchableOpacity
      style={styles.optionButton}
      onPress={() => navigation.navigate('Wallet')}
    >
      <Entypo name="wallet" size={20} color="#fff" style={styles.icon} />
      <Text style={styles.optionText}>Wallet</Text>
    </TouchableOpacity>

          {/* <TouchableOpacity style={styles.optionButton} onPress={onShare}>
                        <Text style={styles.optionText}>Refer & Share App Link</Text>
                    </TouchableOpacity> */}
        </View>

        {/* <View style={styles.footer}>
                    <Text>MY REFERRAL CODE: <Text style={styles.bold}>{user.referral_code}</Text></Text>
                    <Text>Version: 1.0.24</Text>
                </View> */}

        {/* <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            navigation.navigate("Login"), AsyncStorage.removeItem("userData");
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1, // Ensures it uses the full screen
    backgroundColor: "#F9F9F9",
  },
  mainContainer: {
    flex: 1, 
    backgroundColor: "#F9F9F9",
  },
  container: {
    padding: 20,
    backgroundColor: "#F9F9F9",
    // height:"auto"
    flexGrow: 1, 
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  optionContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    alignItems: "center", 
    justifyContent: "center", 
    alignSelf: "center",
    minWidth: 150, 
    height: 50, 
  },
  
  optionText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  
  footer: {
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 10,
    marginBottom: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  optionButton: {
    flexDirection: 'row',
   
    alignItems: 'center',
    backgroundColor: '#4CAF50', 
    paddingVertical: 10,
    // paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10, 
    alignSelf:"center",
    textAlign:"center"
  },
  icon: {
    marginLeft:10,
    
  },
  textContainer: {
    marginHorizontal: 20, 
    marginVertical: 1, 
  },
  infoText: {
    fontSize: 16,
    color: '#333', 
    lineHeight: 20, 
    padding:8,
    // textAlign: 'center', 
    marginHorizontal: 16, 
    marginVertical:0, 
    fontWeight: '400', 
  
  },
  noteContainer: {
    backgroundColor: '#F5F5F5', 
    borderLeftWidth: 4, 
    borderLeftColor: '#888',
    padding: 8, 
    marginVertical: 12, 
    borderRadius: 4, 
  },
  noteText: {
    fontSize: 14, 
    color: '#444', 
    lineHeight: 18, 
  },
});

export default ProfilePage;
