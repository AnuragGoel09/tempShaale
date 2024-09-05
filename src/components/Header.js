import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import ProfileOptions from './ProfileOptions';

const Header = ({isAdmin}) => {
    const [showOptions,setShowOptions]=useState(false)
    // const boxRef=useRef(null)
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <Image source={require('../assets/images/TakaDimi1.png')} style={styles.logo} />
            </View>
            <View style={styles.right}>
                {/* <TouchableOpacity>
                    <Image source={require('../assets/icons/growth-icon.png')} style={styles.growth} />
                </TouchableOpacity> */}
                <TouchableOpacity onPress={()=>setShowOptions((prev)=>!prev)}>
                    <Image source={require('../assets/icons/setting-icon.png')} style={styles.profile} />
                </TouchableOpacity>
            </View>
            {
                showOptions && <View style={styles.profileOptions}>
                    <ProfileOptions isAdmin={isAdmin}/>
                </View>
            }
        </View>
    );
}

const styles=StyleSheet.create({
    container:{
        width:Dimensions.get("window").width,
        paddingHorizontal:30,
        marginTop:20,
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'end',
        position:'relative',
        paddingVertical:35

    },
    logo:{
        width:60,
        height:60
    },
    profile:{
        width:30,
        height:30
    },
    growth:{
        width:25,
        height:25,
    }, 
    left:{
        position:'relative',
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        
    },
    right:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        gap:30
    },
    profileOptions:{
        position:'absolute',
        top:70,
        right:20,
        zIndex:99,
    }
})

export default Header;