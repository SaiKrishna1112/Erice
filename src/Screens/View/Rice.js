import { StyleSheet, Text, View,SafeAreaView,FlatList,TouchableOpacity } from 'react-native'
import React,{useState,useEffect} from 'react'
import ProductCard from "../../Components/productsDesign/ProductCard";
import { riceData } from "../../../Data/RiceData";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const Rice = () => {
	const { navigate } = useNavigation();


	const renderItem = ({ item, index }) => {
		return (
				<Animated.View
						entering={FadeInDown.delay(index * 100)
								.duration(600)
								.springify()
								.damping(12)}
				>
						<TouchableOpacity
								onPress={() => {
										navigate("RiceProductDetail", { name: item.title,data: item });
								}}
						>
								<ProductCard item={item} />
						</TouchableOpacity>
				</Animated.View>
		);
};

return (
		<View style={styles.container}>
				<SafeAreaView />

				{/* Products */}
				<FlatList
						data={riceData}
						keyExtractor={(item) => `${item.id}`}
						renderItem={renderItem}
						numColumns={2}
						contentContainerStyle={styles.contentContainerStyle}
						showsVerticalScrollIndicator={false}
				/>
		</View>
);
}

export default Rice

const styles = StyleSheet.create({
	container: {
		// flex: 2,
		// marginBottom:120
},
contentContainerStyle: {
		alignItems: "center",
},
})