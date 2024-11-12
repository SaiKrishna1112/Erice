import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
// stack screen imports
import StacksScreens from "./src/Navigations/StacksScreens";
// import { registerRootComponent } from "expo";

export default function App() {
  return (
    <PaperProvider>
    <NavigationContainer>
      <StacksScreens/>
      <StatusBar style="auto" />
    </NavigationContainer>
    </PaperProvider>
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
