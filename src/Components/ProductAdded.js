import React, { useState,useEffect } from 'react';
import { View, Text, Button, StyleSheet,FlatList } from 'react-native';

const ProductAdded = () => {

	const [cartItems, setCartItems] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);

	useEffect(() => {
			// Calculate total amount whenever cartItems change
			calculateTotalAmount();
	}, [cartItems]);

	const calculateTotalAmount = () => {
			const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
			setTotalAmount(total);
	};

	const addItemToCart = (item) => {
			// Check if item is already in the cart
			const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

			if (existingItem) {
					// If item exists, update quantity
					setCartItems((prevItems) =>
							prevItems.map((cartItem) =>
									cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
							)
					);
			} else {
					// If item doesn't exist, add to cart
					setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
			}
	};

	const removeItemToCart = (item) => {
		// Check if item is already in the cart
		const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

		if (existingItem) {
				// If item exists, update quantity
				setCartItems((prevItems) =>
						prevItems.map((cartItem) =>
								cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
						)
				);
		} else {
				// If item doesn't exist, add to cart
				setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
		}
};

	const removeItemFromCart = (itemId) => {
			setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
	};

	return (
			<View>
					<Text>Total Amount: ${totalAmount.toFixed(2)}</Text>
					<FlatList
							data={cartItems}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
									<View>
											<Text>{item.name}</Text>
											<Text>Price: ${item.price.toFixed(2)}</Text>
											<Text>Quantity: {item.quantity}</Text>
											{item.quantity!=0?(
												<View>
											<Button title="Remove Item 1" onPress={() => removeItemToCart({ id: 1, name: 'Item 1', price: 10 })} />
											<Button title="Remove" onPress={() => removeItemFromCart(item.id)} />
											</View>
											):null}
									</View>
							)}
					/>
					<Button title="Add Item 1" onPress={() => addItemToCart({ id: 1, name: 'Item 1', price: 10 })} />
					{/* Add buttons for other items as needed */}
					
			</View>
	);
};

export default ProductAdded;