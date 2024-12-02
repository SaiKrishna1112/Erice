import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { useSelector } from "react-redux";
import BASE_URL from "../../../Config";
const OfferScreen = () => {
    const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOffers();
  }, []);

  const getOffers = async () => {
    setLoading(true);
    try {
      // Updated API URL and headers
      const response = await axios.get(
        BASE_URL+'erice-service/coupons/getallcoupons',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      
      // Filter active offers based on status 1 (active)
      const activeOffers = response.data.filter(offer => offer.status === 1);
      setOffers(activeOffers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderOffer = ({ item }) => (
    <View style={styles.offerRow}>
      <Image source={require('../../../assets/tick.png')} style={styles.image} />
      <View style={styles.offerDetails}>
        {item.couponCode ? (
          <Text style={styles.offerCode}>
            OFFER CODE: <Text style={styles.offerCodeValue}>{item.couponCode}</Text>
          </Text>
        ) : null}
        <Text style={styles.offerDesc}>{item.couponDesc}</Text>
        <Text style={styles.offerDetailsText}>Start Date: {item.startDate}</Text>
        <Text style={styles.offerDetailsText}>End Date: {item.endDate}</Text>
        <Text style={styles.offerDetailsText}>Min Order: ₹{item.minOrder}</Text>
        <Text style={styles.offerDetailsText}>Max Discount: ₹{item.maxDiscount}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {/* Dynamic offers */}
      {offers.length > 0 ? (
        <FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={(item) => item.couponId.toString()}
        />
      ) : (
        <Text style={styles.noOffers}>No offers available!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 10,
  },
  offerRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  offerDetails: {
    flex: 1,
  },
  offerCode: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  offerCodeValue: {
    color: '#06a855',
    backgroundColor: '#f1f1f1',
    padding: 5,
  },
  offerDesc: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  offerDetailsText: {
    fontSize: 12,
    color: '#333',
  },
  noOffers: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#333',
  },
});

export default OfferScreen;