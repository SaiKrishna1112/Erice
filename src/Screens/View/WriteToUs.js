import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ToastAndroid,
  Platform,
  ActivityIndicator,
  Dimensions,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useState,useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import BASE_URL from "../../../Config";
import * as DocumentPicker from "expo-document-picker";
import { FormData } from "formdata-node";
import Icon from "react-native-vector-icons/Ionicons"

const{height,width}=Dimensions.get('window')

const WriteToUs = ({navigation,route}) => {
    const accessToken = useSelector((state) => state.counter);
    const fd = new FormData();
    const [ticketId,setTicketId] = useState("")

    useEffect(()=>{
      console.log("route",route.params);
      
       if(route.params!="" || route.params!=undefined || route.params!=null){
         setTicketId(route.params.ticketId)
      }
      else{
        setTicketId('')
      }
    },[])


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "", 
    query: "",
    fileName: "",
    documentId: "",
    uploadStatus:''
  });

  // Validation and Submit Handler


  useEffect(() => {
    getProfileDetails()
  },[])
  function getProfileDetails() {
    axios.get(BASE_URL + `erice-service/user/customerProfileDetails?customerId=${accessToken.userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
    }
    })
    .then(function (response) {
      console.log(response.data);
      setFormData({
        ...formData, name: response.data.name,
                    email: response.data.email,
                    mobileNumber: response.data.mobileNumber
      });
    })
    .catch(function (error) {
      console.log(error.response);
    });
  }


  

  const handleSubmit = () => {
    if (formData.name == null) {
      navigation.navighate('Profile Screen')
    }

    else {
      const { name, email, mobileNumber, query } = formData;

      // Validation
      if (!name || !email || !mobileNumber || !query) {
        Alert.alert("Error", "All fields are required!");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        Alert.alert("Error", "Invalid email format!");
        return;
      }
      if (!/^\d{10}$/.test(mobileNumber)) {
        Alert.alert("Error", "Mobile number must be 10 digits!");
        return;
      }

      // Success
      // Alert.alert("Success", "Your query has been submitted!");
      // console.log(formData);

      let data =
      {
        "adminDocumentId": "",
        "comments": "",
        "email": formData.email,
        "id": '',
        "mobileNumber": formData.mobileNumber,
        "projectType": "OXYRICE",
        "query": formData.query,
        "queryStatus": "PENDING",
        "resolvedBy": "",
        "resolvedOn": "",
        "status": "",
        "userDocumentId": "",
        "userId": accessToken.userId
      }
 console.log({data})
      // axios.post(BASE_URL + `erice-service/writetous/saveData`, data, {
      //   headers: {
      //     Authorization: `Bearer ${accessToken.accessToken}`,
      //   },
      // })
      //   .then(function (response) {
      //     console.log(response.data)
      //     Alert.alert("Success", "Your query has been submitted!");
      //   })
      //   .catch(function (error) {
      //     console.log(error.response)
      //     Alert.alert("Failed", error.response.data.message)
      //   })


    }
  };




  const handleFileChange = async () => {
    // console.log("Pan");
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      allowsEditing: false,
      aspect: [4, 4],
    })
      .then((response) => {
        console.log("response",response);
        if (response.canceled == false) {
          let { name, size, uri } = response.assets[0];
          // console.log();
          // ------------------------/

          if (Platform.OS === "android" && uri[0] === "/") {

            uri = `file://${uri}`;
            console.log(uri);
            uri = uri.replace(/%/g, "%25");
            console.log(uri);
          }
          // ------------------------/
          let nameParts = name.split(".");
          let fileType = nameParts[nameParts.length - 1];
          var fileToUpload = {
            name: name,
            size: size,
            uri: uri,
            type: "application/" + fileType,
          };
          console.log(fileToUpload.name, "...............file");
          fd.append("multiPart", fileToUpload);
          fd.append("fileType", "kyc");
          console.log(fileToUpload);

          console.log(fd);
          // setLoading(trrue);
          axios({
            method: "post",
            url:`https://meta.oxyloans.com/api/common-upload-service/uploadQueryScreenShot?userId=${accessToken.userId}`,
            data: fd,
            headers: {
              accessToken: `Bearer ${accessToken.accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          })
            .then(function (response) {
               console.log(response.data);
               Alert.alert("Successfully Uploaded")
              // setLoading(false);
              // setmodal1(true);
              // getpan();
            })
            .catch(function (error) {
              // setLoading(false);
              console.log(error.response.data);
              Alert.alert(error.response.data.error);
          //     if (error.response.data.errorCode == 100) {
          //       setmodal3(true);
          //     } else {
          //       setmodal2(true);
          //     }
            });
          // setPanPicurl(fileToUpload.uri);
        }
      })
      .catch(function (error) {});
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>

<TouchableOpacity onPress={()=>navigation.navigate('Ticket History')}>
  <Text>Ticket History</Text>
</TouchableOpacity>


      <Text style={styles.header}>Write a Query</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        value={formData.mobileNumber}
        onChangeText={(text) =>
          setFormData({ ...formData, mobileNumber: text })
        }
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter Your Query"
        multiline
        value={formData.query}
        onChangeText={(text) => setFormData({ ...formData, query: text })}
      />

      <TouchableOpacity style={styles.box} onPress={handleFileChange}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Icon name="cloud-upload" size={50} color="gray" />
          <Text>Upload a file</Text>
          {formData.fileName != null ? (
            <Text>{formData.documentId}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <Button title="Submit" onPress={handleSubmit} />

      {/* <View style={{ padding: 20 }}>
        <Text>Upload a file</Text>
        <Button title="Select and Upload File" onPress={handleFileChange} />
        {formData.uploadStatus === "loading" && (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
        {formData.fileName ? (
          <Text>Selected File: {formData.fileName}</Text>
        ) : null}
        {formData.uploadStatus === "uploaded" ? (
          <Text>Upload Successful! Document ID: {formData.documentId}</Text>
        ) : null}
      </View> */}
    </View>
  );
};

export default WriteToUs;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: width * 0.9,
    alignSelf:"center"
  },
  box: {
    textDecorationStyle: "dashed",
    // textDecorationLine:"underline",
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: width * 0.9,
    height: 100,
    alignSelf:"center"
    
  }
});
