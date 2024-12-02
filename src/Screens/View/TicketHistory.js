import { View, Text, Alert, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../../Config';
import { TouchableOpacity } from 'react-native';

const TicketHistory = ({navigation}) => {
  const [queryStatus, setQueryStatus] = useState('PENDING');
  const [tickets, setTickets] = useState([]);
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  var ticketId

  useEffect(()=>{
    fetchTickets()
  },[queryStatus])

  const fetchTickets = (status) => {
    axios
      .post(
        BASE_URL+`erice-service/writetous/getQueries`,
        { queryStatus: status, userId: customerId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
     
      
      .then((response) => {
        setTickets(response.data);
        console.log("sravani tickets",response.data);
        
    })
      .catch((error) =>
        Alert.alert('Error', error.response?.data?.message || 'Something went wrong')
      );
  };

  const data = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ticket History</Text>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        // placeholder="Select status"
        value={queryStatus}
        onChange={(item) => {
          setQueryStatus(item.value);
          fetchTickets(item.value);
        }}
      />
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* <View style={styles.row}>
              <Text style={styles.label}>MobileNumber</Text>
              <Text style={styles.value}>{item.mobileNumber}</Text>
            </View> */}
            <View style={styles.row}>
              <Text style={styles.label}>Query</Text>
              <Text style={styles.value}>{item.query}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ticket Id</Text>
              <Text style={styles.value}>{item.randomTicketId}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Created On</Text>
                <Text style={styles.value}>{item.createdAt.split(' ')[0]}</Text> 
           </View>
           <View style={styles.row}>
            <TouchableOpacity style={styles.replybtn} onPress={()=>{navigation.navigate('Write To Us',{ticketId:item.id})}}>
              <Text>Write a reply</Text>
            </TouchableOpacity>
               
           </View>
            
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tickets available.</Text>}
      />
    </View>
  );
};

export default TicketHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    padding: 10,
    width: '50%',
    marginLeft:190
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    bottomBorderColor:"black",
    borderBottomWidth:0.5,
    margin:5
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
  replybtn:{
    backgroundColor:"orange",
    padding:10,
    margin:10
    
  }
});
