import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileOptions = ({isAdmin}) => {

    const navigation=useNavigation()
    
    const handleLogout=async()=>{
        await AsyncStorage.setItem("logined", "null");
        await AsyncStorage.setItem("token", "null");
        // console.log("HELO")
        navigation.replace("LoginWithOtp")
    }
    const handleAdmin=()=>{
        navigation.navigate("Admin")
    }
    return (
        <SafeAreaView style={styles.container}>
            {/* <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>Profile</Text>
            </TouchableOpacity> */}
            {   isAdmin &&
                <TouchableOpacity style={styles.item} onPress={handleAdmin}>
                    <Text style={styles.itemText}>Admin</Text>
                </TouchableOpacity>

            }
            <TouchableOpacity style={styles.item} onPress={handleLogout}>
                <Text style={styles.itemText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
  );
}

const styles=StyleSheet.create({
    container:{
        maxWidth:'100%',
        backgroundColor:COLORS.black,
        paddingHorizontal:20,
        paddingVertical:7,
        borderRadius:10
    },
    item:{
        width:'100%',
        marginVertical:2,
    },
    itemText:{
        color:COLORS.white,
        fontSize:18
    },

})

export default ProfileOptions