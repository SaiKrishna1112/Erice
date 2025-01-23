import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SubscriptionHistory = () => {
  const [user, setUser] = useState(null);
  const [waitingLoader, setWaitingLoader] = useState(false);
  const navigation = useNavigation();


const SubscriptionPage = () => {
    const navigation = useNavigation();
  
    const handleSubscribe = () => {
      Alert.alert('Sign Up', 'Sign Up Button Pressed', [
        { text: 'OK', onPress: () => navigation.navigate('Subscription') },
      ]);
    };

  return (
    <View style={styles.container}>
      <Text>Subscription Page</Text>
      <Button title="Subscribe" onPress={handleSubscribe} />
    </View>
  );
};
  useEffect(() => {
    getProfile();
    return () => {
      // clearInterval(instamojoInterval);
    };
  }, []);

  const getProfile = async () => {
    // Simulate an API call
    setWaitingLoader(true);
    setTimeout(() => {
      setUser({ customer_id: '123' });
      setWaitingLoader(false);
    }, 2000);
  };

  const getSubscription = async (status, plan_id) => {
    if (user) {
      if (status === '1') {
        setWaitingLoader(true);
        // Simulate API call
        setTimeout(() => {
          setWaitingLoader(false);
          // Navigate to payment page or handle payment
          Alert.alert('Subscription', 'Redirecting to payment');
        }, 2000);
      } else {
        Alert.alert('Subscription', 'The plan is inactive now');
      }
    } else {
      login();
    }
  };

  const login = () => {
    // Simulate login logic
    Alert.alert('Login', 'Open login modal');
    // Assuming user is logged in, fetch the profile again
    getProfile();
  };

  const exitAndGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }], // Adjust to the home route name
    });
  };

  if (waitingLoader) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Please complete the payment</Text>
        <Button title="Exit and Go Home" onPress={exitAndGoHome} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.data}>
        <Text>Pay 10,000 & Get 15,000</Text>
        <Text>Instant Credit in Wallet</Text>
        <Text>Per Month Limit: ₹2000</Text>
        <Button title="Subscribe" onPress={() => getSubscription('1', 'plan_1')} />
      </View>
      {/* Repeat for other subscription plans */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  data: {
    padding: 10,
    textAlign: 'center',
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: '#e1eef4',
    borderColor: '#26a9e0',
    borderWidth: 1,
  },
});

export default SubscriptionHistory;
