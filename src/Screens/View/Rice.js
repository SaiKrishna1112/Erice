import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  BackHandler
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import * as Location from "expo-location";
import BASE_URL from "../../../Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AccessToken } from "../../../Redux/action/index";
const { height, width } = Dimensions.get("window");

import { useNavigationState } from '@react-navigation/native';
import { isWithinRadius } from "../Address/LocationService";
import LottieView from "lottie-react-native";
import { ScrollView } from "react-native-gesture-handler";

const Rice = () => {
  const userData = useSelector((state) => state.counter);
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [user,setUser] = useState({
    latitude: 0,
    longitude: 0, 
  });
  const dispatch = useDispatch();

  // Request location permission when the component is focused
  useFocusEffect(
    useCallback(() => {
      
      
      requestLocationPermission();
      // if(!userData){
      checkLoginData();
      // }
    }, [])
  );

  const checkLoginData = async () => {
    console.log("userData", userData);
    if(userData && userData.accessToken){
      if(userData.userStatus=="ACTIVE" || userData.userStatus==null){
        navigation.navigate("Home");
      }else{
        navigation.navigate("Active");
      }
    }else{
    try {
      const loginData = await AsyncStorage.getItem("userData");
      // console.log("logindata",loginData);
      if (loginData) {
        const user = JSON.parse(loginData);
        if (user.accessToken) {
          // console.log("user",user);
          if(user.userStatus=="ACTIVE" || user.userStatus==null){
            console.log("Active");
            dispatch(AccessToken(user));
            navigation.navigate("Home");
          }else{ 
            console.log("Inactive"); 
            dispatch(AccessToken(user));
            navigation.navigate("Active");
          }
          // navigation.navigate("Home");
        }
      }else{
        navigation.navigate("Rice");
      }
    } catch (error) {
      console.error("Error fetching login data", error.response);
    }
  }
  }
  const currentScreen = useNavigationState(
    (state) => state.routes[state.index]?.name
  );

useFocusEffect(
  useCallback(() => {
    const handleBackPress = () => {
      // if (currentScreen === 'Login') {
        // Custom behavior for Login screen
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        )

      return true;
    };

    // Add BackHandler event listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [currentScreen])
)



  

 
  // Function to request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setHasLocationPermission(true);
      } else {
        setHasLocationPermission(false);
      }
      setPermissionRequested(true);

    } catch (error) {
      console.error("Error requesting location permission", error);
    
    }
  };

  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("Location Permission Status:", status);
      if (status === "granted") {
        setHasLocationPermission(true);
       
      } else {
        requestLocationPermission();
        Alert.alert(
          'Location Permission',
          'We need your location to check delivery availability. Please enable location permissions in your settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    };

    checkPermission();
  }, []);

   // Get and log the latitude and longitude
   const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
       setUser({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location", error);
      return null;
    }
  };
  // Fetch categories when permission is granted
  useFocusEffect(
    useCallback(() => {
      // if (hasLocationPermission) {
        getAllCategories();
        getLocation();
        const { isWithin, distance } = isWithinRadius(user,20000);
        console.log("Is within radius:", isWithin);
        console.log("Distance:", distance);

    }, [])
  );


 
  
  const getAllCategories = () => {
    setLoading(true);
    axios
      .get(BASE_URL + "erice-service/user/showItemsForCustomrs", {
        // headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // console.log("rice",response.data);
        
        setCategories(response.data);
        setTimeout(() => {
        setLoading(false);
        }, 3000);
      })
      .catch((error) => {
        console.log(error.response);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView 
          source={require("../../../assets/AnimationLoading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    if (!item.categoryLogo) return null;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)
          .duration(600)
          .springify()
          .damping(12)}
        style={styles.card}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Rice Product Detail", {
              details: item,
              name: item.categoryName,
              image: item.categoryLogo,
            })
          }
        >
          <Image
            source={{ uri: item.categoryLogo }}
            style={styles.image}
            onError={() => console.log("Failed to load image")}
          />
          <Text style={styles.categoryName}>{item.categoryName}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Filter out categories without images
  const filteredCategories = categories.filter((item) => item.categoryLogo);

  return (
    <View style={styles.container}>
      <SafeAreaView />

      {/* Location Permission Request Section */}
      {/* {!hasLocationPermission && !permissionRequested && (
        <View style={styles.permissionRequestContainer}>
          <Text style={styles.title}>We need your location</Text>
          <Text style={styles.subtitle}>
            Please grant location permission to use the app.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestLocationPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Main Content - Rice Categories */}

      {/* {hasLocationPermission && ( */}
      <ScrollView>
        <View>
           <View style={styles.imageView}>
               <Image source={require("../../../assets/container.jpg")} style={styles.imgView}/>
               {/* <TouchableOpacity style={{width:width*0.5,height:"10%",backgroundColor:"#e87f02",justifyContent:"center",alignItems:"center",borderRadius:10,marginTop:20}} onPress={()=>navigation.navigate("Container Policy")}>
                  <Text style={{color:"white",fontSize:20,fontWeight:"bold"}}>Know More</Text>
               </TouchableOpacity> */}
           </View>
           <Text style={styles.title}>Rice Categories</Text>

         {filteredCategories?
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.categoryName}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
          />
          :
         <View>
            <Text>No Data Found</Text>
         </View>
}
        </View>
        </ScrollView>
      {/* )} */}
    </View>
  );
};

export default Rice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf7f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#3e2723",
  },
  subtitle: {
    fontSize: 16,
    color: "#3e2723",
    marginVertical: 10,
    textAlign: "center",
  },
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    // marginBottom:150
  },
  card: {
    flex: 1,
    margin: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  image: {
    marginLeft:10,
    height: 90,
    width: 90,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
  },
  categoryName: {
    color: "#3e2723",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: "#3e2723",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  permissionRequestContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  button: {
    backgroundColor: "#3e2723",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  imageView: {
    marginBottom: 10,
    marginTop: "5%",
    alignSelf: "center",
    justifyContent: "center",
    width: width * 0.9,
    height: 240,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
    overflow: "hidden",
  },
  imgView: {
    width: width * 0.9,
    height: "100%",
    resizeMode: "contain",
    alignSelf: "center",

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    // Android Elevation
    elevation: 6,

    // Optional: Add stroke
    borderWidth: 1,
    borderColor: "white",
  },
});
