import React, {useRef, useState, useEffect, useContext} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  SafeAreaView,
  BackHandler,
  Alert,
  Switch,
} from 'react-native';
import {Button, Layout, Toggle, Input} from '@ui-kitten/components';
import {useRoute} from '@react-navigation/native';
import {MetronomeContext} from '../Context/MetrnomeContext';
import {API_BASE_URL} from '../config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Sound from 'react-native-sound';
import RenderSlide from '../components/MetronomeSlide';
import PaginationDots from '../components/PaginationDots';
import io from 'socket.io-client';
import AudioRecord from 'react-native-audio-record';
import {Buffer} from 'buffer';
import LoadingScreen from './LoadingScreen';
const {width, height} = Dimensions.get('window');

const slides = [{id: 1}, {id: 2}];

// Function to render the LessonWithMetronome screen
const LessonWithMetronome = () => {
  const socket = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);

  const navigation = useNavigation();
  const route = useRoute();
  const [wait, setWait] = useState(false);
  const id = route.params?.id;
  const index = route.params?.index;
  const [lesson, setLesson] = useState({});
  const [tempo, setTempo] = useState(lesson.Tempo);
  const [clapLesson, setClapLesson] = useState([]);
  const [numberOfParts, setNumberOfParts] = useState(0);
  const running = useRef(false);
  const [initialOffset, setInitialOffset] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const cycleCountRef = useRef(0);
  const customColorsRef = useRef([]);
  const [totalCycles, setTotalCycles] = useState(0);
  const lyricsScrollViewRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const [segmentPoints, setSegmentPoints] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const sendIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);
  const highlightIntervalRef = useRef(null);
  const highlightInterval = useRef(0);
  const [count, setCount] = useState(-1);
  const isPlayingRef = useRef(true);
  const [correct, setCorrect] = useState(0);
  const [responseCame, setResponseCame] = useState(0);
  const [lastCame, setLastCame] = useState(false);
  const muteSound = () => {
    if (sound2) {
      sound2.setVolume(isMuted ? 1.0 : 0.0);
      setIsMuted(!isMuted);
    }
  };
  const countNumberOfClaps = str => {
    const word = 'clap';
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = str.match(regex);
    return matches ? matches.length : 0;
  };
  const connectWebSocket = () => {
    // // console.log("mioefn");
    socket.current = io(API_BASE_URL);

    socket.current.on('connect', () => {
      // console.log("WebSocket connection established", labels, segmentPoints);

      // Send segment points after connection is established
      socket.current.emit('lesson-data', {segmentPoints, labels});
    });

    socket.current.on('disconnect', () => {
      // console.log("WebSocket connection closed");
      audioChunksRef.current = [];
      clearInterval(sendIntervalRef.current);
      connectWebSocket();
    });

    socket.current.on('error', error => {
      // console.error("WebSocket error:", error);
    });

    socket.current.on('segment-response', ({segmentIndex, response}) => {
      setResponseCame(prev => prev + 1);
      console.log(response);
      const updatedColors = [...customColorsRef.current];
      // Update the color at the specified index
      let newColor = '#E37365';
      // if (response.syllable === clapLesson[segmentIndex + (cycleCountRef.current - 1) * numberOfParts]) {
      if (response) {
        setCorrect(prev => prev + 1);
        newColor = '#A0D4C5';
        updatedColors[segmentIndex] = '#A0D4C5';
        customColorsRef.current = updatedColors;
      } else {
        updatedColors[segmentIndex] = newColor;
        customColorsRef.current = updatedColors;
      }

      // console.log(segmentIndex,response,labels.length-1)
      if (segmentIndex == labels.length - 1) {
        console.log('RESPONSE LAST');
        setLastCame(true);
      }
      // console.log("HELLO")
      console.log(`Segment ${segmentIndex}:`, response);
    });
    socket.current.on('segment-clap-response', ({segmentIndex, response}) => {
      setResponseCame(prev => prev + 1);
      console.log(segmentIndex, response, labels.length - 1);
      if (segmentIndex == labels.length - 1) {
        console.log('RESPONSE LAST');
        setLastCame(true);
      }
      // console.log(`Segment ${segmentIndex}:`, response);
      const updatedColors = [...customColorsRef.current];
      // Update the color at the specified index
      let newColor = '#E37365';
      if (
        response ==
        countNumberOfClaps(
          clapLesson[
            segmentIndex + (cycleCountRef.current - 1) * numberOfParts
          ],
        )
      ) {
        newColor = '#A0D4C5';
        setCorrect(prev => prev + 1);
      }
      updatedColors[segmentIndex] = newColor;

      // Set the updated array as the new state
      customColorsRef.current = updatedColors;
    });
    socket.current.on('overall-response', ({response}) => {
      feedback(response == 'T');
      console.log('RESPONSE FINAL: ', response);
    });
  };
  const feedback = ans => {
    if (true) {
      AudioRecord.stop();
      setIsRecording(false);
      navigation.replace('FeedbackScreen', {
        isCorrect: ans,
        id: id,
        type: 'with',
        save: route.params.save,
      });
    }
  };
  const handleReset = () => {
    AudioRecord.stop();
    // setIsRecording(false);
    navigation.replace('FeedbackScreen', {
      isCorrect: false,
      id: id,
      type: 'with',
      save: route.params.save,
    });
  };
  useEffect(() => {
    console.log('RESPONCE CAME: ', responseCame, correct);
    if (responseCame != 0 && responseCame == labels.length) {
      console.log('RESPONSE LENGTH', responseCame);
    } else if (lastCame) {
      console.log('LAST CAME', responseCame);
    }
  }, [responseCame, lastCame, correct]);

  useEffect(() => {
    if (!labels && !segmentPoints) {
      return;
    }

    connectWebSocket();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      // console.log("clearing-------------------------------");
      clearInterval(sendIntervalRef.current);
      audioChunksRef.current = [];
    };
  }, [labels, segmentPoints]);

  const initAudioRecord = () => {
    const options = {
      sampleRate: 22050,
      channels: 2,
      bitsPerSample: 16,
      wavFile: 'test.wav',
    };

    AudioRecord.init(options);

    AudioRecord.on('data', data => {
      if (index == 1) socket.current.emit('clap-chunk', data);
      else {
        socket.current.emit('audio-chunk', data);
      }
      // const chunk = Buffer.from(data, 'base64');
      // console.log('LENGTH OF CHUNK: ', chunk.length);
      // // Concatenate chunk to the current array of chunks
      // audioChunksRef.current = audioChunksRef.current.concat(chunk);
      // audioChunksRef.current.push(chunk);
    });
  };

  useEffect(() => {
    initAudioRecord();
  }, []);

  useEffect(() => {
    // Function to handle the hardware back button
    const backHandler = () => {
      // console.log("backhandler", isPlayingRef.current);
      if (isPlayingRef.current) {
        // Check if audio is playing
        Alert.alert(
          'Warning',
          'Audio is playing. Are you sure you want to go back?',
          [
            {
              text: 'Yes',
              onPress: () => {
                clearInterval(highlightIntervalRef.current);
                navigation.goBack();
              },
            },
            {
              text: 'No',
              onPress: () => {},
            },
          ],
        );
        return true; // Prevent default back action if audio is playing
      }

      if (isMuted) {
        muteSound();
      }

      clearInterval(highlightIntervalRef.current);
      return false; // If not recording, proceed with the default back action
    };

    // Attach the back handler to the hardware back button
    const backHandlerListener = BackHandler.addEventListener(
      'hardwareBackPress',
      backHandler,
    );

    // Clean up the listener when the component unmounts
    return () => backHandlerListener.remove();
  }, []);

  useState(() => {
    const fetchLessonInfo = async () => {
      try {
        // console.log("Fetching lesson info");
        const response = await fetch(`${API_BASE_URL}/get_standard_id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({id: id}),
        });
        // console.log("Waiting for lesson info");
        const data = await response.json();
        // console.log('Lesson Info:', data);
        const Lesson = data.data;

        // console.log("Lesson fetched");
        const totalBeats = Lesson.totalBeats;

        setTempo(Lesson.Tempo);
        let lyri = Lesson.labels
          ? Lesson.labels
          : Lesson.Lyrics
          ? Lesson.Lyrics
          : Array(totalBeats).fill('');
        if (index == 1) {
          lyri = lyri.map(item => {
            if (item === 'NONE') {
              return '';
            } else if (item === 'THA') {
              return 'Clap';
            } else if (item == 'TA') {
              return 'Clap Clap';
            } else {
              return item;
            }
          });
        }
        setClapLesson(lyri);
        setNumberOfParts(parseInt(Lesson.Beats));
        // setHighlightedInterval((60 / parseInt(Lesson.Tempo, 10)) * 1000);
        highlightInterval.current = (60 / parseInt(Lesson.Tempo, 10)) * 1000;
        setInitialOffset(parseInt(Lesson.Beats) / 2);
        customColorsRef.current = lyri.map(lyric =>
          lyric === '' ? '#AEAEAE' : '#F5D17D',
        );
        // customColorsRef.current = parseInt(Lesson.Beats) ? new Array(parseInt(Lesson.Beats)).fill('black') : [];
        setTotalCycles(Math.ceil(lyri.length / parseInt(Lesson.Beats)));
        // handleBeatsChange(parseInt(Lesson.Beats));
        // handleBPM(parseInt(Lesson.Tempo));
        setLabels(Lesson.labels);
        setSegmentPoints(Lesson.time_segments);
        setLesson(Lesson);
        // // console.log("total-----", lyri.length / parseInt(Lesson.Beats), labels, segmentPoints);
      } catch (error) {
        // console.error('Lesson Fetch Error:', error);
      }
    };
    fetchLessonInfo();
  }, []);

  const [sound1, setSound1] = useState(null);
  const [sound2, setSound2] = useState(null);
  const trimmedMetronome =
    'https://firebasestorage.googleapis.com/v0/b/project-k-f4ea9.appspot.com/o/audio-files%2F2024-07-01T14%3A04%3A15.443Z_Untitled_Project_V2.mp3?alt=media';

  useEffect(() => {
    // // console.log("I came", lesson);
    if (!lesson.audioFileURL) {
      return;
    }
    // // console.log("I came 2", lesson);
    Sound.setCategory('Playback');
    isPlayingRef.current = true;

    const sound1 = new Sound(lesson.audioFileURL, '', error => {
      if (error) {
        // console.log('failed to load the sound1', error);
        return;
      }
      setSound1(sound1);
      // console.log('sound1 loaded');
    });

    const metronomeFile = lesson.metronomeFileURL
      ? lesson.metronomeFileURL
      : trimmedMetronome;

    const sound2 = new Sound(metronomeFile, '', error => {
      if (error) {
        // console.log('failed to load the sound2', error);
        return;
      }
      setSound2(sound2);
      // console.log('sound2 loaded');
    });

    // Cleanup function to release the sounds when the component unmounts
    return () => {
      sound1.release();
      sound2.release();
    };
  }, [lesson]);

  useEffect(() => {
    // // console.log("Working");
    let timer;
    if (count > 0) {
      timer = setInterval(() => {
        setCount(prevCount => prevCount - 1);
      }, 1000);
    } else if (count === 0) {
      setCount(-1);
      handleTryPress();
    }

    return () => clearInterval(timer);
  }, [count]);

  useEffect(() => {
    let timer = null;
    if (sound1 && sound2) {
      sound1.setVolume(1);
      if (route.params.play) timer = setTimeout(playSounds, 1000);
      else {
        displayingCountdown();
      }
    }

    return () => clearTimeout(timer);
  }, [sound1, sound2]);

  const playSounds = () => {
    if (!sound1 || !sound2) {
      // console.log('Sounds not initialized');
      return;
    }
    setHighlightedIndex(-1);
    const duration1 = sound1.getDuration();
    const duration2 = sound2.getDuration();
    customColorsRef.current = clapLesson.map(lyric =>
      lyric === '' ? '#AEAEAE' : '#F5D17D',
    );
    isPlayingRef.current = true;
    cycleCountRef.current = 0;
    highlight();
    sound1.play(success => {
      if (!success) {
        isPlayingRef.current = false;
      } else {
        if (running.current) {
          console.log('sound1 played', running);
          setWait(true);
        }
        running.current = false;
        isPlayingRef.current = false;
        if (AudioRecord) {
          AudioRecord.stop();
        }
        sound2.stop();
        setIsRecording(false);
      }
    });

    sound2.play(success => {
      if (!success) {
        // console.log('playback failed due to audio decoding errors');
        isPlayingRef.current = false;
        cycleCountRef.current = 0;
        sound1.stop();
      }
    });
  };

  const handleListenAgain = () => {
    if (isPlayingRef.current) {
      return;
    }
    sound1.stop();
    sound2.stop();
    clearInterval(highlightIntervalRef.current);
    if (AudioRecord) {
      AudioRecord.stop();
    }
    setHighlightedIndex(-1);
    cycleCountRef.current = 0;
    isPlayingRef.current = true;
    cycleCountRef.current = 0;
    sound1.setVolume(1);
    const timer = setTimeout(playSounds, 1000);
  };

  const displayingCountdown = () => {
    isPlayingRef.current = true;
    // // console.log("changed");
    setCount(3);
  };

  const handleTryPress = () => {
    if (isRecording) {
      running.current = false;
      socket.current.emit('manual-disconnect');
      AudioRecord.stop();
      if (sound1) {
        sound1.stop();
      }
      if (sound2) {
        sound2.stop();
      }
      clearInterval(highlightIntervalRef.current);
      setHighlightedIndex(-1);
      setIsRecording(false);
      isPlayingRef.current = false;
      cycleCountRef.current = 0;
    } else {
      running.current = true;
      sound1.setVolume(0);
      playSounds();
      AudioRecord.start();
      setIsRecording(true);
    }
    // console.log("TRY button pressed");
  };

  const handleLoopPress = () => {
    // Add your logic here for handling the press of the "Loop" button
    // console.log("Loop button pressed");
  };
  const temp = () => {
    setHighlightedIndex(prevIndex => {
      const updatedColors = [...customColorsRef.current];
      // Update the color at the specified index
      let newColor = '#F5D17D';
      if (
        clapLesson[
          (prevIndex + cycleCountRef.current * numberOfParts) %
            clapLesson.length
        ] === ''
      ) {
        newColor = '#AEAEAE';
      }
      updatedColors[prevIndex] = newColor;
      // Set the updated array as the new state
      customColorsRef.current = updatedColors;
      const newIndex = (prevIndex + 1) % numberOfParts;
      if (lyricsScrollViewRef.current) {
        if (newIndex > 0)
          lyricsScrollViewRef.current.scrollTo({
            y: (newIndex + (cycleCountRef.current - 1) * numberOfParts) * 30,
            animated: true,
          });
        else
          lyricsScrollViewRef.current.scrollTo({
            y: (newIndex + cycleCountRef.current * numberOfParts) * 30,
            animated: true,
          });
      }
      if (
        (prevIndex + cycleCountRef.current * numberOfParts) %
          (totalCycles * numberOfParts) >=
        clapLesson.length
      ) {
        cycleCountRef.current += 1;
      }
      if (
        (prevIndex + (cycleCountRef.current - 1) * numberOfParts) %
          (totalCycles * numberOfParts) >=
        clapLesson.length
      ) {
        cycleCountRef.current -= 1;
      }
      if (
        newIndex + (cycleCountRef.current - 1) * numberOfParts >=
        clapLesson.length
      ) {
        clearInterval(highlightIntervalRef.current);
        isPlayingRef.current = false;
        if (lyricsScrollViewRef.current) {
          lyricsScrollViewRef.current.scrollTo({y: 0, animated: true});
        }
        setHighlightedIndex(-1);
        cycleCountRef.current = 0;
        return newIndex;
      }
      if (newIndex === 0) {
        cycleCountRef.current += 1;
        if (cycleCountRef.current > totalCycles) {
          // console.log("Stopped2");
          clearInterval(highlightIntervalRef.current);
          isPlayingRef.current = false;
          setHighlightedIndex(-1);
          cycleCountRef.current = 0;
          return newIndex;
        }
      }

      return newIndex;
    });
  };
  const highlight = () => {
    setHighlightedIndex(-1);
    temp();
    highlightIntervalRef.current = setInterval(() => {
      temp();
    }, highlightInterval.current);
  };

  const updateCurrentSlideIndex = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  return sound1 && sound2 ? (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.metronomeToggleContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headingContainer}>
            <Text style={styles.metronomeLabel}>Metronome</Text>
            <Switch
              style={{marginRight: 24}}
              value={!isMuted}
              onValueChange={muteSound}
              trackColor={{false: '#fff', true: '#000'}}
              thumbColor={isMuted ? '#fff' : '#fff'}
            />
          </View>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <FlatList
            ref={ref}
            onMomentumScrollEnd={updateCurrentSlideIndex}
            contentContainerStyle={{height: height * 0.5}}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={slides}
            pagingEnabled
            renderItem={({item}) => (
              <RenderSlide
                item={item}
                numberOfParts={numberOfParts}
                highlightedIndex={highlightedIndex}
                initialOffset={initialOffset}
                customColors={customColorsRef.current}
                lyricsScrollViewRef={lyricsScrollViewRef}
                clapLesson={clapLesson}
                cycleCountRef={cycleCountRef}
                totalCycles={totalCycles}
                Lyrics={clapLesson}
                count={count}
              />
            )}
            keyExtractor={item => item.id.toString()}
          />
          <PaginationDots currentIndex={currentIndex} slides={slides} />
        </View>
        <View style={styles.centerContainer}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              gap: 30,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={handleListenAgain}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isPlayingRef.current ? 0.5 : 1.0,
              }}>
              <Text
                style={{
                  fontWeight: '200',
                  fontSize: 18,
                  marginRight: 10,
                  color: 'black',
                }}>
                Replay
              </Text>
              <Image source={require('../assets/images/retry.png')} />
            </TouchableOpacity>
          </View>

          {isRecording ? (
            <Button
              style={styles.listenAgainButton}
              onPress={handleReset}
              // disabled={isPlayingRef.current}
            >
              STOP
            </Button>
          ) : (
            <Button
              style={styles.listenAgainButton}
              onPress={displayingCountdown}
              disabled={isPlayingRef.current || wait}>
              {wait ? 'Fetching Result..' : 'TRY'}
            </Button>
          )}
          {
            //  !isRecording && <Text style={{color:'black',fontSize:20,marginTop:-15}}>Use headphones for better result</Text>
          }
        </View>
        {/* Render button to toggle full-screen mode */}
      </ScrollView>
    </SafeAreaView>
  ) : (
    <LoadingScreen />
  );
};
const styles = StyleSheet.create({
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    gap: 10,
    width: '100%',
  },
  listenAgainButton: {
    backgroundColor: '#000',
    margin: 20,
    paddingVertical: 20,
    borderRadius: 12,
    width: '90%',
    borderColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: '#000',
    fontSize: 18,
    width: 40,
    fontWeight: '200',
    textAlign: 'center',
  },
  metronomeToggleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    zIndex: 1,
  },
  headingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metronomeLabel: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginRight: 12,
  },
});

export default LessonWithMetronome;
