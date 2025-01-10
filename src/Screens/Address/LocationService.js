import axios from "axios";
import { Alert } from "react-native";

// Utility to check if a position is within a radius
export const isWithinRadius = (coord1) => {
  console.log("coord1", coord1);
  console.log("centralPosition", centralPosition);

  const toRad = (value) => (value * Math.PI) / 180; 

  const R = 6371e3; // Earth's radius in meters

  // Normalize property names for coord2 (handles inconsistent casing)
  const lat2 = centralPosition.Latitude || centralPosition.Latitude;
  const lon2 = centralPosition.Longitude ||centralPosition.Longitude;

  if (!lat2 || !lon2) {
    console.error("Invalid centralPosition: missing latitude or longitude.");
    return { isWithin: false, distance: 0 };
  }

  if(coord1.latitude== null || coord1.longitude==null||coord1.latitude==undefined || coord1.longitude==undefined||coord1.latitude=="" || coord1.longitude==""||coord1.latitude==0 || coord1.longitude==0){
    return false;
  }

  const lat1 = toRad(coord1.latitude);
  const lat2Rad = toRad(lat2);
  const deltaLat = toRad(lat2 - coord1.latitude);
  const deltaLon = toRad(lon2 - coord1.longitude);
 if(coord1.latitude!= null || coord1.longitude!=null||coord1.latitude!=undefined || coord1.longitude!=undefined||coord1.latitude!="" || coord1.longitude!=""||coord1.latitude!=0 || coord1.longitude!=0){
  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  console.log("Calculated Distance (meters):", distance);

  // Check if the distance is within the radius
  const isWithin = distance <= radius;
  console.log("Is within radius:", isWithin);


  const distanceInKm = (distance / 1000).toFixed(2); // Convert to kilometers for display

  if (isWithin) {
    // Alert.alert("Success", `We can deliver to this address within the radius.`);
    return { status: "success", distanceInKm, isWithin,coord1 };
  } else {
    Alert.alert(
      "Sorry",
      `We cannot deliver to this address because your distance is ${distanceInKm} km, which is not within the ${radius / 1000} km radius.`
    );
    return { status: "error", distanceInKm, isWithin, coord1 };
  }
};
}

const centralPosition = {
    Latitude: 17.4752533,
     Longitude: 78.3847054
  };

const radius = 20000;

// Function to get coordinates and check if within radius
export const getCoordinates = async (address) => {
  console.log("Address:", address);
 console.log("Central Position:", centralPosition);
 
  const API_KEY = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;
var results;
  try {
    const response = await axios.get(url);
    console.log("Coordinates response:", response.data);

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;

    results = isWithinRadius(
        { latitude: location.lat, longitude: location.lng }
      )
      
    } else {
      console.error("Error fetching coordinates:", response.data.status);
      Alert.alert("Error", "Could not fetch coordinates for the given address.");
      return { status: "error", distance: 0, isWithin: false };
    }
  } catch (error) {
    console.error("Error making the API call:", error);
    Alert.alert("Error", "An error occurred while fetching the address details.");
    return { status: "error", distance: 0, isWithin: false };
  }
  return results;
};
