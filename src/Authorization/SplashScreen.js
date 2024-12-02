import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  // Initialize animated value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // Adjust duration as needed
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, navigate to the login or register screen
      navigation.replace('Login'); // Change 'Login' to the appropriate screen
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/Oxyricelogo.png')} // Replace with your logo path
        style={[styles.logo, { opacity: fadeAnim }]} // Apply animated opacity
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional: set the background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200, // Adjust size as needed
    height: 200,
  },
});

export default SplashScreen;
