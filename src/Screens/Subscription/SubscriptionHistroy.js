import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SubscriptionHistory = () => {
  const [subscriptionHistoryData, setSubscriptionHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubscriptionHistory();
  }, []);

  const getSubscriptionHistory = async () => {
    setLoading(true);
    const customer_id = await AsyncStorage.getItem('customer_id');
    const request = {
      params: { 'customer_id': customer_id },
      method: 'POST',
      action_url: 'customer/getsubscriptions',
    };

    try {
      const response = await fetch(request.action_url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.params),
      });
      const data = await response.json();

      if (data['subscriptions']) {
        setSubscriptionHistoryData(data['subscriptions']);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text><Text style={styles.label}>Txn Id:</Text> {item.transaction_id}</Text>
      <Text><Text style={styles.label}>Payment Status:</Text> {item.status}</Text>
      <Text><Text style={styles.label}>Amount:</Text> {item.amount}</Text>
      <Text><Text style={styles.label}>Get Amount:</Text> {item.get_amount}</Text>
      <Text><Text style={styles.label}>Limit Amount:</Text> {item.limit_amount}</Text>
      <Text><Text style={styles.label}>Date & Time:</Text> {new Date(item.date_time).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Subscription History</Text> */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={subscriptionHistoryData}
          renderItem={renderItem}
          keyExtractor={(item) => item.transaction_id}
          ListEmptyComponent={<Text style={styles.emptyText}>No Subscriptions found!</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 200,
    fontSize: 16,
  },
});

export default SubscriptionHistory;