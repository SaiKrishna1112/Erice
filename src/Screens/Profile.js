import React, { useState, useEffect,useCallback } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Alert, ToastAndroid,
    ScrollView, TouchableOpacity, Share, Image, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { useFocusEffect } from '@react-navigation/native';

const ProfilePage = () => {

        
  const userData = useSelector(state => state.counter);
  const token=userData.accessToken
  const customerId=userData.userId

    const [profileForm, setProfileForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_mobile: '',
    });
    const [errors, setErrors] = useState({
        customer_name: '',
        customer_email: '',
    });
    const [user, setUser] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const navigation = useNavigation();
    const [isProfileSaved, setIsProfileSaved] = useState(false); 
    const [isInitiallySaved, setIsInitiallySaved] = useState(false); 
    const scaleAnim = useState(new Animated.Value(1))[0];
    const [profileData,setProfileData] = useState();

    useFocusEffect(
        useCallback(() => {
           
            animateProfile();
            getProfile();
            
        }, []) 
    );

    useEffect(() => {
        if ( profileForm.customer_mobile) {
            setIsProfileSaved(true);
            setIsInitiallySaved(true); 
        } else if (!isInitiallySaved) {
           
            setIsProfileSaved(false);
        }
    }, [profileForm]);

    const animateProfile = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,

                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const getProfile = async () => {
        try {
            const response = await axios({ 
                method: 'GET' ,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                url:`https://meta.oxyloans.com/api/erice-service/user/customerProfileDetails?customerId=${customerId}`

            })
            console.log(response.data);
            
            if (response.status===200) {
                console.log(response.data);
                setUser(response.data);
                setProfileForm({
                    customer_name: response.data.name,
                    customer_email: response.data.email,
                    customer_mobile: response.data.mobileNumber,
                });

            }
            showToast(response.data.msg || 'Profile loaded successfully');
        } catch (error) {
            console.error(error);
            showToast('Error loading profile');
        }
    };



    
    const handleProfileSubmit = async () => {
       
        if (!profileForm.customer_name || !profileForm.customer_email) {
            setErrors({
                customer_name: profileForm.customer_name ? '' : 'Name should not be empty',
                customer_email: profileForm.customer_email ? '' : 'Email should not be empty',
            });
            return;
        }

        try {
            
            const response = await axios.patch(
                'https://meta.oxyloans.com/api/erice-service/user/profileUpdate',
                {
                    customerName: profileForm.customer_name,
                    customerEmail: profileForm.customer_email,
                    customerId: 4, 
                    customerMobile: profileForm.customer_mobile, 
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTMwODYwNiwiZXhwIjoxNzMyMTcyNjA2fQ.5edNAnfhlAPuAtDLvfxBHeR6XKsmiGtWMiVJHlY6LKvH3hCRSQEghodAph0sN_ID8EMcd0Hkn8pijcmRQH0iZw'
                    }
                }
            );

            // Handle response status
            if (response.status === 200) {
                console.log("profile call ",response);
                setProfileData(response.data);
                console.log("profile data",profileData);
                
                if (isProfileSaved) {
                    Alert.alert("Success", "Profile updated successfully");
                } else {
                    Alert.alert("Success", "Profile saved successfully");
                }
                setIsProfileSaved(true); 
                // setIsInitiallySaved(true);
                setProfileForm({
                    ...profileForm,
                    customer_name: response.data.customerName,
                    customer_email: response.data.customerEmail,
                    customer_mobile: response.data.customerMobile
                });
                console.log("profile form",profileForm);
                
            } else {
                Alert.alert("Alert", "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Alert", "Error saving profile");
        }
    };


    const showToast = (message) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const changePassword = () => {
        Alert.alert(
            'Change Password',
            'Enter new and old passwords',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Update',
                    onPress: () => {
                        if (newPassword.length >= 6) {
                            updatePassword({ newpassword: newPassword, oldpassword: oldPassword });
                        } else {
                            showToast('Minimum length of password is 6 characters');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const updatePassword = async (params) => {
        try {
            const response = await axios.post('customer/update_password', params);
            showToast(response.data.msg || 'Password updated successfully');
        } catch (error) {
            console.error(error);
            showToast('Error updating password');
        }
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: "Please share to your friends/family! https://play.google.com/store/apps/details?id=com.BMV.Money"
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                } else {
                }
            } else if (result.action === Share.dismissedAction) {
            }
        } catch (error) {
            Alert.alert("Oops", error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View>
                <TextInput
                    style={styles.input}
                    placeholder="Your display name here"
                    value={profileForm?.customer_name || ''}
                    onChangeText={(text) => {
                        setProfileForm({ ...profileForm, customer_name: text });
                        setErrors({ ...errors, customer_name: '' });
                    }}
                />
                {errors.customer_name ? <Text style={styles.errorText}>{errors.customer_name}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Your e-mail here"
                    keyboardType="email-address"
                    value={profileForm?.customer_email || ''}
                    onChangeText={(text) => {
                        if (/^[\w.-]+@gmail\.com$/.test(text)) {
                            setProfileForm({ ...profileForm, customer_email: text });
                            setErrors({ ...errors, customer_email: '' }); // Clear errors if valid
                        } else {
                            setProfileForm({ ...profileForm, customer_email: text });
                            setErrors({ ...errors, customer_email: 'Please enter a valid gmail address' });
                        } }}
                />
                {errors.customer_email ? <Text style={styles.errorText}>{errors.customer_email}</Text> : null}

                <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: isProfileSaved ? '#e0e0e0' : '#fff', 
                        // color: isProfileSaved ? 'gray' : 'black', 
                    }
                ]}
                placeholder="Your mobile number"
                value={profileForm?.customer_mobile || ''}
                onChangeText={(text) => setProfileForm({ ...profileForm, customer_mobile: text })}
                editable={!isProfileSaved } 
               
            />

            
            <TouchableOpacity
                style={{
                    backgroundColor: '#007bff',
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center',
                    marginTop: 10,
                }}
                onPress={handleProfileSubmit}
            >
                <Text style={{ color: 'white', fontSize: 16 }}>
                {isProfileSaved || isInitiallySaved ? 'Update Profile' : 'Save Profile'}
                </Text>
            </TouchableOpacity>
                <View style={styles.optionContainer}>
                   {/* <TouchableOpacity style={styles.optionButton} onPress={changePassword}>
                        <Text style={styles.optionText}>Change Password</Text>
                     </TouchableOpacity> */}

                    {/* <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Subscription History')}>
                        <Text style={styles.optionText}>Subscription History</Text>
                    </TouchableOpacity> */}
                    {/* {isProfileSaved? */}
                    <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Address Book',{profile:profileForm })}>
                        <Text style={styles.optionText}>Address Book</Text>
                    </TouchableOpacity>
                    {/* :null} */}

                    {/* <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Wallet')}>
                        <Text style={styles.optionText}>Wallet</Text>
                    </TouchableOpacity> */}

                    {/* <TouchableOpacity style={styles.optionButton} onPress={onShare}>
                        <Text style={styles.optionText}>Refer & Share App Link</Text>
                    </TouchableOpacity> */}
                </View>

                {/* <View style={styles.footer}>
                    <Text>MY REFERRAL CODE: <Text style={styles.bold}>{user.referral_code}</Text></Text>
                    <Text>Version: 1.0.24</Text>
                </View> */}

                <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
                    <Ionicons name="log-out-outline" size={20} color="white" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F9F9F9',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 12,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    optionContainer: {
        marginTop: 20,
    },
    optionButton: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    bold: {
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF5722',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    logoutButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default ProfilePage;