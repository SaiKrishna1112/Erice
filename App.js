import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { Provider } from 'react-redux';
import allReducers from './Redux/reducers';
import { createStore } from 'redux';
import { LogBox, Image } from "react-native";


// stack screen imports
import StacksScreens from "./src/Navigations/StacksScreens";
// import { registerRootComponent } from "expo";


LogBox.ignoreLogs(['EventEmitter.removeListener', 'ViewPropTypes', 'VirtualizedList', 'Warnings']);
const store = createStore(
  allReducers
);


export default function App() {

  


  return (
    <Provider store={store}>

    <PaperProvider>
    <NavigationContainer>
      <StacksScreens/>
      <StatusBar style="auto" />
    </NavigationContainer>
    </PaperProvider>
    </Provider>
    // <View style={styles.container}>
    //   <Text>hai</Text>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
