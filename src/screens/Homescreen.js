import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SectionList,
} from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../config';
import LevelComponents from '../components/LevelComponents';
import LoadingScreen from './LoadingScreen';
import {useAllLessons} from '../Context/AllLessonsContext';
import {getLessonType} from '../utils/fetchLesson';
import LessonComponent from '../components/LessonComponent';
import {checkPermissions} from '../utils/recordingPermission';

const HomeScreen = () => {
  const [viewsData, setViewsData] = useState(null); // State to store the views data
  const [isAdmin, setIsAdmin] = useState(false); // State to store if user is admin
  const {
    allLessons,
    updateLessons,
    completedUpto,
    updateSingleArray,
    singleArray,
  } = useAllLessons();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressArray, setProgressArray] = useState([]);

  useEffect(() => {
    checkAdminStatus(); // Check if the user is admin
    fetchViewsData(); // Fetch the views data when the screen is loaded
  }, [isAdmin]); // Fetch the views data when the user status changes

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (data && singleArray) {
      const lessonStates = data.map((view, level) => ({
        ...view,
        lessons: view.lessons.map((lesson, index) => ({
          ...lesson,
          locked: (() => {
            if (lesson.locked != null && lesson.locked == false) return false;

            // const currIdx = temp.findIndex((item) => item.id == lesson.id);

            if (index == 0) return false; //if (currIdx == 0 || currIdx == 1) return false;
            return view.lessons[index - 1].success == 0; //temp[currIdx - 1].success == 0 || temp[currIdx - 2].success == 0;
          })(),
          success: lesson.success,
          // ...lesson,
          // locked:(() => {
          //   if (lesson.locked != null && lesson.locked == false) return false;

          //   const currIdx = singleArray.findIndex((item) => item.id == lesson.id);

          //   if (currIdx == 0 || currIdx == 1) return false;

          //   return singleArray[currIdx - 1].success == 0 || singleArray[currIdx - 2].success == 0;
          // })()
        })),
      }));
      updateLessons(lessonStates);
    }
  }, [data, singleArray]);

  useEffect(() => {
    if (allLessons) {
      setViewsData(allLessons);
    }
  }, [allLessons]);

  useEffect(() => {
    if (viewsData) setLoading(false);
  }, [viewsData]);

  const fetchViewsData = async () => {
    const phoneNumber = await AsyncStorage.getItem('logined');
    try {
      const response = await fetch(`${API_BASE_URL}/get_user_lessons_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber.slice(-10),
        }),
      });
      const data = await response.json();
      let purchased1 = (await AsyncStorage.getItem('purchased')) === 'true';
      // console.log(purchased1,data)

      const updatedData = data.map((view, level) => ({
        ...view,
        lessons: view.lessons.map((lesson, index) => ({
          ...lesson,
          auth:
            purchased1 ||
            isAdmin ||
            level == 0 ||
            (level == 1 && (index == 0 || index == 1))
              ? true
              : false,
          type: level == 0 ? 'without' : 'with',
          index: level,
        })),
      }));
      // console.log(updatedData)
      const singleArray = updatedData.map(item => item.lessons).flat();
      setProgressArray(new Array(data.length).fill(0));
      updateSingleArray(singleArray);
      setData(updatedData);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert(
        'Internal Server Error', // Title of the alert
        'Please open the app again', // Message of the alert
      );
    }
  };

  // Function to check if the user is admin
  const checkAdminStatus = async () => {
    const phoneNumber = await AsyncStorage.getItem('logined'); // Get the logged in user's phone number
    try {
      const response = await fetch(`${API_BASE_URL}/is_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({mobile: phoneNumber}),
      });
      const data = await response.json();
      console.log('Admin status:', data);
      setIsAdmin(data.is_admin); // Set the isAdmin state based on the response
    } catch (error) {
      console.error('Error checking admin status:', error);
      Alert.alert(
        'Internal Server Error', // Title of the alert
        'Please open the app again', // Message of the alert
      );
    }
  };
  useEffect(() => {
    if (allLessons) {
      let temp = progressArray;
      allLessons.map((level, index) => {
        const successCount = level.lessons.filter(obj => obj.success).length;
        const totalLength = level.lessons.length;
        const p = Math.floor((successCount * 100) / totalLength);
        if (isNaN(p)) temp[index] = 0;
        else temp[index] = p;
      });
      setProgressArray(temp);
    }
  }, [allLessons]);

  const sections = viewsData?.map((level, index) => ({
    title: `LEVEL ${level.view_number}`,
    data: level.lessons,
    key: index,
  }));
  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header isAdmin={isAdmin} />
      </View>
      {/* <ScrollView> */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderItem={({item, index}) => (
          <LessonComponent
            data={item}
            key={index}
            index={index}
            pos={index}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        renderSectionHeader={({section, key}) => (
          <LevelComponents
            data={section}
            key={section.key}
            index={section.key}
            progress={progressArray[section.key]}
          />
        )}
        stickySectionHeadersEnabled={true}
      />
      {/* {
                        viewsData && viewsData.map((data,index)=>(
                            <LevelComponents data={data} key={index} index={index} progress={progressArray[index]}/>
                        ))
                    } */}
      {/* </ScrollView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  header: {
    height: 100,
  },
});

export default HomeScreen;
