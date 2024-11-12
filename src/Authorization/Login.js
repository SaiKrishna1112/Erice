
// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LoginScreen = () => {
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [isLogin, setIsLogin] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [responseMessage, setResponseMessage] = useState('');
//   const [errors, setErrors] = useState({
//     mobileNumber: '',
//     otp: '',
//   });
//   const [mobileOtpSession, setMobileOtpSession] = useState('');
//   const [accessToken, setAccessToken] = useState('');
//   const [buttonsDisplay, setButtonDisplay] = useState(false);
//   const navigation = useNavigation();

//   const validateMobileNumber = () => {
//     let isValid = true;
//     const errorsCopy = { ...errors };

//     if (!mobileNumber) {
//       errorsCopy.mobileNumber = 'Mobile number is required.';
//       isValid = false;
//     } else if (!/^\d{10}$/.test(mobileNumber)) {
//       errorsCopy.mobileNumber = 'Mobile number must be 10 digits.';
//       isValid = false;
//     } else {
//       errorsCopy.mobileNumber = ''; 
//     }

//     setErrors(errorsCopy);
//     return isValid;
//   };

//   const validateOtp = () => {
//     let isValid = true;
//     const errorsCopy = { ...errors };

//     if (!otp) {
//       errorsCopy.otp = 'OTP is required.';
//       isValid = false;
//     } else if (!/^\d{6}$/.test(otp)) {
//       errorsCopy.otp = 'OTP must be 6 digits.';
//       isValid = false;
//     } else {
//       errorsCopy.otp = ''; 
//     }

//     setErrors(errorsCopy);
//     return isValid;
//   };

//   const handleSendOtp = async () => {
//     if (validateMobileNumber()) {
//       try {
//         const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
//           mobileNumber: mobileNumber
//         });
//         console.log(response.data)
//         if (response.data.mobileOtpSession) {
//           setResponseMessage('OTP sent successfully');
//           setMobileOtpSession(response.data.mobileOtpSession);
//           setButtonDisplay(response.data.mobileVerified);
//           setIsLogin(true);
//           setTimeout(() => setResponseMessage(''), 3000);
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Error during sending OTP');
//       }
//     }
//   };

//   const handleLoginOtp = async () => {
//     if (validateOtp()) {
//       try {
//         const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
//           mobileNumber: mobileNumber,
//           mobileOtpSession: mobileOtpSession,
//           mobileOtpValue: otp
//         });
//         console.log("registration",response.data)
//         if (response.data.accessToken) {
//           setAccessToken(response.data.accessToken);
//           setResponseMessage('Login successful!');
//           await AsyncStorage.setItem("accessToken", response.data.accessToken);
//           Alert.alert('Success', 'Login successful!');
//           navigation.navigate('Home');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Error during verifying OTP');
//       }
//     }
//   };

//   const handleRegisterOtp = async () => {
//     if (validateOtp()) {
//       try {
//         const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
//           mobileNumber: mobileNumber,
//           mobileOtpSession: mobileOtpSession,
//           mobileOtpValue: otp,
    
//         });
//         console.log("Login",response.data)
//         if (response.data.accessToken) {
//           setAccessToken(response.data.accessToken);
//           setResponseMessage('Registration successful!');
//           Alert.alert('Success', 'Login successful!');
//           await AsyncStorage.setItem("accessToken", response.data.accessToken);
//           navigation.navigate('Home');
//         }
//       } catch (error) {
//         Alert.alert('Error', 'Error during registration');
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.logoContainer}>
//         {/* <Image source={require('../MyOxyrice/assets/icon.png')} style={styles.logo} /> */}
//       </View>
      
//       <Text style={styles.title}>Login to OxyRice</Text>

//       <TextInput
//         style={[styles.input, errors.mobileNumber && styles.inputError]}
//         placeholder="Enter mobile number"
//         keyboardType="phone-pad"
//         value={mobileNumber}
//         onChangeText={setMobileNumber}
//       />
//       {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}
//       {!isLogin ? (
//         <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
//           <Text style={styles.buttonText}>SEND OTP</Text>
//         </TouchableOpacity>
//       ) : (
//         <>
//           <TextInput
//             style={[styles.input, errors.otp && styles.inputError]}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

//           <TouchableOpacity
//             style={styles.button}
//             onPress={buttonsDisplay ? handleLoginOtp : handleRegisterOtp}
//           >
//             <Text style={styles.buttonText}>{buttonsDisplay ? 'LOGIN' : 'LOGIN'}</Text>
//           </TouchableOpacity>

//           <Text style={styles.orText}>(OR)</Text>

//           <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
//             <Text style={styles.buttonText}>RESEND OTP</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {responseMessage ? <Text style={styles.successText}>{responseMessage}</Text> : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#F5F5F5',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   input: {
//     width: '80%',
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 10,
//     backgroundColor: '#FFF',
//     marginBottom: 10,
//   },
//   inputError: {
//     borderColor: 'red',
//   },
//   button: {
//     width: '80%',
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   orText: {
//     marginVertical: 10,
//     color: '#333',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   successText: {
//     color: 'green',
//     marginTop: 10,
//   },
// });

// export default LoginScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', otp: '' });
  const [mobileOtpSession, setMobileOtpSession] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setMobileNumber('');
      setOtp('');
      setIsLogin(false);
    }, [])
  );

  const validateMobileNumber = () => {
    let isValid = true;
    const errorsCopy = { ...errors };

    if (!mobileNumber) {
      errorsCopy.mobileNumber = 'Mobile number is required.';
      isValid = false;
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      errorsCopy.mobileNumber = 'Mobile number must be 10 digits.';
      isValid = false;
    } else {
      errorsCopy.mobileNumber = ''; 
    }

    setErrors(errorsCopy);
    return isValid;
  };

  const validateOtp = () => {
    let isValid = true;
    const errorsCopy = { ...errors };

    if (!otp) {
      errorsCopy.otp = 'OTP is required.';
      isValid = false;
    } else if (!/^\d{6}$/.test(otp)) {
      errorsCopy.otp = 'OTP must be 6 digits.';
      isValid = false;
    } else {
      errorsCopy.otp = ''; 
    }

    setErrors(errorsCopy);
    return isValid;
  };

  const handleSendOtp = async () => {
    if (validateMobileNumber()) {
      try {
        const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
          mobileNumber: mobileNumber,
        });
        if (response.data.mobileOtpSession) {
          setResponseMessage('OTP sent successfully');
          setMobileOtpSession(response.data.mobileOtpSession);
          setIsLogin(true);
          setTimeout(() => setResponseMessage(''), 3000);
        }
      } catch (error) {
        Alert.alert('Error', 'Error during sending OTP');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (validateOtp()) {
      try {
        const response = await axios.post('http://65.0.147.157:8282/api/erice-service/user/login-or-register', {
          mobileNumber: mobileNumber,
          mobileOtpSession: mobileOtpSession,
          mobileOtpValue: otp,
        });
        if (response.data.mobileVerified) {
          await AsyncStorage.setItem("accessToken", response.data.accessToken);
          Alert.alert('Success', 'Login successful!');
          navigation.navigate('Home');
        } else {
          navigation.navigate('Registration', {
            mobileNumber: mobileNumber,
            mobileOtpSession: mobileOtpSession,
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Mobile Number not Registered. Please Register Now.');
        navigation.navigate('RegisterScreen', {
          mobileNumber: mobileNumber,
          mobileOtpSession: mobileOtpSession,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to OxyRice</Text>

      <TextInput
        style={[styles.input, errors.mobileNumber && styles.inputError]}
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />
      {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}

      {/* Show registration prompt until OTP is sent */}
      

      {!isLogin ? (
        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>SEND OTP</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={[styles.input, errors.otp && styles.inputError]}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>VERIFY OTP</Text>
          </TouchableOpacity>
        </>
      )}
      {!isLogin && (
        <Text style={styles.registerPrompt}>
          Please register if you are not already registered.
          <Text style={styles.registerLink} onPress={() => navigation.navigate('RegisterScreen')}>
            {' Register here'}
          </Text>
        </Text>
      )}

      {responseMessage ? <Text style={styles.successText}>{responseMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '80%', padding: 15, borderWidth: 1, borderColor: '#CCC', borderRadius: 10, backgroundColor: '#FFF', marginBottom: 10 },
  inputError: { borderColor: 'red' },
  button: { width: '80%', backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 10 },
  successText: { color: 'green', marginTop: 10 },
  registerPrompt: { fontSize: 14, color: '#666', marginBottom: 10 },
  registerLink: { color: '#1E90FF', fontWeight: 'bold' },
});

export default LoginPage;