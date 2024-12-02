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
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import * as Location from "expo-location";
import BASE_URL from "../../../Config";
const { height, width } = Dimensions.get("window");

const Rice = () => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;

  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Request location permission when the component is focused
  useFocusEffect(
    useCallback(() => {
      requestLocationPermission();
    }, [])
  );

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
      setLoading(false);
    } catch (error) {
      console.error("Error requesting location permission", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        setHasLocationPermission(true);
        setLoading(false);
      } else {
        requestLocationPermission();
      }
    };

    checkPermission();
  }, []);

  // Fetch categories when permission is granted
  useFocusEffect(
    useCallback(() => {
      if (hasLocationPermission) {
        getAllCategories();
      }
    }, [hasLocationPermission])
  );

  // Fetch categories from API
  const getAllCategories = () => {
    setLoading(true);
    axios
      .get(BASE_URL + "erice-service/user/showItemsForCustomrs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.response);
        setLoading(false);
      });
  };

  if (loading == true) {
    return (
      <Animated.View style={styles.loaderContainer}>
        <Animated.View
          style={styles.loader}
          entering={SlideInDown.duration(500)}
        >
          <ActivityIndicator size="large" color="#3e2723" />
        </Animated.View>
      </Animated.View>
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
      {!hasLocationPermission && !permissionRequested && (
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
      )}

      {/* Main Content - Rice Categories */}

      {hasLocationPermission && (
        <View>
          <Text style={styles.title}>Rice Categories</Text>

          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.categoryName}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
});
