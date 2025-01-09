import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { AccessToken } from "../../Redux/action/index";
import BASE_URL from "../../Config";
const { height, width } = Dimensions.get("window");

const LoginPage = () => {
  // State hooks
  // console.log(route.params);

  const [mobileNumber, setMobileNumber] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [otp, setOtp] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState({ mobileNumber: "", otp: "" });
  const [mobileOtpSession, setMobileOtpSession] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      setMobileNumber("");
      setOtp("");
      setIsLogin(false);
      // getProfile();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const checkLoginData = async () => {
        try {
          const loginData = await AsyncStorage.getItem("userData");
          const storedmobilenumber = await AsyncStorage.getItem("mobileNumber");
          console.log(storedmobilenumber);

          setMobileNumber(storedmobilenumber);
          if (loginData) {
            const user = JSON.parse(loginData);
            if (user.accessToken) {
              dispatch(AccessToken(user));
              navigation.navigate("Home");
            }
          }
        } catch (error) {
          console.error("Error fetching login data", error.response);
        }
      };

      checkLoginData();
    }, [])
  );

  const handleResendOtp = async () => {
    if (!isOtpSent) return; // Prevent resend if OTP is not sent yet
    setLoading(true);
    setOtp("");
    // setErrors({ ...errors, otp: "" });
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/user/login-or-register`,
        {
          mobileNumber,
          userType: "Login",
        }
      );
      if (response.data.mobileOtpSession) {
        setMobileOtpSession(response.data.mobileOtpSession);
        setResponseMessage("OTP resent successfully.");
        setTimeout(() => setResponseMessage(""), 3000);
      } else {
        Alert.alert("Oops!", "Unable to resend OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Sorry", "Error resending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateMobileNumber = () => {
    if (!mobileNumber) {
      setErrors({ ...errors, mobileNumber: "Mobile number is required." });
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setErrors({
        ...errors,
        mobileNumber: "Enter a valid 10-digit mobile number.",
      });
      return false;
    }
    setErrors({ ...errors, mobileNumber: "" });
    return true;
  };

  const validateOtp = () => {
    if (!otp) {
      setErrors({ ...errors, otp: "OTP is required." });
      return false;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ ...errors, otp: "OTP must be 6 digits." });
      return false;
    }
    setErrors({ ...errors, otp: "" });
    return true;
  };

  const handleSendOtp = async () => {
    console.log("Handle Send otp session");
    setIsOtpSent(false);
    if (!validateMobileNumber()) return;
    // setMobileNumber(storedmobilenumber);
    setLoading(true);
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/user/login-or-register`,
        {
          mobileNumber,
          userType: "Login",
        }
      );
     
      if (response.data.mobileOtpSession != null) {

        setIsOtpSent(true);
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsLogin(true);
      
        setResponseMessage("OTP sent successfully.");
        setTimeout(() => setResponseMessage(""), 3000);
       
      } else {
        Alert.alert(
          "Oops!",
          "Unable to send OTP. Please check your details and try again."
        );
      }
    } catch (error) {
      Alert.alert("Sorry", "You are not registered. Please sign up.", [
        {
          text: "Ok",
          onPress: () => navigation.navigate("RegisterScreen"),
          style: "cancel",
        },
      ]);
      console.log("Send Otp error", error.response);
      setIsOtpSent(false);

      if (error.response?.status === 400) {
        navigation.navigate("RegisterScreen");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/user/login-or-register`,
        {
          mobileNumber,
          mobileOtpSession,
          mobileOtpValue: otp,
          userType: "Login",
        }
      );
      console.log(response.data);

      if (response.data.primaryType === "CUSTOMER") {
        if (response.data.accessToken) {
          setIsOtpSent(false);
          dispatch(AccessToken(response.data));
          await AsyncStorage.setItem("userData", JSON.stringify(response.data));
          await AsyncStorage.setItem("mobileNumber", mobileNumber);
          Alert.alert("Success", "Login successful!");

          navigation.navigate("Home");
        } else {
          Alert.alert("Error", "Invalid credentials.");
        }
      } else {
        Alert.alert("Please login as Customer", "", [
          {
            text: "Ok",
            onPress: () => {
              setMobileNumber("");
              setOtp("");
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Invalid OTP",
        "OTP verification failed. Please enter a valid OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/Images/OXYRICE.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <Image
            source={require("../../assets/Oxyricelogo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Login to OxyRice</Text>

          
          <View style={styles.mobileInputContainer}>
            <View style={styles.flagInputWrapper}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            
            <TextInput
              style={[styles.input, errors.mobileNumber && styles.inputError]}
              placeholder="Enter Mobile Number"
              keyboardType="phone-pad"
              value={mobileNumber}
              maxLength={10}
              editable={!isOtpSent}
              onChangeText={(text) => {
                setMobileNumber(text);
                setErrors((prev) => ({ ...prev, mobileNumber: "" }));
              }}
            />
            </View>
          </View>

          {errors.mobileNumber && (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          )}

          {!isLogin ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>

              <TextInput
                style={[styles.otpinput, errors.otp && styles.inputError]}
                placeholder="Enter OTP"
                keyboardType="numeric"
                autoFocus
                value={otp}
                maxLength={6}
                onChangeText={setOtp}
              />
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

              <View style={{ alignSelf: "flex-end", paddingRight: 5 }}>
                {isOtpSent && !loading && (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              {/* Only show the Resend OTP button after OTP is sent */}
            </>
          )}
          {/* {!isLogin && (
            <Text style={styles.registerPrompt}>
              Don't have an account ?
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate("RegisterScreen")}
              >
                {" Sign up here"}
              </Text>
            </Text>
          )} */}
          {!isLogin && (
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate("LoginWithPassword")}
              >
                <Text style={{ color: "white" }}>Login with Password</Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.registerPrompt}>
                  Don't have an account?
                  <Text
                    style={styles.registerLink}
                    onPress={() => navigation.navigate("RegisterScreen")}
                  >
                    {" Sign up here"}
                  </Text>
                </Text>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // alignSelf:"center",
    justifyContent: "center",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: width * 0.9,
    // maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: "center",
  },
  logo: {
    alignSelf: "center",
    width: 200,
    height: 80,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: width * 0.6,
    height: 45,
    // borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    border:"none"
   
  },
  otpinput: {
    width: width * 0.8,
    height: 45,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    
  },
  inputError: {
    borderColor: "red",
  },
  button: {
    width: width * 0.7,
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  registerPrompt: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#4CAF50",
  },
  registerLink: {
    color: "#fd7e14",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  resendText: {
    color: "#fd7e14",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 10,
    marginRight: 30,
  },
  btn: {
    marginTop: 20,
    backgroundColor: "orange",
    width: width * 0.7,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  flagEmoji: {
    fontSize: 22, // Size of the flag emoji
    marginLeft: 10, // Space between the flag and the country code
  },
  countryCode: {
    fontSize: 18, // Font size of the country code
    marginRight: 5, // Space between country code and input field
    color: "#333", // Dark color for the country code
  },
  // mobileInputContainer: {
  //   flexDirection: "row", // Aligning children in a row
  //   alignItems: "center", // Centering vertically
  //   width: "100%", // Full width
  //   height: 50, // Adjust the height of the input
  //   borderWidth: 1, // Border width
  //   borderColor: "#CCC", // Light gray border
  //   borderRadius: 8, // Rounded corners
  //   backgroundColor: "#FFF", // White background for the input field
  //   marginBottom: 10, // Space below the input field
  // },
  mobileInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: "100%",
    height: 50, // Adjust the height of the input
    backgroundColor: "#fff", // White background for the input field
    marginBottom: 10, // Space below the input field
  },
  flagInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8, // Add spacing between the country code and the input
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 4, // Spacing between the flag and country code
  },
  countryCode: {
    fontSize: 16,
    color: "#555",
  },
  // input: {
  //   flex: 1,
  //   fontSize: 16,
  //   color: "#000",
  // },
  inputError: {
    borderColor: "red",
  },
});

export default LoginPage;
