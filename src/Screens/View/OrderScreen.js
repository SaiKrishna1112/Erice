import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
// import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [accessToken, setAccessToken] = useState(null);
  const navigation = useNavigation();
   const accessToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMyIsImlhdCI6MTczMTMwODYwNiwiZXhwIjoxNzMyMTcyNjA2fQ.5edNAnfhlAPuAtDLvfxBHeR6XKsmiGtWMiVJHlY6LKvH3hCRSQEghodAph0sN_ID8EMcd0Hkn8pijcmRQH0iZw"
  const customerId=4
  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`https://meta.oxyloans.com/api/erice-service/order/getAllOrders/${customerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data);
      
      if (response.data.status) {
        setOrders(response.data.data);
      } else {
        alert('No orders found!');
      }
    } catch (error) {
      console.error('Error fetching orders:', error.response ? error.response.data : error.message);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    
    getOrders();
  }, []);

  // Navigate to order details page
  const orderDetails = (order) => {
    navigation.navigate('orderdetails', { order_id: order.order_id });
  };

  // Render each order
  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderList} onPress={() => orderDetails(item)}>
      <View style={styles.imageContainer}>
        <Image source={require('../../../assets/tick.png')} style={styles.tickImage} />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.date}>{item.ordered_date}</Text>
        <Text style={styles.orderId}>Order Id: <Text>{item.order_id}</Text></Text>
        <Text style={styles.orderAmount}>Amount: Rs. {parseFloat(item.grand_total).toFixed(2)}</Text>
        <Text style={styles.paymentType}>
          Payment: {item.payment_type === 1 ? 'COD' : 'ONLINE'} 
          {item.payment_type === 2 && item.payment_status === 0 && <Text style={styles.paymentPending}> (Pending)</Text>}
        </Text>
        <Text style={styles.status}>Status: {item.orders_status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found!</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.order_id.toString()}
        />
      )}
      {/* <Footer navigation={navigation} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    textAlign: 'center',
    marginTop: 200,
    fontSize: 18,
    color: '#555',
  },
  orderList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: '#c3ead6',
    borderRadius: 7,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tickImage: {
    width: 40,
    height: 40,
  },
  orderInfo: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orderAmount: {
    fontSize: 13,
    marginVertical: 5,
  },
  paymentType: {
    fontSize: 15,
    color: '#06a855',
  },
  paymentPending: {
    color: 'red',
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default OrderScreen;