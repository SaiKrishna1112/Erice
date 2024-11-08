// import React, { useEffect, useState, useRef } from 'react';
// import { View, Text, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';
// import axios from 'axios';

// const MyLocationPage = () => {
//   const [location, setLocation] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [address, setAddress] = useState('');
//   const [flatNo, setFlatNo] = useState('');
//   const [landMark, setLandMark] = useState('');
//   const [pincode, setPincode] = useState('');
//   const [selectedType, setSelectedType] = useState(null);
//   const [region, setRegion] = useState({
//     latitude: 17.416212058100765,
//     longitude: 78.47188534522536,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });
//   const mapRef = useRef(null);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         return;
//       }

//       let loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc);
//       fetchLocationData(loc.coords.latitude, loc.coords.longitude);
//       console.log(loc.coords.latitude);
//       console.log(loc.coords.longitude);
//     })();
//   }, []);

//   const fetchLocationData = async (latitude, longitude) => {
//     const apiUrl = 'https://nominatim.openstreetmap.org/reverse';
//     const params = {
//       lat: latitude,
//       lon: longitude,
//       format: 'json',
//     };

//     try {
//       const response = await axios.get(apiUrl, { params,headers: {
//         'User-Agent': 'MyGeocodingApp/1.0 (your-email@example.com)', // Custom user agent
//       }, });
//       console.log('API Response:', response.data); // Log the API response to the console
//       setAddress(response.data.display_name); // Store the response data
//       // Update map region when the address is fetched
//       setRegion({
//         latitude: latitude,
//         longitude: longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });
//     } catch (err) {
//       console.error('Error fetching data:', err); // Log error to console
//     }
//   };

//   const handleTypePress = (type) => {
//     setSelectedType(type);
//   };
//   const save =async(latitude,longitude)=>{
//     const apiUrl="https://meta.oxyloans.com/api/erice-service/user/addCustomerData";
//     const params={
//    "customerId":9,
// 	 "flatNo":flatNo,
//    "landMark":landMark,
//    "pincode":pincode,
//    "address":address,
//    "addressType":selectedType,
//    "dob":"",
// 	 "latitude":"",
// 	 "longitude":"",
//   }
//     try{
//        const response = await axios.patch(apiUrl,params);
//        console.log("hai");
       
//        console.log(response.data.message);
       
//     }
//     catch(error){
//          console.log("error while fecthing");
         
//     }
//   }

//   return (
//     <View style={styles.container}>
//       {/* MapView positioned absolutely in the background */}
//       <MapView
//         provider={MapView.PROVIDER_GOOGLE}
//         style={styles.map}
//         ref={mapRef}
//         region={region} // Use the region state to dynamically change the map's region
//       >
//         {location && (
//           <Marker
//             coordinate={{
//               latitude: region.latitude,
//               longitude: region.longitude,
//             }}
//           />
//         )}
//       </MapView>

//       {/* Address display on top of the map */}
//       <View style={styles.addressContainer}>
//         <Text style={styles.title}>Current Address:</Text>
//         {errorMsg ? (
//           <Text style={styles.error}>{errorMsg}</Text>
//         ) : (
//           <TextInput
//             style={styles.input}
//             value={address}
//             placeholder="Fetching address..."
//             editable={false}
//             multiline={true}
//             scrollEnabled={true}
//           />
//         )}
//       </View>

//       {/* Form Section */}
//       <KeyboardAvoidingView
//         style={{ justifyContent: 'center', flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView>
//           <View style={styles.formContainer}>
//             <Text style={styles.formTitle}>Set Your Delivery Location</Text>
//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>Flat No</Text>
//               <TextInput
//                 style={styles.input1}
//                 placeholder="Enter Flat No"
//                 value={flatNo}
//                 onChangeText={setFlatNo}
//               />
//             </View>

//             {/* Land Mark Input */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>Land Mark</Text>
//               <TextInput
//                 style={styles.input1}
//                 placeholder="Enter Land Mark"
//                 value={landMark}
//                 onChangeText={setLandMark}
//               />
//             </View>

//             {/* Pincode Input */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>Pincode</Text>
//               <TextInput
//                 style={styles.input1}
//                 placeholder="Enter Pincode"
//                 value={pincode}
//                 onChangeText={setPincode}
                
//                 keyboardType="numeric"
//               />
//             </View>

//             {/* Buttons */}
//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.button, selectedType === 'Home' && styles.buttonSelected]}
//                 onPress={() => handleTypePress('Home')}
//               >
//                 <Text style={styles.buttonText}>Home</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, selectedType === 'Work' && styles.buttonSelected]}
//                 onPress={() => handleTypePress('Work')}
//               >
//                 <Text style={styles.buttonText}>Work</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, selectedType === 'Others' && styles.buttonSelected]}
//                 onPress={() => handleTypePress('Others')}
//               >
//                 <Text style={styles.buttonText}>Others</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity style={styles.saveButton}onPress={()=>save()}>
//               <Text style={styles.buttonText}>Save</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   map: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height * 0.5,
//   },
//   addressContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.8)', 
//     padding: 20,
//     borderRadius: 10,
//     marginHorizontal: 20,
//     position: 'absolute',
//     top: 180,
//     left: 20,
//     right: 20,
//   },
//   title: {
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: 'bold',
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 10,
//     borderRadius: 5,
//     maxHeight: 120, // Limit the height for the input field
//     color: 'red',
//   },
//   error: {
//     color: 'red',
//   },
//   formContainer: {
//     borderColor: 'black',
//     borderWidth: 2,
//     height: 400,
//     borderRadius: 25,
//     marginTop: 450,
//   },
//   formTitle: {
//     textAlign: 'center',
//     fontSize: 18,
//     color: 'green',
//     fontWeight: '700',
//     marginTop: 10,
//   },
//   inputContainer: {
//     marginTop: 5,
//     marginBottom: 20,
//     marginLeft: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   input1: {
//     height: 30,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     fontSize: 16,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 5,
//     paddingLeft: 15,
//     paddingRight: 15,
//   },
//   button: {
//     flex: 1,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//     backgroundColor: 'grey',
//     marginLeft: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   buttonSelected: {
//     backgroundColor: '#f77f00',
//   },
//   saveButton: {
//     backgroundColor: '#f7941e',
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
// });

// export default MyLocationPage;





import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
const MyLocationPage = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landMark, setLandMark] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [region, setRegion] = useState(null);
  const [errors, setErrors] = useState({});
  const mapRef = useRef(null);
   
  const navigation = useNavigation();
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchLocationData(loc.coords.latitude, loc.coords.longitude);

      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const fetchLocationData = async (latitude, longitude) => {
    const apiUrl = 'https://nominatim.openstreetmap.org/reverse';
    const params = {
      lat: latitude,
      lon: longitude,
      format: 'json',
    };

    try {
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'User-Agent': 'MyGeocodingApp/1.0 (your-email@example.com)',
        },
      });
      console.log('API Response:', response.data);
      setAddress(response.data.display_name);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleTypePress = (type) => {
    setSelectedType(type);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!flatNo) newErrors.flatNo = 'Flat No is required';
    if (!landMark) newErrors.landMark = 'Landmark is required';
    if (!pincode) newErrors.pincode = 'Pincode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const save = async () => {
  //   if (!validateFields()) return;
  //   if (!location) {
  //     Alert.alert("Error", "Unable to get current location.");
  //     return;
  //   }
  // const accessToken=await AsyncStorage.getItem('accessToken')
    
  //   const apiUrl = "https://meta.oxyloans.com/api/erice-service/user/profileUpdate";
    
  //   const params = {
  //     customerId: 4,
  //     flatNo,
  //     landMark,
  //     pincode,
  //     address,
  //     addressType: selectedType,
  //     latitude: location.coords.latitude.toString(),
  //     longitude: location.coords.longitude.toString(),
  //   };

  //   const config = {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`, 
  //       'Content-Type': 'application/json'
  //     }
  //   };

  //   try {
  //     console.log(params);
  //     const response = await axios.patch(apiUrl, params,config);
     
      
  //     if (response.status === 200) {
  //       Alert.alert("Success", "Address added successfully");
  //     } else {
  //       Alert.alert("Alert", "Failed to add address");
  //     }
  //   } catch (error) {
  //     console.log("Error while fetching:", error);
  //     Alert.alert("failed to update address")
  //   }
  // };


  const save = async () => {
    if (!validateFields()) return;
    if (!location) {
      Alert.alert("Error", "Unable to get current location.");
      return;
    }
  
    const locationdata = {
      customerId: 4,
      flatNo,
      landMark,
      pincode,
      address,
      addressType: selectedType,
      latitude: location.coords.latitude.toString(),
      longitude: location.coords.longitude.toString(),
    };
  
    // Navigate to the Checkout page with params as route params
    navigation.navigate("Checkout", locationdata);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={MapView.PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
        region={region}
        showsUserLocation
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        )}
      </MapView>
      <View style={styles.infoBox}>
        <Text style={styles.addressLabel}>Address</Text>
        <TextInput
          style={styles.addressText}
          multiline
          value={address}
          onChangeText={setAddress}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Flat No"
          value={flatNo}
          onChangeText={setFlatNo}
        />
        {errors.flatNo && <Text style={styles.errorText}>{errors.flatNo}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Landmark"
          // value={landMark}
          // onChangeText={setLandMark}
          value={landMark}
          onChangeText={(text) => {
            // Filter the input to allow only alphabetic characters
            const alphabeticText = text.replace(/[^a-zA-Z\s]/g, '');
            setLandMark(alphabeticText);
          }}
        />
        {errors.landMark && <Text style={styles.errorText}>{errors.landMark}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
      </View>
      <View style={styles.typeContainer}>
        <TouchableOpacity onPress={() => handleTypePress('Home')}>
          <Text style={[styles.typeButton, selectedType === 'Home' && styles.selectedType]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTypePress('Work')}>
          <Text style={[styles.typeButton, selectedType === 'Work' && styles.selectedType]}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTypePress('Others')}>
          <Text style={[styles.typeButton, selectedType === 'Others' && styles.selectedType]}>Others</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={save} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  map: { flex: 1 },
  infoBox: { backgroundColor: '#f2f2f2', padding: 10, borderRadius: 8, marginTop: 10 },
  addressLabel: { fontSize: 16, fontWeight: 'bold' },
  addressText: { 
    fontSize: 14, 
    color: '#555',
    height: 70,
    width: '90%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  inputContainer: { paddingVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginVertical: 5 },
  errorText: { color: 'red', fontSize: 12, marginLeft: 5 },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
  },
  selectedType: { backgroundColor: '#4CAF50' },
  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default MyLocationPage;