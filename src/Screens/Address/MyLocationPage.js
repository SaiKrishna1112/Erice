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
      status:true
    };
  
    // Navigate to the Checkout page with params as route params
    navigation.navigate("Checkout", {"locationdata":locationdata});
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