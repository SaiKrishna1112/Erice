import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TextInput } from 'react-native';
import { Platform } from 'react-native';
import BASE_URL from '../../../Config';
const AddAddress = () => {

  const [location, setLocation] = useState(null); 
  const [errorMsg, setErrorMsg] = useState(null); 
  const [lat, setLat] = useState(null); 
  const [lng, setLng] = useState(null);
  const [flatNo, setFlatNo] = useState('');
  const [landMark, setLandMark] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [errors, setErrors] = useState({
    flatNo: '',
    landMark: '',
    pincode: '',
  });

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the user's current position
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc); 
      setLat(loc.coords.latitude); 
      setLng(loc.coords.longitude); 
    })();
  }, []); 

  const validateFields = () => {
    let isValid = true;
    const newErrors = {};

    if (!flatNo) {
      newErrors.flatNo = 'Flat No is required';
      isValid = false;
    }
    if (!landMark) {
      newErrors.landMark = 'Land Mark is required';
      isValid = false;
    }
    if (!pincode) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const confirmLocation = async () => {
    if (!validateFields()) {
      return;
    }

    // Prepare the data to be sent in the API request
    const addressData = {
      address: `${flatNo}, ${landMark}, ${pincode}`,
      customerEmail: '', 
      customerId: 4, 
      customerName: '', 
      flatNo,
      landMark,
      latitude: lat.toString(),
      longitude: lng.toString(),
      pinCode: pincode,
    };

    try {
      const response = await fetch(BASE_URL+'erice-service/user/profileUpdate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTMwODYwNiwiZXhwIjoxNzMyMTcyNjA2fQ.5edNAnfhlAPuAtDLvfxBHeR6XKsmiGtWMiVJHlY6LKvH3hCRSQEghodAph0sN_ID8EMcd0Hkn8pijcmRQH0iZw', // Replace with actual token
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Address saved successfully');
        console.log("address data ", response);
      } else {
        Alert.alert('Error', result.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleTypePress = (type) => {
    setSelectedType(type);
  };

  const moveToLocation = (lat, lng) => {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01, 
      longitudeDelta: 0.01,
    });
  };

  const onMarkerDragEnd = (e) => {
    setLat(e.nativeEvent.coordinate.latitude); 
    setLng(e.nativeEvent.coordinate.longitude); 
  };

 
  if (!location) {
    return <Text>Loading...</Text>;
  }

 
  const isSaveDisabled = !flatNo || !landMark || !pincode;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map} 
        initialRegion={{
          latitude: 17.416212058100765, 
          longitude: 78.47188534522536,
          latitudeDelta: 0.0922, 
          longitudeDelta: 0.0421, 
        }}
        showsUserLocation={true} 
      >
        {lat && lng && (
          <Marker
            coordinate={{ latitude: lat, longitude: lng }} 
            draggable 
            onDragEnd={onMarkerDragEnd} 
          />
        )}
      </MapView>

      <KeyboardAvoidingView
        style={{ justifyContent: "center", flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView>
          <View style={{ borderColor: "black", borderWidth: 2, height: 400, borderRadius: 25 }}>
            <Text style={{ textAlign: "center", fontSize: 18, color: "green", fontWeight: "700", marginTop: 10 }}>
              Add your Address
            </Text>

            {/* Flat No Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Flat No</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Flat No"
                value={flatNo}
                onChangeText={setFlatNo}
              />
              {errors.flatNo && <Text style={styles.error}>{errors.flatNo}</Text>}
            </View>

            {/* Land Mark Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Land Mark</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Land Mark"
                value={landMark}
                onChangeText={setLandMark}
              />
              {errors.landMark && <Text style={styles.error}>{errors.landMark}</Text>}
            </View>

            {/* Pincode Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.pincode && <Text style={styles.error}>{errors.pincode}</Text>}
            </View>

            {/* Type Selection Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, selectedType === 'Home' && styles.buttonSelected]}
                onPress={() => handleTypePress('Home')}
              >
                <Text style={styles.buttonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, selectedType === 'Work' && styles.buttonSelected]}
                onPress={() => handleTypePress('Work')}
              >
                <Text style={styles.buttonText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, selectedType === 'Others' && styles.buttonSelected]}
                onPress={() => handleTypePress('Others')}
              >
                <Text style={styles.buttonText}>Others</Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.button1, isSaveDisabled && { backgroundColor: '#ccc' }]} 
              onPress={confirmLocation}
              disabled={isSaveDisabled}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  button1: {
    backgroundColor: '#f7941e',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  inputContainer: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    height: 40,
    paddingLeft: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop:10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonSelected: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AddAddress;
