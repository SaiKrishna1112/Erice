import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
export function logout(navigation) {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('userId'); 
    AsyncStorage.removeItem('organizationId')
    navigation.navigate("Login")
  }
  