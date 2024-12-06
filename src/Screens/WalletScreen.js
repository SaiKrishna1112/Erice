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
      
      setWalletAmount(walletAmount);
      setWalletTxs(walletTransactions);
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
          keyExtractor={(item) => item.wallet_tx_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <Text style={styles.txId}>TX ID: TX-{item.wallet_tx_id}</Text>
              <Text style={styles.txDesc}>{item.wallet_tx_desc}</Text>
              <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString()}</Text>
              <Text
                style={[
                  styles.txAmount,
                  item.wallet_tx_type === 1 ? styles.credit : styles.debit
                ]}
              >
                {item.wallet_tx_type === 1 ? '+' : '-'} ₹ {item.wallet_tx_amount}
              </Text>
              <Text style={styles.txBalance}>Balance: ₹ {item.wallet_tx_balance}</Text>
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
    textTransform: 'capitalize',
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
  }
});

export default WalletPage;
