import React, { useEffect } from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import CustomNavigationBar from "../Components/AppBar";
import Rice from "../Screens/View/Rice";
import ProfilePage from "../Screens/Profile";
import { COLORS } from "../../assets/theme/theme";
import axios from "axios";
import CartScreen from "../Screens/View/CartScreen";
import RiceProductDetails from "../Screens/RiceProductDetails";

const Tab = createBottomTabNavigator();

// function Cart() {
//   // useEffect(() => {
//   //   navigation.navigate("CartScreen");
//   // });

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Cart</Text>
//     </View>
//   );
// }

function Offers() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Offers</Text>
    </View>
  );
}

function Order() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Order</Text>
    </View>
  );
}

const getIconColor = (focused) => ({
  tintColor: focused ? COLORS.primary : COLORS.dark,
});

const Tabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Rice"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        header: (props) => <CustomNavigationBar {...props} />,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Rice}
        options={{
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={require("../../assets/BottomTabImages/Home.png")}
                resizeMode="contain"
                style={[styles.tabIcon, getIconColor(focused)]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={Order}
        options={{
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={require("../../assets/BottomTabImages/order.png")}
                resizeMode="contain"
                style={[styles.tabIcon, getIconColor(focused)]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Offers"
        component={Offers}
        options={{
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={require("../../assets/BottomTabImages/offer.png")}
                resizeMode="contain"
                style={[styles.tabIcon, getIconColor(focused)]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={require("../../assets/BottomTabImages/cart.png")}
                resizeMode="contain"
                style={[styles.tabIcon, getIconColor(focused)]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={require("../../assets/BottomTabImages/profile.png")}
                resizeMode="contain"
                style={[styles.tabIcon, getIconColor(focused)]}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "relative",
    padding: 0,
    left: 16,
    right: 16,
    bottom: 28,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderTopColor: "transparent",
    shadowColor: COLORS.dark,
    shadowOffset: {
      height: 6,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIconContainer: {
    position: "absolute",
    top: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    width: 32,
    height: 32,
  },
  tabIconNew: {
    width: 28,
    height: 28,
  },
});

export default Tabs;
