import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {withIAPContext} from 'react-native-iap';

import LessonWithMetronome from './screens/LessonWithMetronome';
import LessonScreen from './screens/LessonScreen';
import UnorganizedLessons from './screens/UnorganizedLessons';
import PostLesson from './screens/PostLesson';
import {MetronomeProvider} from './Context/MetrnomeContext';
import {RecordProvider} from './Context/RecordContext';
import AddLyrics from './screens/AddLyrics';
import DataCollection from './screens/DataCollection';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import LoginWithOtp from './screens/Login/LoginWithOtp';
import Purchase from './screens/Purchase';
import Admin from './screens/AdminLessons';
// import soundMerge from './screens/soundMerge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './screens/LoadingScreen';
import {API_BASE_URL} from './config';
import UploadLesson from './screens/UploadLesson';
// import { Subscriptions } from './screens/Subscription/Subscriptions';
// import SubscriptionScreen from './screens/Subscription/SubscriptionScreen';
import WebSocket from './screens/WebSocket';
import PurchaseStatus from './screens/PurchaseStatus';
import HomeScreen from './screens/HomeScreen';
import {AllLessonsProvider} from './Context/AllLessonsContext';
import LessonWithoutMetronome from './screens/LessonWithoutMetronome';
import Feedback from './screens/Feedback';
import LessonDetails from './screens/LessonDetails';
// import Purchase2 from './screens/Purchase2';
// import LessonWM from './screens/lessonWM';
// import MultiTrackPlayerScreen from './screens/MultiTrackPlayerScreen';

const Stack = createStackNavigator();

const Main = () => {
  const [initialRouteName, setInitialRuteName] = useState('');

  useEffect(() => {
    // console.log("-----------------------------------------------------------------------------");
    const retriveOrStore = async () => {
      try {
        const [launchedValue, Token, LoginedValue] = await Promise.all([
          AsyncStorage.getItem('launched'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('logined'),
        ]);
        if (launchedValue !== null) {
          // We have data!!
          // console.log(value);
          // console.log("have data");

          if (LoginedValue === null || Token === null) {
            setInitialRuteName('LoginWithOtp');
          } else {
            console.log('LoginedValue:', LoginedValue, 'Token:', Token);
            try {
              const res = await fetch(`${API_BASE_URL}/verify_user_token`, {
                method: 'POST',
                body: JSON.stringify({mobile: LoginedValue, token: Token}),
                headers: {
                  Accept: '*/*',
                  'Content-Type': 'application/json',
                },
              });
              const resData = await res.json();
              console.log('Response:', resData);
              if (resData.signin) {
                setInitialRuteName('All Levels Screen');
              } else {
                setInitialRuteName('LoginWithOtp');
              }
            } catch (err) {
              console.log(err.message);
              setInitialRuteName('LoginWithOtp');
            }
            // console.log(LoginedValue);
            // setInitialRuteName('All Levels Screen');
          }
        } else {
          console.log('no data');
          await AsyncStorage.setItem('launched', 'Yes');
          setInitialRuteName('Onboarding Screen');
        }
      } catch (error) {
        console.log('Error', error);
        // Error retrieving data
      }
    };
    retriveOrStore();
    // setInitialRuteName('Onboarding Screen');
  }, []);

  if (!initialRouteName) {
    return <LoadingScreen />;
  }

  return (
    <RecordProvider>
      <MetronomeProvider>
        <AllLessonsProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRouteName}>
              {/* <Stack.Screen name="Home Screen" component={HomeScreen} options={{ headerShown: false }} /> */}
              <Stack.Screen
                name="Onboarding Screen"
                component={OnboardingScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LoginWithOtp"
                component={LoginWithOtp}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="All Levels Screen"
                component={HomeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Lesson with Metronome"
                component={LessonWithMetronome}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="FeedbackScreen"
                component={Feedback}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Lesson Screen"
                component={LessonScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Unorganized Lessons"
                component={UnorganizedLessons}
              />
              <Stack.Screen name="Lesson Details" component={LessonDetails} />
              <Stack.Screen
                name="Learn Screen"
                component={LessonWithoutMetronome}
                options={{headerShown: false}}
              />
              <Stack.Screen name="Post Lesson" component={PostLesson} />
              <Stack.Screen name="Upload Lesson" component={UploadLesson} />
              <Stack.Screen name="AddLyrics" component={AddLyrics} />
              <Stack.Screen name="Data Collection" component={DataCollection} />
              <Stack.Screen
                name="Purchase"
                component={withIAPContext(Purchase)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Purchase Status"
                component={PurchaseStatus}
                options={{headerShown: false}}
              />
              <Stack.Screen name="Admin" component={Admin} />
              <Stack.Screen
                name="WebSocket"
                component={WebSocket}
                options={{headerShown: false}}
              />
              {/* Add more screens here as your app grows */}
            </Stack.Navigator>
          </NavigationContainer>
        </AllLessonsProvider>
      </MetronomeProvider>
    </RecordProvider>
  );
};

export default Main;
