import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CartView = ({ items }) => {
  return (
    <View style={styles.cartContainer}>
      <Text style={styles.cartTitle}>Shopping Cart</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.cartItem}>
          <Text>{item.name}</Text>
          <Text>${item.price.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cartContainer: {
    padding: 16,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default CartView;