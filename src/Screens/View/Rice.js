import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';

const { height, width } = Dimensions.get('window');

const Rice = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);

    const accessToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1IiwiaWF0IjoxNzMxMDYwNTkxLCJleHAiOjE3MzE5MjQ1OTF9.AZiC8RauTx8NWloTcI6CzGKHVhXTJOyvGW6OhnrrSfCVoCH7Aw1bOupBCHTxstNLgoeDnk4j401IYjJOVnvn2w"; 

    // useEffect(() => {
    //     getAllCategories();
    // }, []);
   useEffect (()=>{
    const getAllCategories = () => {
        axios.get('https://meta.oxyloans.com/api/erice-service/user/showItemsForCustomrs',{
            headers: { Authorization: `Bearer ${accessToken}` },
          })
            .then(response => {
                console.log("showItemsForCustomrs", response.data[0].categoryName);
                console.log(response.data);
                
                setCategories(response.data);
				console.log(response.data[0].categoryLogo);
				
            })
            .catch(error => {
                console.log(error.response);
            });
    }; getAllCategories();
},[])

    const renderItem = ({ item, index }) => {
        if (!item.categoryLogo) return null; // Skip rendering if categoryLogo is not available

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).duration(600).springify().damping(12)}
                style={styles.card}
            >
                <TouchableOpacity onPress={() => navigation.navigate('Rice Product Detail', { details: item, name: item.categoryName ,})}>
                    <Image 
                        source={{ uri: item.categoryLogo}} 
                        style={styles.image} 
                    />
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Filter out categories without images
    const filteredCategories = categories.filter(item => item.categoryLogo);

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <Text style={styles.title}>Rice Categories</Text>
            <FlatList
                data={filteredCategories}
                keyExtractor={item => item.categoryName}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.contentContainerStyle}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default Rice;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
        color: '#333',
    },
    contentContainerStyle: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
    card: {
        flex: 1,
        margin: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        alignItems: 'center',
    },
    image: {
        height: height / 6,
        width: '70%',
        borderRadius: 10,
        marginBottom: 10,
    },
    categoryName: {
        color: "#333",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
});

