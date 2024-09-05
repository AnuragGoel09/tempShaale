import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  BackHandler,
} from 'react-native';
import {Button, Layout} from '@ui-kitten/components';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRecord} from '../Context/RecordContext';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE_URL} from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './LoadingScreen';
import {checkPermissions} from '../utils/recordingPermission';

const LessonWithoutMetronome = ({route, navigation}) => {
  const id = route?.params?.id;
  const play = route?.params?.play;
  const [data, setData] = useState(null);
  const {
    initAudioRecord,
    startRecord,
    handleStopRecording,
    audioFile,
    loaded,
    setLoaded,
    recording,
    hasRecorded,
    setRecording,
    setAudioFile,
    setHasRecorded,
    setRecordDefault,
  } = useRecord();
  const [sound, setSound] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [paused, setPaused] = useState(true);
  const [recPermission, setRecPermission] = useState();
  const [stopped, setStopped] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useState(() => {
    const fetchLessonInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_standard_id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({id}),
        });
        const data = await response.json();
        setData(data.data);
      } catch (error) {
        console.error('Lesson Fetch Error:', error);
      }
    };
    fetchLessonInfo();
    initAudioRecord();
    const backHandler = () => {
      if (sound) {
        sound.stop();
        sound.release();
        if (!stopped) stopRecording();
      }
    };
    const backHandlerListener = BackHandler.addEventListener(
      'hardwareBackPress',
      backHandler,
    );
    return () => backHandlerListener.remove();
  }, []);

  useEffect(() => {
    if (data && sound == null) {
      try {
        const s = new Sound(data.audioFileURL, '', error => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          setSound(s);
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [data]);

  const playSyllableAudio = () => {
    setRecordDefault();
    setDisabled(() => true);
    sound.play(success => {
      if (success) {
        console.log('Successfully finished playing');
        setDisabled(false);
      } else {
        console.log('Playback failed due to audio decoding errors');
      }
    });
  };
  const handleListenAgain = () => {
    // Play the syllable sound again when the "Listen Again" button is pressed
    playSyllableAudio();
  };

  useEffect(() => {
    if (sound && play) {
      playSyllableAudio();
    } else if (sound && !play) {
      startRecording();
    }
  }, [sound]);

  useEffect(() => {
    if (audioFile) {
      console.log('uploading.....');
      handleUpload();
    }
  }, [audioFile]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (sound) {
          sound.stop();
          sound.release();
          if (!stopped) stopRecording();
        }
      };
    }, []),
  );

  const startRecording = () => {
    // Start recording for the selected syllable
    console.log(`Recording for ${data.syllableText}`);
    startRecord();
    // checkPermissions().then((status)=>{
    //   console.log("STATUS",status);
    //   if(status==true){
    //   }
    //   else{
    //     Alert.alert(
    //       'Microphone Permission Required', // Title of the alert
    //       '', // Message of the alert
    //       [
    //         { text: "Open Settings", onPress: () => Linking.openSettings() },
    //       ]
    //   )
    //   }
    // })

    // setTimeout(handleStopRecording(), 5000);
  };

  const stopRecording = () => {
    // Stop recording for the selected syllable
    console.log('STOPPPED', stopped);
    if (stopped) return;
    else {
      setStopped(() => true);
      handleStopRecording();
    }
    // handleUpload();
  };

  const handleUpload = async () => {
    console.log('upload');
    // setIsLoading(true); // Start loading
    const phoneNumber = await AsyncStorage.getItem('logined');
    console.log(phoneNumber, data);
    let bodyContent = new FormData();
    bodyContent.append('audioFile', {
      uri: 'file://' + audioFile,
      type: 'audio/wave',
      name: `${data.Title}_userRecording.wav`,
    });
    bodyContent.append('mobile', phoneNumber);
    bodyContent.append('syllable', data.Title);
    console.log('Body Coontent : ', bodyContent);
    try {
      const res = await fetch(`${API_BASE_URL}/single_syllable_predict`, {
        method: 'POST',
        body: bodyContent,
      });

      const resData = await res.json();
      data.Title = data.Title.replace(/\s+/g, '');
      console.log('syllable.Title:', data.Title);
      console.log(resData);
      // After upload, navigate to FeedbackScreen with necessary information
      console.log(resData.syllable === data.Title.toUpperCase());
      navigation.replace('FeedbackScreen', {
        isCorrect: resData.syllable === data.Title.toUpperCase(),
        id: id,
        type: 'without',
        save: route.params.save,
      });
    } catch (err) {
      console.log(err.message, 'ERROR');
    } finally {
      setIsLoading(false); // End loading
    }
    setRecordDefault();
    // setFeedbackModalVisible(true);
  };
  console.log('STATUS', disabled, hasRecorded);
  return sound == null ? (
    <LoadingScreen />
  ) : (
    <Layout style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.syllableText}>{data.Title}</Text>
          <Button
            style={styles.listenAgainButton}
            onPress={handleListenAgain}
            disabled={recording || disabled || hasRecorded}>
            Listen Again
          </Button>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.recordButton}
            onPress={recording ? stopRecording : startRecording}
            disabled={disabled}>
            {recording ? 'Stop' : hasRecorded ? 'Fetching results...' : 'TRY'}
          </Button>
        </View>
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'black',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syllableText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  listenAgainButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    color: '#fff',
    borderColor: '#000',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: 16,
  },
  recordButton: {
    marginBottom: 16,
    borderRadius: 12,
    fontWeight: 'bold',
    backgroundColor: '#000',
    color: '#fff',
    paddingVertical: 20,
    borderColor: '#000',
  },
});

export default LessonWithoutMetronome;
