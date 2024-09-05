import React,{useEffect, useRef, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity,UIManager, Animated, Image, ScrollView,Platform,LayoutAnimation, Dimensions, SectionList } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import LessonComponent from './LessonComponent';
import { useAllLessons } from '../Context/AllLessonsContext';
import COLORS from '../constants/colors';
const { width } = Dimensions.get('window');
const LevelComponents = ({data,progress}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownHeight = useRef(new Animated.Value(0)).current;
    const {allLessons}=useAllLessons()
    const amplitude = 30; // The height of the wave
    const frequency = 0.1; // The number of waves in the width
    useEffect(()=>{
        // getProgress()
    },[allLessons])
    const toggleDropdown = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Smooth animation
        if (isOpen) {
          Animated.timing(dropdownHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start(() => setIsOpen(false));
        } else {
          setIsOpen(true);
          Animated.timing(dropdownHeight, {
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      };    
    return (
        <View style={styles.container}>
            <View style={{paddingHorizontal:30,display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                <View>
                    <Text style={[styles.levelHeading, { color: progress==100?COLORS.complete:COLORS.primary }]}>{data.title}</Text>
                    <Text style={styles.levelSubHeading}>Basic Syllables</Text>
                </View>
                <View>
                    {
                        progress>0 && <AnimatedCircularProgress
                            size={50}
                            width={4}
                            fill={progress}
                            tintColor={COLORS.complete}
                            backgroundColor={COLORS.grey}
                            rotation={0}
                        >{
                            (fill)=>(
                                <Text style={styles.progressText} >{progress} %</Text>
                            )
                        }
                        </AnimatedCircularProgress>
                    } 
                </View>
            </View>
            {/* <View style={{marginVertical:30}}>
                {
                    data.lessons.map((item,index)=>{
                        return (
                                <LessonComponent data={item} key={index} index={index} pos={index} />
                    )})
                }
            </View> */}
            
        </View>
    );
}

const styles=StyleSheet.create({
    container:{
        display:'flex',
        paddingVertical:20,
        backgroundColor:'white',
        marginBottom:30,
    },
    text:{
        color:'black'
    },
    hiddenContent: {
        position: 'absolute',
        opacity: 0,
    },

    levelHeading:{
        color:'black',
        fontSize:30,
        fontWeight:'bold'
    },
    levelSubHeading:{
        color:'black',
        fontSize:18,
        // fontWeight:'bold'
    },
    progressText:{
        color:'black',
        fontSize:16
    },
    drop:{
        position:'absolute',
        bottom:10,
        left:'60%',
    },
    image:{
        height:20,
        width:20
    },
    dropdown: {
        backgroundColor: 'white',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 10,
    },
})

export default LevelComponents;
