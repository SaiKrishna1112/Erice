import React,{useEffect,useState} from 'react'
import { View, Text ,StyleSheet,Image,TouchableOpacity} from 'react-native'
import  Icon  from 'react-native-vector-icons/FontAwesome'
import  Icon1  from 'react-native-vector-icons/FontAwesome5'
import  Icon2  from 'react-native-vector-icons/AntDesign'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FormData } from "formdata-node";
import { useSelector } from 'react-redux';
import {BASE_URL_9002,BASE_URL_9001,BASE_URL_9004,BASE_URL_9007, BASE_URL_9009} from "../../Config"
import BASE_URL from "../../Config"
import axios from 'axios';


const PaymentStatus = ({navigation,route}) => {
  console.log("==========")
  console.log(route);
  var details=route.params
  var paymentdetails=route.params.paymentdetails;
  var propertydetails=route.params.propertydetails;
  const accessToken = useSelector(state => state.counter);
  var token=accessToken.accessToken;
  var userId=accessToken.userId

  const[uploadtransactionfile,setuploadtransactionfile]=useState("UploadFile")
var errormsg;



  const uploadfile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      allowsEditing: false,
      aspect: [4, 4],
    })
      .then(response => {
        if (response.type == 'success') {
          let { name, size, uri } = response;

          // ------------------------/
          if (Platform.OS === "android" && uri[0] === "/") {
            uri = `file://${uri}`;
            console.log(uri);
            uri = uri.replace(/%/g, "%25");
            console.log(uri);
          }
          // ------------------------/

          let nameParts = name.split('.');
          let fileType = nameParts[nameParts.length - 1];
          var fileToUpload = {
            name: name,
            size: size,
            uri: uri,
            type: "application/" + fileType
          };
        //  console.log("=============")
          console.log(fileToUpload.name, '...............file')
          fd.append("file", fileToUpload);
          fd.append('id',userId);
          fd.append('fileType',"investment")
          fd.append('propertyId',propertyId)
        //  console.log(fd)
          axios({
            method: 'post',
            url: BASE_URL+'upload-service/oxyBricks-upload',
            data: fd,
            headers: {
              "Authorization":`Bearer ${token}`
            }
          })
            .then(function (response) {
             //  console.log(response);
              uploadsuccess();
            })
            .catch(function (error) {
              errormsg=error.response.data.error;
              error1();
            });
            setuploadtransactionfile(fileToUpload.name);
        }
      })
      .catch(function(error){
        errormsg=error.response.data.error;
        error1();
      })
  }


  



  function uploadsuccess() {
    return (

      Popup.show({
        type: 'Success',
        title: 'Success',
        button: true,
        textBody: 'Successfully Uploaded Your File',
        buttontext: 'Ok',                                 
        callback: () => Popup.hide(),

      })
    );
  }


  function error1() {
    return (

      Popup.show({
        type: 'Danger',
        title: 'SORRY',
        button: true,
        textBody: errormsg,
        buttontext: 'Ok',
        callback: () => Popup.hide(),

      })
    )
  }





  return (
    <View style={{flex:1,justifyContent:"center"}}>

              <View style={styles.header}>
                {paymentdetails.paymentStatus=="SUCCESS"?
                  <View style={{alignItems:"center"}}>
                    <View>  
                    <Image source={require("../../assets/gif/Success.gif")} style={{height:100,width:100,marginTop:10,borderRadius:100}}/>
                    </View>
                    <Text style={{fontSize:17,fontWeight:"bold",alignSelf:"center"}}>Payment <Text style={{color:"green"}}>{paymentdetails.paymentStatus}</Text></Text>
                  </View>
                  :null}
                  {paymentdetails.paymentStatus=="PENDING"?
                  <View style={{alignItems:"center"}}>
                    <View>  
                    <Image source={require("../../assets/gif/Pending.gif")} style={{height:100,width:100,marginTop:10,borderRadius:100}}/>
                    </View>
                    <Text style={{fontSize:17,fontWeight:"bold",alignSelf:"center"}}>Payment <Text style={{color:"Orange"}}>{paymentdetails.paymentStatus}</Text></Text>
                  </View>
                  :null}

                  {paymentdetails.paymentStatus=="FAILURE"?
                  <View style={{alignItems:"center"}}>
                    <View>  
                    <Image source={require("../../assets/gif/Failed.gif")} style={{height:100,width:100,marginTop:10,borderRadius:100}}/>
                    </View>
                    <Text style={{fontSize:17,fontWeight:"bold",alignSelf:"center"}}>Payment <Text style={{color:"red"}}>FAILED</Text></Text>
                  </View>
                  :null}

              </View>


            <View style={styles.header1}>

              <View style={styles.main}>
                <View style={{alignSelf:"flex-start",width:200}}>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>Property Name  </Text>
                </View>
                <View style={{alignSelf:"flex-end",width:150}}>
                  <Text style={{fontSize:15,color: "black",fontWeight:"600",alignSelf:"flex-end"}}>{propertydetails.assetAddress}</Text>
                </View>
              </View>

              <View style={styles.main}>
                <View style={{alignSelf:"flex-start",width:200}}>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>Transaction Id  </Text>
                </View>
                <View style={{alignSelf:"flex-end",width:150}}>
                  <Text style={{fontSize:15,color: "black",fontWeight:"600",alignSelf:"flex-end"}}>{paymentdetails.merchantOrderNo}</Text>
                </View>
              </View>

              <View style={styles.main}>
                <View style={{alignSelf:"flex-start",width:200}}>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>ROI  </Text>
                </View>
                <View style={{alignSelf:"flex-end",width:150}}>
                  <Text style={{fontSize:15,color: "black",fontWeight:"600",alignSelf:"flex-end"}}> {details.roi} <Icon1 name="percentage" size={15} style={{fontWeight:"bold"}}/></Text>
                </View>
              </View>

              <View style={styles.main}>                
              <View style={{alignSelf:"flex-start",width:200}}>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>Processing Fee </Text>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>(1% + 18% GST)</Text>

                </View>
                <View style={{alignSelf:"flex-end",width:150}}>
                  <Text style={{fontSize:15,color: "black",fontWeight:"600",alignSelf:"flex-end"}}><Icon name="rupee" size={15} style={{fontWeight:"bold"}}/> {paymentdetails.txnAmount} </Text>
                </View>
              </View>

              <View style={styles.borderstyle}/>
              <View style={styles.main}>
                <View style={{alignSelf:"flex-start",width:200}}>
                  <Text style={{fontSize:15,color: "#464B8B",fontWeight:"600"}}>Invested Amount </Text>
                </View>
                <View style={{alignSelf:"flex-end",width:150}}>
                  <Text style={{fontSize:15,color: "black",fontWeight:"600",alignSelf:"flex-end"}}><Icon name="rupee" size={15} style={{fontWeight:"bold"}}/> {details.investedAmount} </Text>
                </View>
              </View>

            </View>
          
            {/* {paymentdetails.paymentStatus=="SUCCESS"? 
            <TouchableOpacity style={styles.header2} onPress={uploadfile}>
                <View>
                  <Icon name="upload" size={25} color="white"style={{fontWeight:"bold"}}/>
                </View>
                <View>
                  <Text style={{color:"white",fontWeight:"bold"}}> Upload Your Investment Reciept</Text>
                </View>
            </TouchableOpacity>
            :null} */}
            <TouchableOpacity style={styles.header2} onPress={()=>navigation.navigate("Property-Details")}>
                <View>
                  <Icon2 name="back" size={25} color="white"style={{fontWeight:"bold"}}/>
                </View>
                <View>
                  <Text style={{color:"white",fontWeight:"bold"}}> Go Back</Text>
                </View>
            </TouchableOpacity>
           
    </View>
  )
}

export default PaymentStatus;

const styles=StyleSheet.create({
  header:{
    backgroundColor:"white",
    paddingVertical:12,
    marginBottom:20,
    marginHorizontal:30,
    borderRadius:22,
    height:"auto",
    shadowColor: '#171717',
    elevation:3
  },
  header1:{
    backgroundColor:"white",
    paddingVertical:20,
    marginBottom:20,
    marginHorizontal:20,
    borderRadius:22,
    height:"auto",
    alignContent:"center",
    shadowColor: '#171717',
    elevation:2
  },
  header2:{
    backgroundColor:"#464B8B",
    paddingVertical:10,
    marginHorizontal:20,
    borderRadius:15,
    height:"auto",
    width:"auto",
    flexDirection:"row",
    justifyContent:"center",
    marginBottom:30,
 
  },
  borderstyle:{
    borderStyle:"dashed",
    borderColor:"#c0c0c0",
    borderWidth:0.6,
    marginVertical:30,
    marginHorizontal:20
  },
  main:{
    flexDirection:"row",
    justifyContent:"space-around",
    marginBottom:10,
    marginHorizontal:50
  },


})
