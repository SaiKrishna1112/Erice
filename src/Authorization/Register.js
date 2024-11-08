// import React, { useState } from 'react';
// import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, ScrollView,Image,Dimensions } from 'react-native';

// const { width, height } = Dimensions.get('window');
// const Register = ({ navigation }) => {
//   const [customerName, setCustomerName] = useState('');
//   const [customerMobile, setCustomerMobile] = useState('');
//   const [password, setPassword] = useState('');
//   const [referralCode, setReferralCode] = useState('');
//   const [referralMsg, setReferralMsg] = useState('');

//   const handleSignUp = () => {
//     Alert.alert('Sign Up', 'Sign Up Button Pressed', [
//       {
//         text: 'OK',
//         onPress: () => {
//           navigation.navigate('Profile');
//         }
//       }
//     ]);
//   };

//   const checkReferralCode = () => {
//     setReferralMsg('You are referred by someone'); // Example message
//   };

//   const handleLoginNavigation = () => {
//     navigation.navigate('Login');
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.logoContainer}>
//         <Image
//           source={require('../../assets/icon.png')}
//           style={styles.logo}
//         />
//       </View>
//       <View style={styles.form}>
//         <Text style={styles.label}>Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your name"
//           value={customerName}
//           onChangeText={setCustomerName}
//         />
//         <Text style={styles.label}>Mobile Number</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your phone number"
//           keyboardType="numeric"
//           value={customerMobile}
//           onChangeText={setCustomerMobile}
//         />
//         <Text style={styles.label}>Password</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Create a password"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//         />
//         <Text style={styles.label}>Referral Code</Text>
//         <View style={styles.referralContainer}>
//           <TextInput
//             style={styles.referralInput}
//             placeholder="Referral code (if any)"
//             value={referralCode}
//             onChangeText={setReferralCode}
//           />
//           <TouchableOpacity style={styles.checkButton} onPress={checkReferralCode}>
//             <Text style={styles.checkButtonText}>Check</Text>
//           </TouchableOpacity>
//         </View>
//         {referralMsg ? <Text style={styles.referralMsg}>{referralMsg}</Text> : null}
//         <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
//           <Text style={styles.registerButtonText}>Register</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.footer}>
//         <Text>Already have an account?</Text>
//         <TouchableOpacity onPress={handleLoginNavigation}>
//           <Text style={styles.loginLink}>Login</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     // justifyContent: 'center', // Center vertically
//     // alignItems: 'center', // Center horizontally
//     // paddingHorizontal: 20,
//   },
//   logoContainer: {
//     height: '30%',
//     backgroundColor: '#4CAF50', 
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30, 
//     borderBottomRightRadius: 30,
//     overflow: 'hidden',
//     width:width
//   },
//   logo: {
//     width: 120,
//     height: 120,
//     borderRadius: 60, // Make it circular
//   },
//   form: {
//     width: width, // Full width of the container
//     // maxWidth: 400, // Optional maximum width
//     padding: 25,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     // elevation: 3, // Adds shadow effect
//   },
//   label: {
//     marginBottom: 5,
//     fontSize: 14,
//     color: '#333',
//   },
//   input: {
//     height: 40,
//     borderColor: '#f2f2f2',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//   },
//   referralContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   referralInput: {
//     flex: 1,
//     height: 40,
//     borderColor: '#f2f2f2',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     marginRight: 10,
//   },
//   checkButton: {
//     backgroundColor: '#f7941e',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//   },
//   checkButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   referralMsg: {
//     color: '#333',
//     marginBottom: 15,
//     fontStyle: 'italic',
//   },
//   registerButton: {
//     backgroundColor: '#f7941e',
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   registerButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   footer: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   loginLink: {
//     color: '#06a855',
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
// });

// export default Register;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const Register= () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [mobileOtpSession, setMobileOtpSession] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const navigation = useNavigation();

  // Step 1: Handle sending OTP
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', { mobileNumber });
      if (response.data.mobileOtpSession) {
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP.');
    }
  };

  // Step 2 & 3: Handle verifying OTP and completing registration
  const handleRegisterOtp = async () => {
    try {
      const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
        mobileNumber,
        mobileOtpSession,
        mobileOtpValue: otp,
        primaryType: selectedRole,
      });

      if (response.data.mobileVerified) {
        Alert.alert('Success', 'Mobile verified! Please log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register on OxyRice</Text>

      {/* Step 1: Mobile number input and OTP send button */}
      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        editable={!isOtpSent}
      />
      
    

      {!isOtpSent && (
        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>SEND OTP</Text>
        </TouchableOpacity>
      )}

      {/* Step 2: OTP input and role selection (shown only if OTP is sent) */}
      {isOtpSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <Picker
            selectedValue={selectedRole}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
          >
             <Picker.Item label="Select Type"/>
            <Picker.Item label="CUSTOMER" value="CUSTOMER" />
            <Picker.Item label="SELLER" value="SELLER" />
            <Picker.Item label="ADMIN" value="ADMIN" />
          </Picker>
          <TouchableOpacity style={styles.button} onPress={handleRegisterOtp}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>
        </>
      )}
        {/* Prompt to log in if the user already has an account */}
        {!isOtpSent && (
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already registered? Log in here</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 15, borderWidth: 1, borderRadius: 10, marginBottom: 10 },
  picker: { width: '80%', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10,width:'80%',alignItems:'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', },
  linkText: { color: '#4CAF50', marginVertical: 10, textDecorationLine: 'underline' },
});

export default Register;