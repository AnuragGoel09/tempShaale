import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Button, TouchableOpacity } from 'react-native';
import successImage from '../assets/images/success.png'
import failedImage from '../assets/images/failed.png'

const { width,height } = Dimensions.get('window');

const PurchaseStatus = ({navigation,route}) => {
    const status=route.params.status;
    console.log(status)
  return (
    <View style={styled.container}>
        <Image source={status=="success"?successImage:failedImage} style={{ width: 100, height: 100 }}/>
        {
            status=="success" && <Text style={styled.text}>Payment Successful</Text>
        }
        {
            status=="failed" && <Text style={styled.text}>Payment Failed</Text>
        }
        <Text>Hello</Text>
        <TouchableOpacity style={styled.button} onPress={()=>{
            status=="success"?navigation.navigate('All Levels Screen'):navigation.navigate("Purchase")
        }}>
            <Text style={styled.buttonText} >{status=="success"?"Home":"Back"}</Text>
        </TouchableOpacity>
    </View>
  );
}
const styled=StyleSheet.create({
    container:{
        width,
        height,
        backgroundColor:"whitesmoke",
        flex:1,
        gap:2,
        justifyContent:'center',
        alignItems:'center'
    },
    text:{
        color:'black',
        fontSize:30,
    },
    button:{
        backgroundColor:'blue',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:10
    },
    buttonText:{
        color:'white',
        fontSize:20,
        letterSpacing:2
    }
})

export default PurchaseStatus;
