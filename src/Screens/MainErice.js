import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import Rice from './View/Rice'
import Grocery from './View/Grocery'


const MainErice = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabPress = (index) => {
    setActiveTab(index);
  };



  return (
    <View>
      {/* <View style={styles.container}>
        <Pressable
          style={[styles.buttonRice,activeTab === 0 ? styles.activeTabButton : styles.tabButton]}
          onPress={() => handleTabPress(0)}>
          <Text style={{textAlign:"center",fontSize:16,fontWeight:"bold"}}>Rice</Text>
        </Pressable>

        <Pressable
          style={[styles.buttonGrocery,activeTab === 1 ? styles.activeTabButton : styles.tabButton]}
          onPress={() => handleTabPress(1)}>
          <Text style={{textAlign:"center",fontSize:16,fontWeight:"bold"}}>Grocery</Text>
        </Pressable>
      </View> */}

      <View>
        {activeTab === 0 && <Rice />}
        {/* {activeTab === 1 && <Grocery />} */}
      </View>
    </View>
  );
};

export default MainErice;

const styles = StyleSheet.create({
	container: {
			flexDirection: 'row',
			justifyContent: 'center',
			// elevation: 2,
			padding: 10,
	},
	tabButton: {
			padding: 10,
			borderWidth: 2,
			borderColor: '#ccc',
	},
	activeTabButton: {
			backgroundColor: '#007bff',
	},
	buttonRice:{
			color: '#fff',
			padding:10,
			width:150,
			borderBottomLeftRadius:10,
			borderTopLeftRadius:10,
	},
		buttonGrocery:{
			color: '#fff',
			padding:10,
			width:150,
			borderBottomRightRadius:10,
			borderTopRightRadius:10,
	}, 
	button:{
			color: '#fff',
			padding:10,
			width:100,
			textAlign:'center'
	},
});

