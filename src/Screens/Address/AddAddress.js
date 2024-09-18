import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, KeyboardAvoidingView ,ScrollView} from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Importing MapView and Marker from react-native-maps
import * as Location from 'expo-location'; // Importing Location module from expo for geolocation services
import { TextInput } from 'react-native';
import { Platform } from 'react-native';

const AddAddress = () => {
  // State variables to hold different pieces of data
  const [location, setLocation] = useState(null); // Holds the current location of the user
  const [errorMsg, setErrorMsg] = useState(null); // Holds any error message related to location permissions
  const [lat, setLat] = useState(null); // Holds latitude for the marker
  const [lng, setLng] = useState(null); // Holds longitude for the marker
  const [flatNo, setFlatNo] = useState('');
  const [landMark, setLandMark] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  // Reference to the MapView, so we can manipulate it (like zooming or centering)
  const mapRef = useRef(null);

  // useEffect to request location permissions and get the user's current location when the component mounts
  useEffect(() => {
    (async () => {
      // Request location permissions from the user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // If permission is not granted, update the error message and return
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the user's current position
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc); // Update the location state with the user's current position
      setLat(loc.coords.latitude); // Set the latitude based on user's current position
      setLng(loc.coords.longitude); // Set the longitude based on user's current position
    })();
  }, []); // Empty dependency array means this effect runs once, when the component mounts

  // Function to handle location confirmation (triggered by the "Confirm Location" button)
  const confirmLocation = () => {
    Alert.alert('Location Confirmed', `Lat: ${lat}, Lng: ${lng}`);
  };
  const handleTypePress = (type) => {
    setSelectedType(type);
  };

  // Function to move the map to a specific latitude and longitude (e.g., when searching or placing a marker)
  const moveToLocation = (lat, lng) => {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01, // Smaller delta means a more zoomed-in map
      longitudeDelta: 0.01,
    });
  };

  // Function to handle marker dragging, updating lat/lng when the user drags the marker
  const onMarkerDragEnd = (e) => {
    setLat(e.nativeEvent.coordinate.latitude); // Update latitude when marker is dragged
    setLng(e.nativeEvent.coordinate.longitude); // Update longitude when marker is dragged
  };

  // If location hasn't been fetched yet, display a loading message
  if (!location) {
    return <Text>Loading...</Text>;
  }

  // Render the map and the confirm button
  return (
    
    <View style={styles.container}>
      <MapView
        // ref={mapRef} // Attach the ref to the MapView
        style={styles.map} // Apply styles to the MapView
        initialRegion={{
          latitude: 17.416212058100765, 
          longitude: 78.47188534522536,
          latitudeDelta: 0.0922, // Initial zoom level for the map (latitude)
          longitudeDelta: 0.0421, // Initial zoom level for the map (longitude)
        }}
        showsUserLocation={true} // Show the user's current location on the map
        // onUserLocationChange={(e) => {
        //   const { latitude, longitude } = e.nativeEvent.coordinate;
        //   setLat(latitude); // Update latitude when the user's location changes
        //   setLng(longitude); // Update longitude when the user's location changes
        // }}
      >
        {lat && lng && (
          // If latitude and longitude are available, display a draggable marker at that position
          <Marker
            coordinate={{ latitude: lat, longitude: lng }} // Marker position
            draggable // Allow marker dragging
            onDragEnd={onMarkerDragEnd} // Handle drag event to update lat/lng
          />
        )}
      </MapView>

      {/* Button to confirm location */}
      <KeyboardAvoidingView
      style={{justifyContent:"center",flex:1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
     <ScrollView>
      <View style={{borderColor:"black",borderWidth:2,height:400,borderRadius:25}}>
       
        <Text style={{textAlign:"center" ,fontSize:18,color:"green",fontWeight:"700",marginTop:10}}>Set Your Delivery Location</Text>
        <View style={styles.inputContainer}>
        <Text style={styles.label}>Flat No</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Flat No"
          value={flatNo}
          onChangeText={setFlatNo}
        />
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
        />
        </View>
         {/* Buttons */}
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
      <TouchableOpacity style={styles.button1} onPress={confirmLocation}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
     
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
    
   
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up the entire screen
  },
  map: {
    width: Dimensions.get('window').width, // Map width should match the screen width
    height: Dimensions.get('window').height * 0.6, // Map height should be 80% of the screen height
  },
  button1: {
    backgroundColor: '#f7941e', // Button color
    height: 50, // Button height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
   
    marginTop:10// Margin around the button
  },
 
  inputContainer: {
    marginTop:5,
    marginBottom: 20,
    marginLeft:20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    
  },
  input: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    alignItems:"center",
    paddingLeft:15,
    paddingRight:15
  },
  button: {
    flex: 1,
    padding: 2,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'grey',
    justifyContent:"space-between",
    marginLeft:5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonSelected: {
    backgroundColor: '#f77f00',
  },
});

export default AddAddress;
