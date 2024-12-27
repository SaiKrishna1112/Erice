import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import BASE_URL from "../../Config";
import { useDispatch } from "react-redux";
import { AccessToken } from "../../Redux/action/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Register = () => {
  const dispatch = useDispatch();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [mobileOtpSession, setMobileOtpSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigation = useNavigation();
  
  const validateMobileNumber = () => {
    if (!mobileNumber) {
      setMobileError("Mobile number is required.")
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      
      setMobileError("Enter a valid 10-digit mobile number.")
      return false;
    }
    setMobileError(" ");
    setOtpSending(true);
    return true;
  };



  const handleSendOtp = async () => {
   
    setLoading(true);
    setMobileError(" ");
  
  if (!validateMobileNumber()) return;
    try {
      const response = await axios.post(
        `${BASE_URL}erice-service/user/login-or-register`,
        {
          mobileNumber,
          userType: "Register",
        }
      );
      setMobileError("");
      console.log("register",response.data);
      
      if (response.data.mobileOtpSession == null) {
        Alert.alert("You are already registered, Please login");
        navigation.navigate("Login");
      } else if (response.data.mobileOtpSession) {
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent successfully!");
      }
    } catch (error) {
      Alert.alert("Failed", "This number is already registered. Welcome to Loginpage.", [
        {
          text: "Ok",
          onPress: () => navigation.navigate("Login", mobileNumber),
          style: "cancel",
        },
      ]);
      // Alert.alert("Failed",error.response.data.error)
    } finally {
      setOtpSending(false);
      setLoading(false);
    }
  };

  const handleRegisterOtp = async () => {
    
    if (otp == "" || otp == null) {
      setOtpError("OTP is required.");
      return;
    }
    if (otp.length != 6) {
      setOtpError("Invalid Otp");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}erice-service/user/login-or-register`,
        {
          mobileNumber,
          mobileOtpSession,
          mobileOtpValue: otp,
          primaryType: "CUSTOMER",
          userType: "Register",
        }
      );

      

      console.log("register",response.data);
      
      if (response.data.accessToken != null) {
        dispatch(AccessToken(response.data));
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("Home");
      }
    
  } catch (error) {
      setOtpError("Invalid OTP. Please enter the correct OTP.");
    } finally {
      setLoading(false);
    }
  };


  const handleMobileNumberChange = (text) => {
    setMobileNumber(text);
    if (mobileError) {
      setMobileError("");
    }
    // if (text.length === 10) {
    //   setMobileError("");
    // } else {
    //   setMobileError("Please enter a valid 10-digit mobile number.");
    // }
  };

  return (
    <ImageBackground
      source={require("../../assets/Images/OXYRICE.png")}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Image
          source={require("../../assets/Oxyricelogo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Register on OxyRice</Text>

        <TextInput
          style={[styles.input,  mobileError ? { borderWidth: 1 } : null]}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={handleMobileNumberChange}
         
          editable={!isOtpSent}
          maxLength={10}
        />
        {mobileError && <Text style={styles.errorText}>{mobileError}</Text>}

        {!isOtpSent && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendOtp}
              disabled={otpSending}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>SEND OTP</Text>
            </TouchableOpacity>
            {otpSending && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loader}
              />
            )}
          </View>
        )}





        {isOtpSent && (
          <>
            <TextInput
              style={[styles.input, otpError ? styles.inputError : null]}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
            {otpError && <Text style={styles.errorText}>{otpError}</Text>}



            <View style={{alignSelf:"flex-end",paddingRight:5}}>
              {isOtpSent && !loading && (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
               )}
              </View>


            <TouchableOpacity
              style={styles.button}
              onPress={handleRegisterOtp}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>
          </>
        )}

        {!isOtpSent && (
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.linkText}>Already registered ? </Text>
              <Text style={styles.linkTextLog}>Log in here</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  logo: {
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
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#4CAF50",
    marginVertical: 10,

    fontSize: 14,
  },
  linkTextLog: {
    color: "#fd7e14",
    marginVertical: 10,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  loader: {
    marginTop: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  resendText: {
    color: "#fd7e14",
    fontSize: 14,
    textDecorationLine: "underline",
    margin: 10,
    // marginRight:30
  },
});

export default Register;
