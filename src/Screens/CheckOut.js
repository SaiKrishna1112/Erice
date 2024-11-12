/**
 * CheckOut component handles the checkout process for a user.
 * It allows the user to view and select a delivery address, choose a payment method,
 * and place an order with the selected options.
 * 
 * Props:
 * - navigation: The navigation object for navigating between screens.
 * - route: The route object containing parameters passed to this screen.
 * 
 * State:
 * - addressList: An array of user's addresses fetched from the server.
 * - selectedAddressId: The ID of the currently selected address.
 * - paymentType: The selected payment method (COD or ONLINE).
 * - couponCode: The entered coupon code for discounts.
 * - couponApplied: A boolean indicating whether a coupon has been applied.
 * - applyWalletAmount: A boolean indicating whether wallet amount is being applied.
 * - availableWalletAmount: The available amount in the user's wallet.
 * - subTotal: The subtotal amount of the cart.
 * - discount: The discount amount applied to the cart.
 * - deliveryFee: The delivery fee for the order.
 * - grandTotal: The grand total amount for the order after all calculations.
 * - waitingLoader: A boolean indicating whether a loading indicator should be shown.
 * - addressData: The data of the selected address.
 * - status: A boolean indicating whether a location has been selected.
 * - locationData: The data structure to hold location details.
 * 
 * Effects:
 * - useFocusEffect: Calculates totals and sets up address data when component is focused.
 * - useEffect: Fetches cart data when component mounts.
 * 
 * Functions:
 * - fetchOrderAddress: Fetches user's address from the server.
 * - totalCart: Fetches and sets the grand total of the cart.
 * - calculateTotal: Calculates the grand total of the order.
 * - changeLocation: Navigates to the MyLocationPage screen.
 * - selectAddress: Selects an address from the list and updates location data.
 * - applyCoupon: Applies the entered coupon code.
 * - removeCoupon: Removes the applied coupon code.
 * - changePaymentType: Sets the payment method.
 * - placeOrder: Places an order with the selected details and handles payment.
 */

import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { RadioButton, Checkbox } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";


const CheckOut = ({ navigation,route }) => {
   
    //  const {locationdata} = route.params
    //  console.log("location data",locationdata);
     
    const [addressList, setAddressList] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentType, setPaymentType] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [applyWalletAmount, setApplyWalletAmount] = useState(false);
    const [availableWalletAmount, setAvailableWalletAmount] = useState(1000);  // Example amount
    const [subTotal, setSubTotal] = useState(); 
    const [discount, setDiscount] = useState(0);  
    const [deliveryFee, setDeliveryFee] = useState(0);  
    const [grandTotal, setGrandTotal] = useState(0);
    const [waitingLoader, setWaitingLoader] = useState(false);
    const [addressData,setAddressData] = useState();
    const [status,setStatus] = useState(false)
    const accessToken =  AsyncStorage.getItem("accessToken");
    const [locationData, setLocationData] = useState({
        customerId:4,
        flatNo: '',
        landMark: '',
        pincode: '',
        address: '',
        addressType: '',
        latitude: '',
        longitude: '',
     
      });

      useFocusEffect(
        useCallback(() => {
            calculateTotal();
            totalCart();
            fetchOrderAddress();
            console.log(" from my location page", route.params.locationdata);
            setStatus(route.params.locationdata.status)
            
            setAddressData(route.params.locationdata);
            setLocationData({
                customerId: route.params.locationdata.customerId,
                flatNo: route.params.locationdata.flatNo,
                landMark: route.params.locationdata.landMark,
                pincode: route.params.locationdata.pinCode,
                address: route.params.locationdata.address,
                addressType: route.params.locationdata.addressType,
                latitude: '',
                longitude: '',
            });
    
            // Cleanup function if needed (optional)
            return () => {
                // Clean up any side effects here if needed
            };
        }, [route.params.locationdata])
    )


    const fetchOrderAddress = async () => {
        try {
          const response = await axios({
            url: 'https://meta.oxyloans.com/api/erice-service/checkout/orderAddress?customerId=4',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzMxMTM1MTQ2LCJleHAiOjE3MzE5OTkxNDZ9.L5ifXxdF9bzuG5tgtK-AAS-DWNKoZ1sXNLl_OydCgC5m9ApGzXKCEIUjdET5mMXhhwmqFbY_nip-KPLjLoaZbQ'
            }
          });
      
        //   console.log("address data",response.data);
          setAddressList(response.data)
        //   console.log("address list",addressList);
        } catch (error) {
          console.error('Error fetching order address data:', error);
          setError('Failed to fetch order address data');
        }
      };

    const totalCart = async () => {
        try {
          const response = await axios({
            url: 'http://65.0.147.157:8282/api/erice-service/cart/cartItemData', // ensure this is the correct endpoint
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTA0MzA2NiwiZXhwIjoxNzMxOTA3MDY2fQ.eqxdiGoFWqPvPaVVDnxOS3mM9XWDSo0YylZ6gQt7kz0gduQREPq2202OyhmYRCOfXK_GW8xMbsLmEOKe9rHdtg'
            },
            data: {
              customerId: 4
            }
          });
    
        //   console.log('Cart data:', response.data);
          setGrandTotal(response.data.totalSum); // Assume response.data.totalSum holds the total amount
        //   console.log("Grand Total:", response.data.totalSum);
          
        } catch (error) {
          console.error('Error fetching cart data:', error);
          setError('Failed to fetch cart data');
        }
      };
    
      useEffect(() => {
        totalCart();
      }, []);

    const calculateTotal = () => {
        let total = subTotal + deliveryFee - discount;
        setGrandTotal(total);
        return total
    };

    const changeLocation = () => {
        // setStatus(true)
        console.log("varam");
        
        console.log(route.params.locationdata);
        
        navigation.navigate("MyLocationPage");
        // Alert.alert("Change Location");
    };

    const selectAddress = (address) => {
        setSelectedAddressId(address.addressId);
        // console.log(address);
        
        setLocationData({
            customerId:4,
            flatNo:address.flatNo,
            landMark:address.landMark,
            pincode:address.pinCode,
            address:address.address,
            addressType:address.addressType,
            latitude: '',
            longitude: '',
        })


    };
    //  console.log("selected address id",selectedAddressId);
     
    const applyCoupon = () => {
        if (couponCode) {
            setCouponApplied(true);
        } else {
            Alert.alert("Enter a valid coupon");
        }
    };

    const removeCoupon = () => {
        setCouponApplied(false);
        setCouponCode('');
    };

    const changePaymentType = (type) => {
        console.log({type});
        
        setPaymentType(type);
    };

   
    const placeOrder = () => {
        console.log("Location Data:", locationData);
    
        // Ensure that locationData contains the necessary data
        const postData = {
            address: locationData.address,
            amount: subTotal,                       
            customerId: locationData.customerId,
            flatNo: locationData.flatNo,
            landMark: locationData.landMark,
            orderStatus: paymentType,
            pincode: locationData.pincode ,
            sellerId: locationData.sellerId ,
        };
    
        console.log("Post Data:", postData);
    
        // axios({
        //     method: 'POST',
        //     url: 'http://65.0.147.157:8282/api/erice-service/checkout/orderPlacedPaymet',
        //     data: postData,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTMwODYwNiwiZXhwIjoxNzMyMTcyNjA2fQ.5edNAnfhlAPuAtDLvfxBHeR6XKsmiGtWMiVJHlY6LKvH3hCRSQEghodAph0sN_ID8EMcd0Hkn8pijcmRQH0iZw`
        //     }
        // })
        // .then((response) => {
        //     console.log("Order Placed Response:", response.data);
    
        //     // Handle COD or other payment types here
        //     if (paymentType === null || paymentType === 'COD') {
        //         Alert.alert("Order Placed!");
        //     } else {
        //         axios({
        //             method: 'POST',
        //             url: 'http://65.0.147.157:8282/api/erice-service/checkout/orderPlacedPaymet',
        //             data: {
        //                 ...postData,
        //                 paymentId: response.data.paymentId,
        //                 paymentStatus: "SUCCESS"
        //             },
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTMwODYwNiwiZXhwIjoxNzMyMTcyNjA2fQ.5edNAnfhlAPuAtDLvfxBHeR6XKsmiGtWMiVJHlY6LKvH3hCRSQEghodAph0sN_ID8EMcd0Hkn8pijcmRQH0iZw`
        //             }
        //         })
        //         .then((secondResponse) => {
        //             console.log("Order Placed with Payment API:", secondResponse.data);
        //             Alert.alert("Order Placed!");
        //         })
        //         .catch((error) => {
        //             console.error("Error in payment confirmation:", error);
        //         });
        //     }
        // })
        // .catch((error) => {
        //     console.error("Order Placement Error:", error);
        // });
    };
    

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Delivery Address</Text>
            <TouchableOpacity onPress={changeLocation}>
                <Text style={styles.addButton}>+ Add New Address</Text>
                     {/* <Text>{locationData.address}</Text> */}
            </TouchableOpacity>
     
{status? (
          
            <View style={styles.addressRow}>
                <Text style={styles.addressText}>
                    {locationData.flatNo}, {locationData.landMark}, {locationData.pinCode}
                </Text>
                <Text style={styles.addressDetail}>Address: {locationData.address}</Text>
                <TouchableOpacity>
                    <Text style={styles.selectedButton}>Selected</Text>
                </TouchableOpacity>
            </View>
        ) : (
            
            addressList.length > 0 ? (
                addressList.slice(0, 4).map((address, index) => (
                    <View key={index} style={styles.addressRow}>
                        <Text style={styles.addressText}>
                            {address.flatNo}, {address.landMark}, {address.pinCode}
                        </Text>
                        <Text style={styles.addressDetail}>Address: {address.address}</Text>
                        {selectedAddressId === address.addressId ? (
                            <TouchableOpacity>
                                <Text style={styles.selectedButton}>Selected</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => selectAddress(address)}>
                                <Text style={styles.selectButton}>Select</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            ) : (
                <View style={styles.noDeliveryRow}>
                    <Text style={styles.noDeliveryText}>No address found. Add a new address above.</Text>
                </View>
            )
        )}

            {/* Payment Mode */}
            <View>
                <Text style={styles.paymentTitle}>Payment Mode</Text>
                <TouchableOpacity onPress={() => changePaymentType('COD')}>
                    <View style={styles.paymentRow}>
                        <Image source={require('../../assets/cash.png')} style={styles.paymentImage} />
                        <Text>Cash on Delivery</Text>
                        <RadioButton
                            value="1"
                            status={paymentType === 'COD' ? 'checked' : 'unchecked'}
                            onPress={() => changePaymentType('COD')}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changePaymentType('ONLINE')}>
                    <View style={styles.paymentRow}>
                        <Image source={require('../../assets/online.png')} style={styles.paymentImage} />
                        <Text>Online Payment</Text>
                        <RadioButton
                            value="2"
                            status={paymentType === 'ONLINE' ? 'checked' : 'unchecked'}
                            onPress={() => changePaymentType('ONLINE')}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentDetails}>
                <Text style={styles.detailText}>Sub Total: ₹{grandTotal}</Text>
                <Text style={styles.detailText}>Discount: ₹{discount}</Text>
                <Text style={styles.detailText}>Delivery Fee: ₹{deliveryFee}</Text>
                {applyWalletAmount && <Text style={styles.detailText}>From Wallet: ₹{availableWalletAmount}</Text>}
                <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
            </View>

            
            <TouchableOpacity
                style={[
                    styles.placeOrderButton,
                    { backgroundColor: paymentType ? '#007bff' : '#d3d3d3' } 
                ]}
                onPress={placeOrder}
                disabled={!paymentType || !addressData} 
            >
                <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
       
        padding: 10,
        backgroundColor: '#f8f9fa',
        width:'100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 8,
        textAlign: 'left',
        marginTop:10,
    },
    addButton: {
        color: '#007bff',
        textAlign: 'right',
        fontWeight: '600',
        marginBottom: 15,
    },
    addressRow: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 2,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
    },
    addressDetail: {
        fontSize: 12,
        color: '#6c757d',
    },
    noDeliveryRow: {
        backgroundColor: '#e9ecef',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    noDeliveryText: {
        color: '#6c757d',
    },
    selectButton: {
        color: '#28a745',
        fontWeight: '600',
        marginTop: 5,
    },
    selectedButton: {
        color: '#007bff',
        fontWeight: '600',
        marginTop: 5,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#343a40',
        marginTop: 15,
        marginBottom: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 2,
    },
    paymentImage: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    couponRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ced4da',
        padding: 8,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    applyButton: {
        color: '#007bff',
        marginLeft: 8,
        fontWeight: '600',
    },
    removeCouponButton: {
        color: '#dc3545',
        marginLeft: 8,
        fontWeight: '600',
    },
    walletRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentDetails: {
        marginTop: 5,
        alignSelf:"flex-end",
        marginRight:30
    },
    detailText: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 5,
    },
    grandTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop:2,
    },
    placeOrderButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default CheckOut;

