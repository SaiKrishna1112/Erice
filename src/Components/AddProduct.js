import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AddProduct = ({ name, price, onAddToCart }) => {
  return (
    <View style={styles.productContainer}>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddProduct;