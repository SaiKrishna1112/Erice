import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ScrollView,
	FlatList
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "./Assets/SVG/BackIcon";
import HeartIcon from "./Assets/SVG/HeartIcon";
import { GrocerySuggestedProducts } from "../Erice/Data/GrocerySuggestedProducts";
import { groceryData } from "./Data/GroceryData";
import SingleProductCard from "./productsDesign/SingleProductCard"
import Animated, {
	FadeInDown,
	FadeInLeft,
	FadeInRight,
} from "react-native-reanimated";

const GroceryProductDetails = () => {
	const { params } = useRoute();
	const { goBack } = useNavigation();
	const [isFav, setIsFav] = useState(false);
	const { navigate } = useNavigation();
	// console.log("params:", params.data);
	const data = params?.data;

	const renderItem = ({ item, index }) => {
		return (
				<Animated.View
						entering={FadeInDown.delay(index * 100)
								.duration(600)
								.springify()
								.damping(12)}
				>
						{/* <TouchableOpacity
								onPress={() => {
										navigate("GroceryProductDetail", { name: item.title,data: item });
								}}
						> */}
								<SingleProductCard item={item} />
						{/* </TouchableOpacity> */}
				</Animated.View>
		);
};

	return (
			<View style={styles.container}>
				<ScrollView>
					{/* header */}
					<View style={styles.greyBackground}>
							<SafeAreaView />
							{/* Header Icons */}
							<View style={styles.iconsContainer}>
									<Animated.View entering={FadeInLeft.delay(100).duration(400)}>
											{/* <TouchableOpacity onPress={() => goBack()} style={styles.iconBox}>
													<BackIcon />
											</TouchableOpacity> */}
									</Animated.View>
									<Animated.View entering={FadeInRight.delay(100).duration(400)} style={{alignSelf:"flex-end",marginRight:15}}>
											<TouchableOpacity
													onPress={() => setIsFav(!isFav)}
													style={styles.iconBox}
											>
													<HeartIcon isFav={isFav} />
											</TouchableOpacity>
									</Animated.View>
							</View>
							{/* Image */}
							<Animated.Image
									sharedTransitionTag={`${data.id}`}
									style={styles.image}
									source={data.thumbnail}
							/>
					</View>
					{/* body */}
					<View style={styles.bodyContainer}>
							<View style={styles.box}>
									<Animated.Text
											entering={FadeInLeft.delay(200).duration(500)}
											style={styles.title}
									>
											{data.title}
									</Animated.Text>
									<View style={styles.innerBox}>
											<Animated.Text
													entering={FadeInRight.delay(200).duration(500)}
													style={styles.price}
											>
													<Text style={styles.currency}>$</Text>
													{data.price}
											</Animated.Text>
											<Animated.Text
													entering={FadeInRight.delay(200).duration(500)}
													style={styles.rating}
											>
													⭐️{data.rating}{" "}
											</Animated.Text>
									</View>
							</View>

							{/* Description */}
							<Animated.Text
									entering={FadeInLeft.delay(200).duration(500)}
									style={styles.description}
							>
									{data.description}
							</Animated.Text>

						<Animated.Text
									entering={FadeInLeft.delay(200).duration(500)}
									style={styles.suggestedTitle}
							>
									Suggested Products
							</Animated.Text>
							{/* Products */}
				<FlatList
						data={groceryData}
						keyExtractor={(item) => `${item.id}`}
						renderItem={renderItem}
						contentContainerStyle={styles.contentContainerStyle}
						showsVerticalScrollIndicator={false}
				/>

							{/* <Animated.View entering={FadeInLeft.delay(200).duration(500)}>
									<TouchableOpacity style={styles.btn}>
											<Text style={styles.btnTitle}>Shop Now</Text>
									</TouchableOpacity>
							</Animated.View> */}

							{/* Suggested Products */}
							<Animated.Text
									entering={FadeInLeft.delay(200).duration(500)}
									style={styles.suggestedTitle}
							>
									Suggested Products
							</Animated.Text>
							<View style={styles.suggestedProductContainer}>
									{GrocerySuggestedProducts.map((value, index) => {
											return (
													<Animated.View
															entering={FadeInDown.delay(200).duration(600)}
															key={value.id.toString()}
													>
															<Image source={value.thumbnail} style={styles.suggestedImg} />
															<Text style={styles.suggestedProductTitle}>{value.title}</Text>
													</Animated.View>
											);
									})}
							</View>
					</View>
				</ScrollView>
			</View>
	);
};

export default GroceryProductDetails;

const styles = StyleSheet.create({
	container: {
			flex: 1,
			// marginTop:10
	},
	greyBackground: {
			height: 350,
			borderBottomLeftRadius: 50,
			borderBottomRightRadius: 50,
			backgroundColor: "lightgrey",
	},
	iconsContainer: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 10,
	},
	iconBox: {
			backgroundColor: "#fff",
			height: 35,
			width: 35,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 25,
			shadowColor: "#000",
			shadowOffset: {
					width: 0,
					height: 2,
			},
			shadowOpacity: 0.25,
			shadowRadius: 3.84,

			elevation: 5,
	},
	image: {
			height: 200,
			width: 350,
			resizeMode: "contain",
			alignSelf: "center",
	},
	bodyContainer: {
			paddingHorizontal: 20,
			paddingTop: 20,
			marginBottom:30
	},
	box: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
	},
	title: {
			fontSize: 24,
			color: "#000",
			fontWeight: "bold",
	},
	price: {
			fontSize: 24,
			color: "#000",
			fontWeight: "bold",
	},
	currency: {
			color: "#24a8af",
	},
	rating: {
			fontSize: 18,
			color: "#000",
	},
	innerBox: {
			alignItems: "center",
	},
	description: {
			fontSize: 16,
			color: "#000",
			marginVertical: 30,
	},
	btn: {
			backgroundColor: "#24a8af",
			width: "30%",
			padding: 10,
			alignItems: "center",
			borderRadius: 25,
	},
	btnTitle: {
			fontSize: 18,
			color: "#fff",
	},
	suggestedTitle: {
			fontSize: 24,
			color: "#000",
			fontWeight: "bold",
			marginTop: 20,
	},
	suggestedImg: {
			width: 100,
			height: 100,
			resizeMode: "contain",
			alignSelf: "center",
	},
	suggestedProductTitle: {
			fontSize: 16,
			color: "#000",
			fontWeight: "bold",
			textAlign: "center",
	},
	suggestedProductContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
	},
});
