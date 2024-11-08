import React from 'react';
import { Appbar, Menu } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
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

  const goBack = () => {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('userId'); 
    AsyncStorage.removeItem('organizationId')
    navigation.navigate("Login")
  }

  return (
    <Appbar.Header>
      {/* {back ?  */}
						{/* <Appbar.Action icon="menu" onPress={() =>navigation.dispatch(DrawerActions.toggleDrawer())} /> */}
						{/* <Appbar.BackAction onPress={navigation.goBack} /> */}
						 {/* : null} */}
      <Appbar.Content title={title} />
      {!back ? (
							<>
							{/* <Appbar.Action icon="magnify" onPress={() => {}} /> */}
        <Menu
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
        </Menu>
								</>
      ) : null}
    </Appbar.Header>
  );
}