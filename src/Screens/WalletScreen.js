import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import BASE_URL from "../../Config";

const WalletPage = ({route}) => {
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  console.log("wallet",route.params)
  const customerId = userData.userId;
  const [walletTxs, setWalletTxs] = useState([]);
  const [walletAmount, setWalletAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();


  // if (loading) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }





  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {/* <Ionicons name="arrow-back" size={24} color="black" onPress={() => navigation.goBack()} /> */}
        <Text style={styles.title}>WALLET BALANCE: ₹ {walletAmount}</Text>
      </View>

      {/* {walletTxs.length > 0 ? (
        <FlatList
          data={walletTxs}
          keyExtractor={(item) => item.wallet_tx_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.txId}>TX ID: TX-{item.wallet_tx_id}</Text>
              <Text style={styles.txDesc}>{item.wallet_tx_desc}</Text>
              <Text>{new Date(item.created_at).toLocaleString()}</Text>
              <Text
                style={[
                  styles.txAmount,
                  item.wallet_tx_type === 1 ? styles.credit : styles.debit
                ]}
              >
                {item.wallet_tx_type === 1 ? '+' : '-'} {item.wallet_tx_amount}
              </Text>
              <Text>Balance: {item.wallet_tx_balance}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noTransactions}>No transactions found!</Text>
      )} */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  txId: {
    fontWeight: 'bold',
  },
  txDesc: {
    textTransform: 'capitalize',
  },
  txAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  credit: {
    color: 'darkgreen',
  },
  debit: {
    color: 'red',
  },
  noTransactions: {
    textAlign: 'center',
    marginTop: 200,
    fontSize: 18,
  },
});

export default WalletPage;