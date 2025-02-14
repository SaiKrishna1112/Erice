import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Screens imports
import Login from "../Authorization/Login";
import Register from "../Authorization/Register";
// import LoginScreen from "../Authorization/OldLogin";
// import LoginWithPassword from "../Authorization/OldLoginWithPassword";
// import Register from "../Authorization/OldRegister";
import LoginWithPassword from "../Authorization/LoginWithPassword";
import Refund from "../Screens/View/Refund";
import Activated from "../Authorization/Activated";
import Support from "../Screens/View/Active_Support";

// import ShareLinks from "../Referral Links/ShareLinks";

import Tabs from "./BottomTabs";
import RiceProductDetails from "../Screens/RiceProductDetails";
import ProductView from "../Components/productsDesign/ProductView";
import WalletPage from "../Screens/WalletScreen";
import AddressBook from "../Screens/Address/AddressBook";
import Subscription from "../Screens/Subscription/Subscription";
import SubscriptionHistory from "../Screens/Subscription/SubscriptionHistory";
import CheckOut from "../Screens/CheckOut";
import Rice from "../Screens/View/Rice";
import MainErice from "../Screens/MainErice";
import MyLocationPage from "../Screens/Address/MyLocationPage";
import SplashScreen from "../Authorization/SplashScreen";
import AddAddress from "../Screens/Address/AddAddress";
import CartScreen from "../Screens/View/CartScreen";
import OrderSummary from "../../src/Orders/OrderSummary";
import PaymentDetails from "../Screens/View/PaymentScreen";
import OrderDetails from "../Orders/OrderDetails-old"
import WriteToUs from '../Screens/View/WriteToUs';
import TicketHistory from '../Screens/View/TicketHistory';
import TicketHistoryComments from "../Screens/View/TicketHistoryComments";
import ItemDetails from "../Screens/ItemDetails";
import UserCancelledOrderDetails from "../Orders/UserCancelledOrderDetails";
import UserExchangeOrderDetails from "../Orders/UserExchangeOrderDetails";
import ContainerPolicy from "../Screens/View/ContainerPolicy";
export default function StacksScreens() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Rice"
      screenOptions={{
        headerTintColor: "white",
        headerTitleStyle: styles.headerTitleStyle,
        headerMode: "float",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#03843b",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Active" component={Activated} />
      <Stack.Screen
        name="LoginWithPassword"
        component={LoginWithPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={Register}
        options={{ headerShown: false }}
      />

      {/* <Stack.Screen name="ShareLinks" component={ShareLinks} /> */}
      
      <Stack.Screen
        name="Home"
        component={Tabs}
        options={{ headerShown:false,  }}
      />
      <Stack.Screen
        name="Rice Product Detail"
        component={RiceProductDetails}
        
        options={({ route }) => ({
          title: route.params.name,
          headerShown: true,
        })}
      />
      <Stack.Screen name="Product View" component={ProductView} />
      <Stack.Screen name="Wallet" component={WalletPage} />
      <Stack.Screen name="Subscription" component={Subscription} />
      <Stack.Screen name="Subscription History"component={SubscriptionHistory}/>
      <Stack.Screen name="Address Book" component={AddressBook} />
      <Stack.Screen name="MyLocationPage" component={MyLocationPage} />
      <Stack.Screen name="Checkout" component={CheckOut} />
      <Stack.Screen name="Rice" component={Rice} />
      <Stack.Screen name="Main Erice" component={MainErice} />
      <Stack.Screen name="Add Address" component={AddAddress}/>
      <Stack.Screen name="Splash Screen" component={SplashScreen} />
      <Stack.Screen name="Order Summary" component={OrderSummary}/>
      <Stack.Screen name="Payment Details" component={PaymentDetails}/>
      <Stack.Screen name="Order Details" component={OrderDetails}/>
      <Stack.Screen name="Ticket History" component={TicketHistory}/>
      <Stack.Screen name="View Comments" component={TicketHistoryComments} />
      <Stack.Screen name="Item Details" component={ItemDetails}/>
      <Stack.Screen name="Refund" component={Refund} />
      <Stack.Screen name="My Cancelled Item Details" component={UserCancelledOrderDetails} />
      <Stack.Screen name="My Exchanged Item Details" component={UserExchangeOrderDetails} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="Container Policy" component={ContainerPolicy} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignSelf: "center",
    justifyContent: "center",
  },
});
