import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


// Screens imports

import LoginScreen from '../Authorization/Login';
import Register from '../Authorization/Register';

import Tabs from './BottomTabs';
import RiceProductDetails from '../Screens/RiceProductDetails';
import ProductView from '../Components/productsDesign/ProductView';
import WalletPage from '../Screens/WalletScreen';
import SubscriptionHistory from '../Screens/Subscription/SubscriptionHistroy';
import AddressBook from '../Screens/Address/AddressBook';
import Subscription from '../Screens/Subscription/Subscription';
import CheckOut from '../Screens/CheckOut';
import AddAddress from '../Screens/Address/AddAddress';



export default function StacksScreens() {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator
        initialRouteName="Profile"
        screenOptions={{
        headerTintColor: 'white',
        headerTitleStyle: styles.headerTitleStyle,
        headerMode: 'float',
        headerShown: true,
        headerStyle: {
        backgroundColor: "#8c68ce",
        },
      }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
            <Stack.Screen name='RegisterScreen' component={Register} options={{headerShown:false}}/>
            <Stack.Screen name="Home" component={Tabs} options={{headerShown:false}}/>
            <Stack.Screen name="RiceProductDetail" component={RiceProductDetails} />
            <Stack.Screen name="Product View" component={ProductView} />
            <Stack.Screen name='Wallet' component={WalletPage}/>
            <Stack.Screen name='Subscription' component={Subscription} />
            <Stack.Screen name='Subscription History' component={SubscriptionHistory} />
            <Stack.Screen name='Address Book' component={AddressBook} />
            <Stack.Screen name='Add Address' component={AddAddress} />
            <Stack.Screen name='Checkout'component={CheckOut}/>
            
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignSelf: 'center',
      justifyContent: 'center',
    },
  });