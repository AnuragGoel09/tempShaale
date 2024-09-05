import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text,Button,StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native'
import Sound from 'react-native-sound';
import { useFocusEffect } from '@react-navigation/native';
import { useAllLessons } from '../Context/AllLessonsContext';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Feedback = ({route,navigation}) => {
    const {isCorrect,type,id}=route?.params;
    const animation = useRef(null);
    const [sound,setSound]=useState(null);
    const [temp,setTemp]=useState(null);
    const {allLessons,updateLessons,singleArray,updateSingleArray,updateSuccess} =useAllLessons()
    useEffect(()=>{
        if(temp){
            const lessonStates=allLessons.map((view,level)=>({
                ...view,
                lessons:view.lessons.map((lesson,index)=>({
                    ...lesson,
                    locked: (() => {
                    if (lesson.locked != null && lesson.locked == false) return false;
                
                    const currIdx = temp.findIndex((item) => item.id == lesson.id);
                    
                    if(index==0) return false;//if (currIdx == 0 || currIdx == 1) return false;
                        
                    return temp[level][index-1].success==0;//temp[currIdx - 1].success == 0 || temp[currIdx - 2].success == 0;
                    })(),
                    success:temp[level][index].success
                    // success:(()=>{
                    //     if(lesson.success==1)
                    //         return 1;
                    //     else{
                    //         const currIdx = temp.findIndex((item) => item.id == lesson.id);
                    //         return singleArray[currIdx].success
                    //     }
                    
                    // })(),
                }))
                }))
            
            updateLessons(lessonStates)
            }
    },[temp])
    function findViewIdByLessonId(lessonId) {
        for (let i = 0; i < allLessons.length; i++) {
          const view = allLessons[i];
          for (let j = 0; j < view.lessons.length; j++) {
            const lesson = view.lessons[j];
            if (lesson.id === lessonId) {
                return view.view_id;
            }
          }
        }
        return null; // return null if lessonId is not found
      }

    const handleCorrect=async()=>{
        const lessonsId=findViewIdByLessonId(id);
    //    updateSuccess(id)
        const phoneNumber = await AsyncStorage.getItem('logined');
        const response = await fetch(`${API_BASE_URL}/update_user_track`,{
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                mobile: phoneNumber.slice(-10),
                lessonDocId:id,
                lessonId:lessonsId
                }),
            })
            console.log(response,"RES")
            const idx=singleArray.findIndex((item)=>item.id==id);
            console.log("COMPLETED LESSONS",singleArray[idx])
            const updatedState=allLessons.map((view,level)=>(
                view.lessons.map((lesson)=>(
                    lesson.id==id?{...lesson,success:1}:lesson
                ))
            ))
            
            const tempArray=singleArray.map((item)=>(
                item.id==id?{ ...item,success:1}:item
            ));
            updateSingleArray(tempArray)
            setTemp(updatedState)
    }
    useEffect(()=>{ 
        if(isCorrect && route.params.save){
            handleCorrect()
        }
    },[isCorrect])
    useEffect(()=>{
        try {
            const s=new Sound(isCorrect?require("../assets/audio/correct.mp3"):require("../assets/audio/wrong.mp3"),(error)=>{
                if(error){
                    return
                }
                setSound(s)
            })
        } catch (error) {
            
        }
    },[])

    useEffect(() => {
        // Start the animation on component mount
        if(sound){
            // animation.current.play();
            sound.play()
        }
    }, [sound]);
    
    useFocusEffect(
        useCallback(()=>{
            return ()=>{
                if(sound){
                    sound.stop();
                    sound.release();
                }
            }
        },[])
    );

    const handleNextLesson=()=>{
        
        allLessons.map((view)=>{
            view.lessons.map((lesson,idx)=>{
                if(lesson.id==id){
                    if(idx+1<view.lessons.length){
                        const les=view.lessons[idx+1];
                        if(les.locked){
                            navigation.goBack();
                        }
                        else{
                            if(les.type=="with"){
                                navigation.replace("Lesson with Metronome",{id:les.id,play:true,index:les.index,save:route.params.save})
                            }
                            else{
                                navigation.replace("Learn Screen",{id:les.id,play:true,save:route.params.save})
                            }
                        }
                    }
                    else{
                        navigation.goBack();
                    }
                    
                }
            })
        })

        // const idx=singleArray.findIndex((item)=>item.id==id);
        // if(idx+1<singleArray.length){
        //     const courseWithLesson = allLessons.find(course =>
        //         course.lessons.some(lesson => lesson.id === singleArray[idx+1].id)
        //     );
        //     const lesson = courseWithLesson?.lessons.find(lesson => lesson.id === singleArray[idx+1].id);
        //     if(lesson.locked){
        //         navigation.goBack();
        //     }
        //     else{
        //         if(singleArray[idx+1].type=="with"){
        //             navigation.replace("Lesson with Metronome",{id:lesson.id,play:true,index:lesson.index,save:route.params.save})
        //         }
        //         else{
        //             navigation.replace("Learn Screen",{id:singleArray[idx+1].id,play:true,save:route.params.save})
        //         }
        //     }
        // }
    }
    const handleTryAgain=()=>{
        
        allLessons.map((view)=>{
            view.lessons.map((lesson,idx)=>{
                if(lesson.id==id){
                    if(lesson.type=="with"){
                        navigation.replace("Lesson with Metronome",{id:lesson.id,play:false,index:lesson.index,save:route.params.save})
                    }
                    else{
                        navigation.replace("Learn Screen",{id:lesson.id,play:false,save:route.params.save})
                    }
                }
            })
        })
        // const idx=singleArray.findIndex((item)=>item.id==id);
        // if(singleArray[idx].type=="with"){
        //     navigation.replace("Lesson with Metronome",{id:singleArray[idx].id,play:false,index:singleArray[idx].index,save:route.params.save})
        // }
        // else{
        //     navigation.replace("Learn Screen",{id:singleArray[idx].id,play:false,save:route.params.save})
        // }
    }
    
    const handleReplay=()=>{
        
        allLessons.map((view)=>{
            view.lessons.map((lesson,idx)=>{
                if(lesson.id==id){
                    if(lesson.type=="with"){
                        navigation.replace("Lesson with Metronome",{id:lesson.id,play:true,index:lesson.index,save:route.params.save})
                    }
                    else{
                        navigation.replace("Learn Screen",{id:lesson.id,play:true,save:route.params.save})
                    }
                }
            })
        })
        // const idx=singleArray.findIndex((item)=>item.id==id);
        // if(singleArray[idx].type=="with"){
        //     navigation.replace("Lesson with Metronome",{id:singleArray[idx].id,play:true,index:singleArray[idx].index,save:route.params.save})
        // }
        // else{
        //     navigation.replace("Learn Screen",{id:singleArray[idx].id,play:true,save:route.params.save})
        // }
    }

    return (
        <View style={[styles.container,{backgroundColor:isCorrect?'#68BB6C':'#ef5350',flex:1,alignItems:'center',justifyContent:'center'}]}>
            <View>
                <Text style={{fontSize:50,color:'white'}}>{isCorrect?"GREAT JOB":"UH OH!"}</Text>
            </View>
            {/* {
                isCorrect && <LottieView
                ref={animation}
                source={require('../assets/correct-celeb.json')}
                autoPlay={true} // Set to true if you want it to auto play
                loop={true} // Set to true if you want it to loop
                style={styles.animation}
                resizeMode='cover'
                />
            }
            {
                !isCorrect &&  <LottieView
                ref={animation}
                source={require('../assets/wrong-celeb.json')}
                autoPlay={true} // Set to true if you want it to auto play
                loop={true} // Set to true if you want it to loop
                style={styles.animation}
                resizeMode='cover'
                />
            } */}

            <View style={styles.buttonContainers}>
                {
                    isCorrect && <>
                        <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
                            <Text style={styles.text}>Practice Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleNextLesson}>
                            <Text style={styles.text}>Next</Text>
                        </TouchableOpacity>
                    </>
                }
                {
                    !isCorrect && <>
                        <TouchableOpacity style={styles.button} onPress={handleReplay}>
                            <Text style={styles.text}>Replay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
                            <Text style={styles.text}>Try Again</Text>
                        </TouchableOpacity>
                    </>
                }
            </View>
            
            
            
      </View>
  );
}
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex:1,
        width:'100%',
        height:'100%',
        position:'relative',
    },
    animation: {
        width: width,
        height: height,
        position:'absolute'
        
      },
      buttonContainers:{
        width:width,
        display:'flex',
        flexDirection:'row',
        position:'absolute',
        bottom:20,
        gap:10,
        padding:20
      },
      button:{
        backgroundColor:'#0288d1',
        flex:1,
        height:50,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10
      },
      text:{
        fontSize:20,
        color:'white'
      }
  });
  

export default Feedback;
