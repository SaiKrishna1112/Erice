import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { RadioButton, Checkbox } from 'react-native-paper';

const CheckOut = ({ navigation }) => {
    const [addressList, setAddressList] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentType, setPaymentType] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [applyWalletAmount, setApplyWalletAmount] = useState(false);
    const [availableWalletAmount, setAvailableWalletAmount] = useState(1000);  // Example amount
    const [subTotal, setSubTotal] = useState(500);  // Example amount
    const [discount, setDiscount] = useState(50);  // Example discount
    const [deliveryFee, setDeliveryFee] = useState(30);  // Example fee
    const [grandTotal, setGrandTotal] = useState(0);
    const [waitingLoader, setWaitingLoader] = useState(false);

    useEffect(() => {
        // Logic to fetch address list and other initial data
        calculateTotal();
    }, []);

    const calculateTotal = () => {
        let total = subTotal + deliveryFee - discount;
        setGrandTotal(total);
    };

    const changeLocation = () => {
        navigation.navigate("Add Address");
        // Alert.alert("Change Location");
    };

    const selectAddress = (id) => {
        setSelectedAddressId(id);
    };

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
        setPaymentType(type);
    };

    const placeOrder = () => {
        Alert.alert("Order Placed!");
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Delivery Address</Text>
            <TouchableOpacity onPress={changeLocation}>
                <Text style={styles.addButton}>+ Add New Address</Text>
            </TouchableOpacity>

            {addressList.length > 0 ? (
                addressList.map((address, index) => (
                    <View key={index} style={styles.addressRow}>
                        <Text style={styles.addressText}>
                            {address.flat_no}, {address.land_mark}, {address.pin_code}
                        </Text>
                        <Text style={styles.addressDetail}>Address: {address.address}</Text>
                        {selectedAddressId === address.id ? (
                            <TouchableOpacity>
                                <Text style={styles.selectedButton}>Selected</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => selectAddress(address.id)}>
                                <Text style={styles.selectButton}>Select</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            ) : (
                <View style={styles.noDeliveryRow}>
                    <Text style={styles.noDeliveryText}>No address found. Add a new address above.</Text>
                </View>
            )}

            {/* Payment Mode */}
            <View>
                <Text style={styles.paymentTitle}>Payment Mode</Text>
                <TouchableOpacity onPress={() => changePaymentType('1')}>
                    <View style={styles.paymentRow}>
                        <Image source={require('../../assets/cash.png')} style={styles.paymentImage} />
                        <Text>Cash on Delivery</Text>
                        <RadioButton
                            value="1"
                            status={paymentType === '1' ? 'checked' : 'unchecked'}
                            onPress={() => changePaymentType('1')}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changePaymentType('2')}>
                    <View style={styles.paymentRow}>
                        <Image source={require('../../assets/online.png')} style={styles.paymentImage} />
                        <Text>Online Payment</Text>
                        <RadioButton
                            value="2"
                            status={paymentType === '2' ? 'checked' : 'unchecked'}
                            onPress={() => changePaymentType('2')}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Coupon Form */}
            <Text style={styles.paymentTitle}>Coupon Code</Text>
            <View style={styles.couponRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter COUPON"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    editable={!couponApplied}
                />
                {couponApplied ? (
                    <TouchableOpacity onPress={removeCoupon}>
                        <Text style={styles.removeCouponButton}>Remove</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={applyCoupon}>
                        <Text style={styles.applyButton}>Apply</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Wallet Option */}
            {availableWalletAmount > 0 && (
                <View>
                    <Text style={styles.paymentTitle}>Use Wallet Balance</Text>
                    <View style={styles.walletRow}>
                        <Checkbox
                            status={applyWalletAmount ? 'checked' : 'unchecked'}
                            onPress={() => setApplyWalletAmount(!applyWalletAmount)}
                        />
                        <Text>Use ₹{availableWalletAmount} from wallet</Text>
                    </View>
                </View>
            )}

            {/* Payment Details */}
            <View style={styles.paymentDetails}>
                <Text style={styles.detailText}>Sub Total: ₹{subTotal}</Text>
                <Text style={styles.detailText}>Discount: ₹{discount}</Text>
                <Text style={styles.detailText}>Delivery Fee: ₹{deliveryFee}</Text>
                {applyWalletAmount && <Text style={styles.detailText}>From Wallet: ₹{availableWalletAmount}</Text>}
                <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
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
        marginTop:35,
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
        marginTop: 15,
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
        marginTop: 8,
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
