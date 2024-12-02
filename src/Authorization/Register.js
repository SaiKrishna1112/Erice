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
import AsyncStorage from "@react-native-async-storage/async-storage";
const Register = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [mobileOtpSession, setMobileOtpSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigation = useNavigation();

  const handleSendOtp = async () => {
    setOtpSending(true);
    setLoading(true);
    setMobileError("");
    if (!/^\d{10}$/.test(mobileNumber)) {
      setOtpSending(false);
      setLoading(false);
      setMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}erice-service/user/login-or-register`,
        {
          mobileNumber,
          userType: "Register",
        }
      );
      setMobileError("");
      if (response.data.mobileOtpSession == null) {


        Alert.alert("You are already registered, Please login");
        navigation.navigate("Login");
      } else if (response.data.mobileOtpSession) {
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent successfully!");
      }
    } catch (error) {
      Alert.alert("Failed", "You are already registered, Please login", [
        {
          text: "Ok",
          onPress: () => navigation.navigate("Login",mobileNumber),
          style: "cancel",
        },
      ]);
    } finally {
      setOtpSending(false);
      setLoading(false);
    }
  };

  const handleRegisterOtp = async () => {

    // setOtpError("");
    // if (!otp.trim()) {
    //   setOtpError("OTP is required.");
    //   return;
    // }
    if(otp=="" || otp==null){
      setOtpError("OTP is required.");
      return;
    }
    if(otp.length!=6){
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

      if (response.status === 200) {
        Alert.alert("Success", "Mobile verified! Please log in.");
        await AsyncStorage.setItem('mobileNumber',mobileNumber)
        navigation.navigate("Login");
      } else {
        setOtpError("OTP verification failed. Please try again.");
      }
    } catch (error) {
      setOtpError("Invalid OTP. Please enter the correct OTP.");
    } finally {
      setLoading(false);
    }
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
          style={[styles.input, mobileError ? styles.inputError : null]}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          editable={!isOtpSent}
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
            />
            {otpError && <Text style={styles.errorText}>{otpError}</Text>}

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
            <Text style={styles.linkText}>Already registered? Log in here</Text>
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
});

export default Register;
