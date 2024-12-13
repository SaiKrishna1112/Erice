import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import BASE_URL from '../../Config';

const WalletPage = ({ route }) => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;

  const [walletTxs, setWalletTxs] = useState([]);
  const [walletAmount, setWalletAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    setLoading(true)
    const data = { customerId: customerId};
    try {
      const response = await axios.post(
        BASE_URL + 'erice-service/wallet/customerWalletData',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { walletAmount, walletTransactions } = response.data;
      console.log(response.data);
      setLoading(false)
      setWalletAmount(walletAmount);
      setWalletTxs(walletTransactions);
      console.log("wallet transactions",walletTxs);
      
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
  <View style={styles.header}>
    <Text style={styles.walletTitle}>Wallet Balance</Text>
    <Text style={styles.walletAmount}>₹ {walletAmount}</Text>
  </View>
</View>

{walletTxs.length > 0 ? (
  <FlatList
    data={walletTxs}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.transactionCard}>
        {/* Wallet Transaction Amount */}
        <Text style={styles.txAmount}>
          Amount: ₹ {item.walletTxAmount}
        </Text>

        {/* Order ID */}
        <Text style={styles.txOrder}>
          Order ID: {item.orderId}
        </Text>

        {/* Wallet Transaction Description */}
        <Text style={styles.txDesc}>
          Description: {item.walletTxDesc.split('Order ID:')[0].trim()}
        </Text>

        {/* Transaction Date */}
        <Text style={styles.txDate}>
          Date: {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {/* Wallet Balance */}
        <Text style={styles.txBalance}>
          Balance: ₹ {item.walletTxBalance}
        </Text>
      </View>
    )}
  />
) : (
  <Text style={styles.noTransactions}>No transactions found!</Text>
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fd7e14', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f7f7f7'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  txId: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  txDesc: {
    textTransform: 'bold',
    marginBottom: 4,
    color: '#555'
  },
  txDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8
  },
  txAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'right'
  },
  credit: {
    color: 'green'
  },
  debit: {
    color: 'red'
  },
  txBalance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  noTransactions: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 50
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#000',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  txOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  txDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  txBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  noTransactions: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WalletPage;
