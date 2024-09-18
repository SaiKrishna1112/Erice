import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import Animated from "react-native-reanimated";

const SingleProductCard = (props) => {
  const { item } = props;
  return (
    <View style={styles.mainBox}>
					<View style={{flexDirection:"row",width:300}}>
						<View style={{width:110}}>
      <Animated.Image
        sharedTransitionTag={`T${item.id}`}
        style={styles.image}
        source={item.thumbnail}
      />
						</View>
						<View>
							
						<Text style={styles.title}>{item.title}</Text>
						<View style={{flexDirection:"row"}}>
      <Text style={styles.price}>
        <Text style={styles.currency}>₹</Text>
        {item.price}/- 
      </Text>
						<Text style={styles.priceStrike}>
        <Text style={styles.currency}> MRP:₹</Text>
        {item.mrp}/-
      </Text>
						</View>
						<Text style={styles.price}>{item.weight}Kg</Text>
      </View>
						</View>
									{/* <TouchableOpacity style={styles.btn}>
											<Text style={styles.btnTitle}>Buy Now</Text>
									</TouchableOpacity> */}
    </View>
  );
};

export default SingleProductCard;

const styles = StyleSheet.create({
  mainBox: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    margin: 5,
				borderRadius: 8,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.3,
				shadowRadius: 4,
				elevation: 6,
				backgroundColor:"#ffff"
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  price: {
    fontSize: 18,
    color: "#323232",
    fontWeight: "600",
				marginRight:10
  },
		priceStrike: {
			fontSize: 18,
			color: "#323232",
			fontWeight: "600",
			textDecorationLine: 'line-through',
			textDecorationStyle: 'double',
			textDecorationColor: '#FF0000',
	},
  currency: {
    color: "#24a8af",
  },
  title: {
    fontSize: 18,
    color: "#323232",
    fontWeight: "bold",
  },
		btn: {
			backgroundColor: "#24a8af",
			width: "30%",
			padding: 8,
			alignItems: "center",
			borderRadius: 10,
	},
	btnTitle: {
			fontSize: 18,
			color: "#fff",
	},
});
