import {
  View,
  Text,
  Alert,
  StyleSheet,
  FlatList,
  Modal,
  Linking,
  Image,
  ActivityIndicator,
  Button,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../../Config";
import { TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const {height,width}=Dimensions.get('window')

const TicketHistory = ({ navigation }) => {
  const [queryStatus, setQueryStatus] = useState("PENDING");
  const [tickets, setTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState();
  const [query, setQuery] = useState();
  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  // console.log({ token });
  const customerId = userData.userId;
  const [removeModal, setRemoveModal] = useState(false);
  const [comments, setComments] = useState();
  const [comments_error, setComments_error] = useState(false)
  // const[details,setDetails]=useState('')
  useEffect(() => {
    fetchTickets();
  }, [queryStatus]);

  const fetchTickets = () => {
    setLoading(true);
    axios
      .post(
        BASE_URL + `erice-service/writetous/getQueries`,
        { queryStatus: queryStatus, userId: customerId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        // console.log("getQueries",response.data)
        setTickets(response.data);

        setLoading(false);
      })
      .catch((error) => {
        console.log(error.response);
        setLoading(false);
      });
  };

  const data = [
    { label: "Pending", value: "PENDING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const cancelTicket = (ticketId, query) => {
    setTicketId(ticketId);
    setQuery(query)
console.log({query})
    setRemoveModal(true);
    console.log("Cancelled id and query:", ticketId, query);
  };

  const cancelTicketConfirm = (ticketId, query) => {
    if(comments=="" || comments==null){
      setComments_error(true)
      return false
    }
    const data = {
      adminDocumentId: "",
      comments: comments,
      email: "",
      id: ticketId,
      mobileNumber: "",
      projectType: "OXYRICE",
      query: query,
      queryStatus: "CANCELLED",
      resolvedBy: "customer",
      resolvedOn: "",
      status: "",
      userDocumentId: "",
      userId: customerId,
    };

    console.log(data.comments);
    axios
      .post(BASE_URL + `erice-service/writetous/saveData`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Sravani", response.data);
        setComments("");
        setRemoveModal(false);
      });

    fetchTickets();
  };
  const openFile = (url) => {
    const fileExtension = url.split(".").pop().toLowerCase();
    console.log(url);

    if (["jpeg", "jpg", "png"].includes(fileExtension)) {
      setModalVisible(true);
      setFileUrl(url);
    } else if (fileExtension === "pdf") {
      Linking.openURL(filePath);
    } else {
      alert("Unsupported file format.");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Ticket History</Text> */}
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
          setTickets([]);
        }}
      />

      {loading == false ? (
        <>
          {tickets && tickets.length > 0 ? (
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
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{item.name}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Ticket Id</Text>
                    <Text style={styles.value}>{item.randomTicketId}</Text>
                  </View>
                  {/*                 
                  <View style={styles.row}>
                    <Text style={styles.label}>Created On</Text>
                    <Text style={styles.value}>
                      {item.createdAt.split(" ")[0]}
                    </Text>
                  </View> */}

                  <View style={styles.row}>
                    <View>
                      <Text style={styles.label}>Query </Text>
                    </View>

                    <View>
                      <Text style={styles.value}>{item.query}</Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View>
                      <Text style={styles.label}>Created On</Text>
                    </View>
                    <View>
                      <Text style={styles.value}>
                        {item?.createdAt?.substring(0, 10)}
                      </Text>
                    </View>
                  </View>

                  {queryStatus === "CANCELLED" ? (
                    <>
                      <View style={styles.row1}>
                        <View>
                          <Text style={styles.label}>Reason </Text>
                        </View>
                        <View>
                          <Text style={styles.value}>{item.comments}</Text>
                        </View>
                      </View>

                      <View style={styles.row1}>
                        <View>
                          <Text style={styles.label}>Resolved</Text>
                        </View>
                        <View>
                          <Text style={styles.value}>
                            {item?.resolvedOn?.substring(0, 10)}
                          </Text>
                        </View>
                      </View>
                    </>
                 ) : null} 

                  {item.userQueryDocumentStatus?.fileName != null ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>File</Text>
                      <TouchableOpacity
                        onPress={() =>
                          openFile(item.userQueryDocumentStatus?.filePath)
                        }
                      >
                        <Text style={styles.value1}>
                          {item.userQueryDocumentStatus?.fileName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.row1}>
                    {queryStatus === "PENDING" ? (
                      <>
                        <TouchableOpacity
                          style={styles.replybtn}
                          onPress={() => {
                            navigation.navigate("Write To Us", {
                              ticketId: item.id,
                              query: item.query,
                            });
                          }}
                        >
                          <Text>Write a reply</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelbtn}
                          onPress={() => cancelTicket(item.id, item.query)}
                        >
                          <Text style={{ color: "white" }}>Cancel</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.commentsbtn}>
                      <Text style={{ color: "white" }}>View Comments</Text>
                    </TouchableOpacity> */}
                      </>
                    ) : null}
                    <TouchableOpacity
                      style={styles.commentsbtn}
                      onPress={() => {
                        navigation.navigate("View Comments", { details: item });
                      }}
                    >
                      <Text style={{ color: "white" }}>View Comments</Text>
                    </TouchableOpacity>

                    {queryStatus === "COMPLETED" ||
                    queryStatus === "CANCELLED" ? (
                      <>
                        {/* <TouchableOpacity style={styles.cancelbtn}>
                          <Text style={{ color: "white" }}>Inquires Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentsbtn}>
                      <Text style={{ color: "white" }}>View Comments</Text>
                    </TouchableOpacity> */}
                      </>
                    ) : null}
                  </View>
                </View>
              )}
              // ListEmptyComponent={<Text style={styles.emptyText}>No tickets available.</Text>}
            />
          ) : (
            <Text style={styles.emptyText}>No tickets available</Text>
          )}
        </>
      ) : (
        <ActivityIndicator size={30} color="green" />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={30} color="black" />
            </TouchableOpacity>
            {/* <Text>dcngf</Text> */}
            <Image source={{ uri: fileUrl }} style={styles.qrImage} />
          </View>
        </View>
      </Modal>

      {removeModal ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={removeModal}
          onRequestClose={() => setRemoveModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Optional Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setRemoveModal(false), setComments("");
                }}
              >
                <Text style={{ fontSize: 20, color: "black" }}>X</Text>
              </TouchableOpacity>
              {/* <Text>{ticketId} , {query}</Text> */}
              {/* Confirmation Text */}
              <Text style={styles.confirmText}>
                Are you sure you want to cancel the query?
                {/* ${ticketId} */}
              </Text>

              {/* Comment Input */}
              <TextInput
                style={styles.input}
                placeholder="Reason to cancel"
                value={comments}
                numberOfLines={5}
                multiline
                onChangeText={(text) => {
                  setComments(text), setComments_error(false);
                }}
              />
              {comments_error == true ? (
                <Text style={{ color: "red", margin: 5 }}>
                  Reason is mandatory
                </Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.submitbtn}
                  onPress={() => cancelTicketConfirm(ticketId, query)}
                >
                  <Text style={{color:"white"}}>yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitbtn1}
                  onPress={() => {
                    setRemoveModal(false);
                    setComments("");
                  }}
                >
                  <Text style={{color:"white"}}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default TicketHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F2F2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "gray",
    backgroundColor:"white",
    padding: 10,
    width: "50%",
    marginLeft: 190,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFF",
    // padding: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 8,
    // bottomBorderColor: "black",
    // borderBottomWidth: 0.5,
    // margin: 5,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginBottom: 8,
    // bottomBorderColor: "black",
    // borderBottomWidth: 0.5,
    margin: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft:10,
    width:width*0.25,
    // alignSelf:"flex-start"

  },
  label1:{
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  submitbtn: {
    backgroundColor: "green",
    alignSelf: "center",
    padding: 8,
    width: 100,
    alignItems: "center",
    borderRadius: 10,
  },
  submitbtn1: {
    backgroundColor: "red",
    alignSelf: "center",
    padding: 8,
    width: 100,
    alignItems: "center",
    borderRadius: 10,
  },

  value: {
    fontSize: 16,
    color: "#555",
    alignItems:"flex-end",
    marginLeft:15,
    width:width*0.4,
    justifyContent:"flex-end"
  },
  emptyText: {
    // flex:1,
    textAlign: "center",
    fontSize: 18,
    color: "black",
  },
  replybtn: {
    backgroundColor: "orange",
    padding: 10,
    margin: 10,
  },
  cancelbtn: {
    backgroundColor: "red",
    padding: 10,
    margin: 10,
  },
  commentsbtn: {
    backgroundColor: "#0384d5",
    padding: 10,
    margin: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    height: 300,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  qrImage: {
    width: 250,
    height: 250,
    // resizeMode: "contain",
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: "100%",

    flexDirection: "row",
    justifyContent: "space-around",
  },
});
