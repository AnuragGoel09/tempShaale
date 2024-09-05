import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet,TouchableOpacity,Image, Alert, Button, Modal, TouchableWithoutFeedback } from 'react-native';
import { getLessonType } from '../utils/fetchLesson';
import { checkPermissions } from '../utils/recordingPermission';
import icons from '../constants/icons';

const LessonComponent = ({data,pos,loading,setLoading}) => {
    const navigation=useNavigation()
    const [recPermission,setRecPermission]=useState(false);
    // const [loading,setLoading]=useState(false);
    // useEffect(()=>{
    //     console.log("RECORDING STATUS",recPermission)
    //     if(recPermission){
    //         try {
    //             getLessonType(data.id).then((type)=>{
    //                 console.log(type);
    //                 type=="without"?navigation.navigate("Learn Screen",{id:data.id,play:true,save:true}):navigation.navigate("Lesson with Metronome",{id:data.id,play:true,index:data.index,save:true})
    //             })
    //         } catch (error) {
    //             console.log("ERROR IN OPENING LESSON")
    //         }
    //     }
    // },[recPermission])
    
    const openLesson=()=>{
        checkPermissions().then((status)=>{
            // setRecPermission(status)
            console.log("deasd",status)
            try {
                getLessonType(data.id).then((type)=>{
                    console.log(type);
                    setLoading(()=>false)
                    type=="without"?navigation.navigate("Learn Screen",{id:data.id,play:true,save:true}):navigation.navigate("Lesson with Metronome",{id:data.id,play:true,index:data.index,save:true})
                })
            } catch (error) {
                console.log("ERROR IN OPENING LESSON")
                setLoading(()=>false)
            }
        })
        .catch(()=>{
            setLoading(()=>false);
        });
    }

    const showAlert=()=>{
        // if(data.auth){
            setVisible(true)
        // }
        // else{
            // navigation.navigate("Purchase")
        // }
    }
    const [visible, setVisible] = useState(false);
    return (
    <View style={[styles.container,{justifyContent:pos%4==0?'flex-end':pos%2==1?'center':'flex-start'}]} onPress={()=>visible?setVisible(false):{}} >
        <View style={styles.button}>
            <Modal
                visible={visible}   
                transparent={true} 
                animationType="fade"
            >
                    <View style={{paddingHorizontal:30,paddingVertical:20,position:'absolute',bottom:0,width:'100%'}}>
                        <View style={styles.alertBox}>
                            <Text style={{color:'black',fontSize:19,marginBottom:20,marginTop:20}}>Complete previous lessons to unlock!</Text>
                            <View style={{width:'100%',backgroundColor:'#969696',padding:15,borderRadius:10,flex:1,alignItems:'center'}}>
                                <Text style={{fontSize:24}}>LOCKED</Text>
                            </View>
                            <TouchableOpacity  onPress={()=>setVisible(false)}  style={{position:'absolute',right:15,top:15}}>
                                <Image source={require("../assets/icons/close-icon.png")} style={{width:20,height:20}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                
            </Modal>
            <View style={[styles.cylinder,{zIndex:8,position:'relative'}]}>
                <TouchableOpacity style={{flex:1,alignItems:'center'}}  onPress={()=>{
                                data.locked?showAlert():openLesson();
                            }}>
                    <View style={[styles.mainCircle,{backgroundColor:(data.success==1)?'#8ad0c7':(data.success==0 && data.locked==false)?'#f8dfaa':'#d9dcdc'}]}>
                        <View style={{transform: [{ scaleX: 0.8}]}}>
                            {
                                !data.locked && data.type=="with" && <Image style={{width:40,height:40,objectFit:"contain"}}  source={icons[Math.floor(Math.random() * (icons.length-1))].dark}/>
                            }
                            {
                                !data.locked && data.type!="with" && <Text style={{color:'black',fontSize:20}}>{data.Title}</Text>
                            }
                            {
                                data.locked && data.type=="with" && <Image style={{width:40,height:40,objectFit:"contain"}} source={icons[Math.floor(Math.random() * (icons.length-1))].light}/>
                            }
                            {
                                data.locked && data.type!="with" &&  <Text style={{color:'black',fontSize:20,opacity:0.2}}>{data.Title}</Text>
                            }
                        </View>
                    </View>
                    <View style={[styles.backCircle,{backgroundColor:(data.success==1)?'#5f9f95':(data.success==0 && data.locked==false)?'#e0bf88':'#c7c6c6'}]}>
                    </View>
                    <View style={[styles.shadowCircle,{shadowColor:(data.success==1)?'#5f9f95':(data.success==0 && data.locked==false)?'#e0bf88':'#c7c6c6'}]}>
                    </View>
                    {
                        (data.success==0 && data.locked==false) && <Image style={{position:'absolute',zIndex:3,top:-60}} source={require("../assets/icons/start-icon.png")}/>
                    }
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );
}

const styles=StyleSheet.create({
    cylinder:{
        position:'relative',
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    mainCircle:{
        width: 75,
        height: 75,
        borderRadius: 50,
        backgroundColor: "red",
        transform: [{ scaleX: 1.25 }], 
        zIndex:2,
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    },
    backCircle:{
        width: 85,
        position:'absolute',
        height: 85,
        top:3,
        borderRadius: 50,
        backgroundColor: "black",
        transform: [{ scaleX: 1.1 }],
        zIndex:1,
    },
    shadowCircle:{
        width: 88,
        position:'absolute',
        height: 88,
        top:5,
        borderRadius: 50,
        shadowOffset: { width: 0, height: 10 }, // Only add shadow at the bottom
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowColor:'black',
        elevation: 10, // Adjust elevation to match the desired shadow depth
    },
    container:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:70,
        marginHorizontal:20,
        position:'relative',
        marginBottom:20
    },
    button:{
        position:'relative',
        zIndex:9,
    },
    alertBox:{
        backgroundColor:'#DEDEDE',
        borderRadius:20,
        padding:25,
        flex:1,
        alignItems:'center'
    },
    levelHeading:{
        color:'black',
        fontSize:15,
        fontWeight:'bold',
    },
    circle:{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        width:35,
        height:35,
        borderRadius:100,
        backgroundColor:"#3ABEF9",
    },
    status:{
        position:'absolute',
        right:3
    }
})

export default LessonComponent;
