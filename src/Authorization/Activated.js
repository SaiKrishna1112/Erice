import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';

import BASEURL from '../../Config';

export default function AccountStatusScreen() {
  const userData = useSelector((state) => state.counter);
  const [isActive, setIsActive] = useState();
  const navigation = useNavigation();

  // Fetch the account status when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAccountStatus();
    }, [])
  );

  const fetchAccountStatus = async () => {
    console.log("User Data ", userData);
    console.log("Account status ", userData.userStatus);
    if (userData.userStatus == "ACTIVE" || userData.userStatus == null) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  // Prompt user to confirm activation or deactivation
  const toggleAccountStatus = async () => {
    Alert.alert(
      `${!isActive ? 'Activate' : 'Deactivate'} Account`,
      `Are you sure you want to ${!isActive ? 'activate' : 'deactivate'} your account?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleAccountToggle(),
        },
      ]
    );
  };

  // Handle the activation or deactivation process
  const handleAccountToggle = async () => {
    try {
      const response = await axios({
        url: `${BASEURL}erice-service/order/userStatus`,
        data: { userStatus: !isActive ? 'ACTIVE' : 'INACTIVE', userId: userData.userId },
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });

      if (response.status === 200) {
        const message = !isActive
          ? 'Your account has been activated. You can now use the app as usual.'
          : `Your account has been deactivated. It will be deleted within 3 to 4 working days unless reactivated. Please contact support for further assistance.`;

        Alert.alert('Success', message, [
          {
            text: 'OK',
            onPress: () => {
              // Clear local user data and navigate to Login
              AsyncStorage.removeItem('userData');
              navigation.navigate('Login');
            },
          },
        ]);

        // Update local state
        setIsActive(!isActive);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update account status.');
      }
    } catch (error) {
      console.error('Error updating account status:', error.response);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred while updating your account status.';
      Alert.alert('Error', errorMessage);
    }
  };

  // Navigate to the Support Screen
  const navigateToSupport = () => {
    navigation.navigate('Support');
  };

  return (
    <View style={styles.container}>
      {/* Support button at the top-right corner */}
      <TouchableOpacity
        style={styles.supportTopButton}
        onPress={navigateToSupport}
      >
        <Text style={styles.supportTopButtonText}>Support</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manage Account Status</Text>
      <Text style={styles.instructions}>
        Your account is currently{' '}
        <Text style={{ fontWeight: 'bold', color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </Text>.
      </Text>

      {/* Display a note about account deletion */}
      <Text style={styles.note}>
        {isActive
          ? 'You can deactivate your account. Deactivation allows you to reactivate your account anytime within 10 days.'
          : 'Your account will be permanently deleted within 3-4 working days unless reactivated.'}
      </Text>

      {/* Allow users to toggle their account status */}
      <TouchableOpacity
        style={[
          styles.statusButton,
          isActive ? styles.deactivateButton : styles.activateButton,
        ]}
        onPress={toggleAccountStatus}
      >
        <Text style={styles.statusButtonText}>
          {isActive ? 'Deactivate Account' : 'Activate Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  statusButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  activateButton: {
    backgroundColor: '#007BFF',
  },
  deactivateButton: {
    backgroundColor: '#FF4C4C',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles for the top-right support button
  supportTopButton: {
    position: 'absolute',
    top: 10,
    right: 10, // Position button at the right side
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  supportTopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
