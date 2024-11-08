// import React, { useState, useEffect } from 'react';
// import {
//     View, Text, TextInput, Button, StyleSheet, Alert, ToastAndroid,
//     ScrollView, TouchableOpacity, Share, Image, Animated, Easing
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';

// const ProfilePage = () => {
//     const [profileForm, setProfileForm] = useState({
//         customer_name: '',
//         customer_email: '',
//         customer_mobile: '',
//     });
//     const [user, setUser] = useState({});
//     const [newPassword, setNewPassword] = useState('');
//     const [oldPassword, setOldPassword] = useState('');
//     const navigation = useNavigation();
//     const scaleAnim = useState(new Animated.Value(1))[0];

//     useEffect(() => {
//         getProfile();
//         animateProfile();
//     }, []);

//     const animateProfile = () => {
//         Animated.loop(
//             Animated.sequence([
//                 Animated.timing(scaleAnim, {
//                     toValue: 1.1,
//                     duration: 1000,
//                     easing: Easing.ease,
//                     useNativeDriver: true,
//                 }),
//                 Animated.timing(scaleAnim, {
//                     toValue: 1,
//                     duration: 1000,
//                     easing: Easing.ease,
//                     useNativeDriver: true,
//                 })
//             ])
//         ).start();
//     };

//     const getProfile = async () => {
//         try {
//             const response = await axios.get('customer/customer_by_token');
//             if (response.data.status) {
//                 setUser(response.data.data);
//                 setProfileForm({
//                     customer_name: response.data.data.customer_name,
//                     customer_email: response.data.data.customer_email,
//                     customer_mobile: response.data.data.customer_mobile,
//                 });
//             }
//             showToast(response.data.msg || 'Profile loaded successfully');
//         } catch (error) {
//             console.error(error);
//             showToast('Error loading profile');
//         }
//     };

//     const updateProfile = async () => {
//         if (profileForm.customer_name && profileForm.customer_email) {
//             try {
//                 const response = await axios.post('customer/update_profile', profileForm);
//                 showToast(response.data.msg || 'Profile updated successfully');
//             } catch (error) {
//                 console.error(error);
//                 showToast('Error updating profile');
//             }
//         } else {
//             showToast('Invalid form data');
//         }
//     };

//     const showToast = (message) => {
//         ToastAndroid.show(message, ToastAndroid.SHORT);
//     };

//     const changePassword = () => {
//         Alert.alert(
//             'Change Password',
//             'Enter new and old passwords',
//             [
//                 {
//                     text: 'Cancel',
//                     style: 'cancel',
//                 },
//                 {
//                     text: 'Update',
//                     onPress: (data) => {
//                         if (newPassword.length >= 6) {
//                             updatePassword({ newpassword: newPassword, oldpassword: oldPassword });
//                         } else {
//                             showToast('Minimum length of password is 6 characters');
//                         }
//                     },
//                 },
//             ],
//             { cancelable: true }
//         );
//     };

//     const updatePassword = async (params) => {
//         try {
//             const response = await axios.post('customer/update_password', params);
//             showToast(response.data.msg || 'Password updated successfully');
//         } catch (error) {
//             console.error(error);
//             showToast('Error updating password');
//         }
//     };

//     const onShare = async () => {
//         try {
//             const result = await Share.share({
//                 message: "Please share to your friends/family! https://play.google.com/store/apps/details?id=com.BMV.Money"
//             });
//             if (result.action === Share.sharedAction) {
//                 if (result.activityType) {
//                 } else {
//                 }
//             } else if (result.action === Share.dismissedAction) {
//             }
//         } catch (error) {
//             Alert.alert("oops", error.message);
//         }
//     };

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <View>

          
//             {/* <View style={styles.profileHeader}>
//                 <Text style={styles.heading}>Profile</Text>
//                 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                     <Ionicons name="person-circle-outline" size={100} color="#4CAF50" />
//                 </Animated.View>
//             </View> */}

//             <TextInput
//                 style={styles.input}
//                 placeholder="Your display name here"
//                 value={profileForm.customer_name}
//                 onChangeText={(text) => setProfileForm({ ...profileForm, customer_name: text })}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Your e-mail here"
//                 keyboardType="email-address"
//                 value={profileForm.customer_email}
//                 onChangeText={(text) => setProfileForm({ ...profileForm, customer_email: text })}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Your mobile number"
//                 value={profileForm.customer_mobile}
//                 editable={true}
//                 onChangeText={(text) => setProfileForm({ ...profileForm, customer_mobile: text })}
//             />

//             <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
//                 <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>

//             <View style={styles.optionContainer}>
//                 <TouchableOpacity style={styles.optionButton} onPress={changePassword}>
//                     <Text style={styles.optionText}>Change Password</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Subscription History')}>
//                     <Text style={styles.optionText}>Subscription History</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Address Book')}>
//                     <Text style={styles.optionText}>Address Book</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Wallet')}>
//                     <Text style={styles.optionText}>Wallet</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.optionButton} onPress={onShare}>
//                     <Text style={styles.optionText}>Refer & Share App Link</Text>
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.footer}>
//                 <Text>MY REFERRAL CODE: <Text style={styles.bold}>{user.referral_code}</Text></Text>
//                 <Text>Version: 1.0.24</Text>
//             </View>

//             <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
//                 <Ionicons name="log-out-outline" size={20} color="white" />
//                 <Text style={styles.logoutButtonText}>Logout</Text>
//             </TouchableOpacity>
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         padding: 20,
//         backgroundColor: '#F9F9F9',
//     },
//     profileHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 20,
//         backgroundColor: '#FFF',
//         padding: 20,
//         borderRadius: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//         elevation: 2,
//     },
//     heading: {
//         fontSize: 24,
//         fontWeight: 'bold',
//     },
//     input: {
//         height: 50,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         marginBottom: 20,
//         padding: 10,
//         borderRadius: 10,
//         backgroundColor: '#FFF',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 1,
//     },
//     saveButton: {
//         backgroundColor: '#4CAF50',
//         padding: 15,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginVertical: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//         elevation: 3,
//     },
//     saveButtonText: {
//         color: '#FFF',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     optionContainer: {
//         marginTop: 20,
//     },
//     optionButton: {
//         backgroundColor: '#FFF',
//         padding: 15,
//         borderRadius: 10,
//         marginBottom: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//         elevation: 2,
//     },
//     optionText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     footer: {
//         alignItems: 'center',
//         marginTop: 30,
//         backgroundColor: '#FFF',
//         padding: 10,
//         borderRadius: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 1,
//     },
//     bold: {
//         fontWeight: 'bold',
//     },
//     logoutButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f44336',
//         padding: 15,
//         borderRadius: 10,
//         marginTop: 20,
//         justifyContent: 'center',
//     },
//     logoutButtonText: {
//         color: '#FFF',
//         fontWeight: 'bold',
//         marginLeft: 10,
//     },
// });

// export default ProfilePage;


import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Alert, ToastAndroid,
    ScrollView, TouchableOpacity, Share, Image, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const ProfilePage = () => {
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
    const scaleAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        // getProfile();
        animateProfile();
    }, []);

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
            const response = await axios.get('customer/customer_by_token');
            if (response.data.status) {
                setUser(response.data.data);
                setProfileForm({
                    customer_name: response.data.data.customer_name,
                    customer_email: response.data.data.customer_email,
                    customer_mobile: response.data.data.customer_mobile,
                });
            }
            showToast(response.data.msg || 'Profile loaded successfully');
        } catch (error) {
            console.error(error);
            showToast('Error loading profile');
        }
    };

    const updateProfile = async () => {
        
        if (!profileForm.customer_name || !profileForm.customer_email) {
            setErrors({
                customer_name: profileForm.customer_name ? '' : 'Name should not be empty',
                customer_email: profileForm.customer_email ? '' : 'Email should not be empty',
            });
            return;
        }
        // console.log(userId);
        
        try {
            const response = await axios.patch('https://meta.oxyloans.com/api/erice-service/user/profileUpdate', {
                customerName: profileForm.customer_name,
                customerEmail: profileForm.customer_email,
                customerId: 1
            });

            if (response.status === 200) {
                Alert.alert("Success", "Profile Details Saved Successfully");
                // setProfileForm({ ...profileForm, customer_email: "" })
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
                    value={profileForm.customer_name}
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
                    value={profileForm.customer_email}
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
                    style={[styles.input, { backgroundColor: '#e0e0e0' }]}
                    placeholder="Your mobile number"
                    value={profileForm.customer_mobile}
                    editable={false}
                />

                <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <View style={styles.optionContainer}>
                   {/* <TouchableOpacity style={styles.optionButton} onPress={changePassword}>
                        <Text style={styles.optionText}>Change Password</Text>
                     </TouchableOpacity> */}

                    <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Subscription History')}>
                        <Text style={styles.optionText}>Subscription History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Address Book')}>
                        <Text style={styles.optionText}>Address Book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Wallet')}>
                        <Text style={styles.optionText}>Wallet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton} onPress={onShare}>
                        <Text style={styles.optionText}>Refer & Share App Link</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text>MY REFERRAL CODE: <Text style={styles.bold}>{user.referral_code}</Text></Text>
                    <Text>Version: 1.0.24</Text>
                </View>

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