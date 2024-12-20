import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { AccessToken } from "../../Redux/action/index";
import BASE_URL from "../../Config";

const{height,width}=Dimensions.get("window")

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setErrors({ ...errors, email: "Email is required." });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Enter a valid email address." });
      return false;
    }
    setErrors({ ...errors, email: "" });
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setErrors({ ...errors, password: "Password is required." });
      return false;
    }
    setErrors({ ...errors, password: "" });
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setLoading(true);
    try {
      console.log("login");
      console.log({ email, password });

      const response = await axios.post(
        `${BASE_URL}erice-service/user/userEmailPassword`,
        { email, password }
      );

      console.log(response.data);
      if (response.data.accessToken) {
        // await AsyncStorage.setItem("accessToken", response.data.token);

        dispatch(AccessToken(response.data));
        Alert.alert("Success", response.data.status);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials. Please try again.");
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
          <Text style={styles.title}>LOGIN</Text>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={[styles.passwordContainer,styles.input]}>
            <TextInput
              style={[errors.password && styles.inputError, { flex: 1 }]}
              placeholder="Enter Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              // style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
        </TouchableOpacity>
        
         <TouchableOpacity style={styles.btn} onPress={()=>navigation.navigate('Login')}>
                    <Text style={{ color: "white" }}>Login with OTP</Text>
                  </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
   </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: width*0.9,
    // maxWidth: 400,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems:"center"
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
    width: width*0.8,
    height: 50,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  eyeIcon: {
    marginLeft: -25,
  },
  button: {
    width: width*0.7,
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
  btn: {
    marginTop: 20,
    backgroundColor: "orange",
    width: width * 0.7,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginPage;
