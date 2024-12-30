import React,{useEffect,useState} from 'react';
import { FAB } from 'react-native-paper';
import { View, StyleSheet ,Share} from 'react-native';
import { useSelector } from "react-redux";
import { useNavigation } from '@react-navigation/native';

import axios from 'axios';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 

const ShareLinks = () => {

    const userData = useSelector((state) => state.counter);
    const token = userData.accessToken;
    const customerId = userData.userId;
    const navigation = useNavigation();

  const [state, setState] = React.useState({ open: false });
  const[link,setLink]=useState("")

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  const dynamicTheme = {
    colors: {
      background: open ? 'lightgreen' : 'white', // Change to light green when open, white when closed
    },
  };


  useEffect(() => {
    shareappfunc()
  }, [])

const shareappfunc=()=>{
  axios({
    method:"post",
    url:"https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyAhswHjErl21VTWHA-sV5wqFz79kr83O8g",
    data:{
      "dynamicLinkInfo": {
					"domainUriPrefix": "https://oxyrice.page.link",
					"link": `https://www.oxyrice.in?ref=${customerId}`,
					"androidInfo": {
						"androidPackageName": "com.oxyrice.oxyrice_customer"
					},
                    "iosInfo": {
                      "iosBundleId": "com.oxyrice.customer" 
                     }
				}
    }
  })
  .then((response)=>{
    console.log(response.data)
    setLink(response.data.shortLink)
  })
  .catch((error)=>{
    console.log(error)
  })
}




  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          `Check out this amazing app: ${link}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing the link:', error.message);
    }
  };



  return (
    // <View style={[styles.container, { backgroundColor: open ? 'lightgreen' : 'white' }]}>

        <FAB.Group 
        color="white"
        backdropColor='white'
        fabStyle={{ backgroundColor: '#5DBB63', marginTop:5}} 
        // accessibilityLabel={{backgroundColor:"#5DBB63"}}
          open={open}
          visible
          icon={open ? 'close' : 'plus'}
          actions={[
            {
              // labelStyle:{backgroundColor:"green"},
              icon: 'share',
              color:"#5DBB63",
              label: 'share',
              onPress: () => handleShare(),
            },
            {
              icon: (props) => (
                <MaterialIcons {...props} name="support-agent" color="#5DBB63"/> // Custom MaterialIcons
              ),
              label: 'Support',
              onPress: () => navigation.navigate('Write To Us'),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
        // </View>
  );
};





export default ShareLinks

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green', // Default background color
  },
});