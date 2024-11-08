import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, KeyboardAvoidingView ,ScrollView} from 'react-native';
import MapView, { Marker } from 'react-native-maps'; 
import * as Location from 'expo-location'; 
import { TextInput } from 'react-native';
import { Platform } from 'react-native';

const AddAddress = () => {
 
  const [location, setLocation] = useState(null); 
  const [errorMsg, setErrorMsg] = useState(null); 
  const [lat, setLat] = useState(null); 
  const [lng, setLng] = useState(null);
  const [flatNo, setFlatNo] = useState('');
  const [landMark, setLandMark] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedType, setSelectedType] = useState(null);

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

 
  const confirmLocation = () => {
    Alert.alert('Location Confirmed', `Lat: ${lat}, Lng: ${lng}`);
  };
  const handleTypePress = (type) => {
    setSelectedType(type);
  };

  const moveToLocation = (lat, lng) => {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01, // Smaller delta means a more zoomed-in map
      longitudeDelta: 0.01,
    });
  };

  
  const onMarkerDragEnd = (e) => {
    setLat(e.nativeEvent.coordinate.latitude); 
    setLng(e.nativeEvent.coordinate.longitude); 
  };

  // If location hasn't been fetched yet, display a loading message
  if (!location) {
    return <Text>Loading...</Text>;
  }

  // Render the map and the confirm button
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
