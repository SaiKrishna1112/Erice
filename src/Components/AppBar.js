import React from 'react';
import { Appbar, Menu } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import { Alert } from "react-native";
import { DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomNavigationBar({
  navigation,
  route,
  options,
  back,
		props
}) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const title = getHeaderTitle(options, route.name);

  console.log(title);
  

  const goBack = () => {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('userData')
    navigation.navigate("Login")
  }


  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userData");
              navigation.navigate("Login");
            } catch (error) {
              console.error("Error clearing user data:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Appbar.Header>
      {/* {back ?  */}
						{/* <Appbar.Action icon="menu" onPress={() =>navigation.dispatch(DrawerActions.toggleDrawer())} /> */}
						{/* <Appbar.BackAction onPress={navigation.goBack} /> */}
						 {/* : null} */}
      <Appbar.Content title={title} />
      {!back ? (
							<>
							<Appbar.Action icon="logout" onPress={() => {
          // AsyncStorage.removeItem("userData"); 
          // navigation.navigate("Login"); 
          handleLogout()
              }} />
     
        {/* <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action
              icon="account-circle"
              onPress={openMenu}
            />
          }>
          <Menu.Item
            onPress={() => {
              navigation.navigate("Profile"),
              closeMenu();
            }}
            title="Profile"
          />
          <Menu.Item
            onPress={() => {
              navigation.navigate('Login')
              closeMenu();
            }}
            title="Logout"
          />
        </Menu> */}
								</>
      ) : null}
    </Appbar.Header>
  );
}