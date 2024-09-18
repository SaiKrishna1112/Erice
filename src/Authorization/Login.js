import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const validateMobileNumber = (number) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const handleLoginWithPassword = async () => {
    if (mobileNumber.trim() === '') {
      Alert.alert('Mobile Number Required', 'Please enter your mobile number.');
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid mobile number.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://erice.in/api/apiv1/customer/login', {
        "customer_mobile": mobileNumber,
        "password": password
      });
      console.log(response.data)
      setLoading(false);
      if (response.data.status) {
        const token = response.data.token; 
        if (token) {
          await AsyncStorage.setItem('access_token', token);
          navigation.navigate('Home'); 
          Alert.alert('Login successful', 'You have been logged in successfully.');
        } else {
          Alert.alert('Login failed', 'No token received.');
        }
      } else {
        Alert.alert('Login failed', response.data.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('Login error', 'An error occurred while logging in.');
    }
  };

  const handleLoginWithOtp = async () => {
    if (mobileNumber.trim() === '') {
      Alert.alert('Mobile Number Required', 'Please enter your mobile number.');
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://erice.in/api/apiv1/customer/send_login_otp', {
        "customer_mobile": mobileNumber
      });
      setLoading(false);
      console.log(response.data)
      if (response.data.status) {
        setShowOtpField(true);
        Alert.alert('OTP sent', 'An OTP has been sent to your mobile number.');
      } else {
        Alert.alert('Error', response.data.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('OTP error', 'An error occurred while sending OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (mobileNumber.trim() === '') {
      Alert.alert('Mobile Number Required', 'Please enter your mobile number.');
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid mobile number.');
      return;
    }
    if (otp.length < 6) {
      Alert.alert('Invalid OTP', 'OTP must be 6 digits long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://erice.in/api/apiv1/customer/signup_otp_verify', {
        "customer_mobile": mobileNumber,
        "otp": otp,
      });
      console.log(response.data)
      setLoading(false);
      
      if (response.data.status) {
        const token = response.data.token; 
        if (token) {
          await AsyncStorage.setItem('access_token', token);
          navigation.navigate('Home'); 
          Alert.alert('Login successful', 'You have been logged in successfully.');
        } else {
          Alert.alert('Login failed', 'No token received.');
        }
      } else {
        Alert.alert('Login failed', response.data.msg);
      }


    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('OTP verification error', 'An error occurred while verifying OTP.');
    }
  };

  const handleShowPasswordField = () => {
    if (mobileNumber.trim() === '') {
      Alert.alert('Mobile Number Required', 'Please enter your mobile number.');
      return;
    }
    setShowPasswordField(true); // Show the password field
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.loginForm}>
        <Text style={styles.loginText}>Login</Text>

       
        <Text style={styles.labelText}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Mobile Number"
          placeholderTextColor="#BFBFBF"
          keyboardType="numeric"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />

        
        {showOtpField ? (
          <>
            <Text style={styles.labelText}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#BFBFBF"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleVerifyOtp}>
              <Text style={styles.buttonText}>VERIFY OTP</Text>
            </TouchableOpacity>
          </>
        ) : showPasswordField ? (
          <>
            <Text style={styles.labelText}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              placeholderTextColor="#BFBFBF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleLoginWithPassword}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleShowPasswordField}>
              <Text style={styles.buttonText}>LOGIN WITH PASSWORD</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>(OR)</Text>

            <TouchableOpacity style={styles.buttonSecondary} onPress={handleLoginWithOtp}>
              <Text style={styles.buttonText}>LOGIN WITH OTP</Text>
            </TouchableOpacity>
          </>
        )}

        
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.registerText}>Don't have an Account? <Text style={styles.registerLink}>Register</Text></Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loadingText}>Loading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
  },
  logoContainer: {
    height: '35%',
    backgroundColor: '#4CAF50', 
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60, // Make it circular
  },
  loginForm: {
    height: '65%',
    backgroundColor: '#FFFFFF', // White background for the form
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 5, // Slightly more elevation for a floating effect
  },
  loginText: {
    fontSize: 24, // Larger font size for the title
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333', 
    marginBottom: 30,
  },
  labelText: {
    fontSize: 16, 
    color: '#555', 
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8, 
    marginBottom: 20,
    backgroundColor: '#F9F9F9', 
    color: '#333',
  },
  buttonPrimary: {
    backgroundColor: '#FFC107', 
    padding: 15,
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonSecondary: {
    backgroundColor: '#FFC107', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  registerText: {
    textAlign: 'center',
    color: '#333',
  },
  registerLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default LoginScreen;