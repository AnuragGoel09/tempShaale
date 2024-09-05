import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  BackHandler,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Card,
  Layout,
  Button,
  Modal,
  Select,
  SelectItem,
  Toggle,
} from '@ui-kitten/components';
import Sound from 'react-native-sound';
import {API_BASE_URL} from '../config';
import {MetronomeContext} from '../Context/MetrnomeContext';

const LessonDetails = ({route, navigation}) => {
  const {lesson} = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  // const [sound, setSound] = useState(null);
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(lesson.Title);
  const [isMuted, setIsMuted] = useState(false); // const [metronomeToggle, setMetronomeToggle] = useState(false);
  // const { startMetronome, loadSound, stopMetronome, setIsRecord, beatNumber, setContextBeats, setContextTempo, setMetronomeDefault, isTimer, setToggleMetronome, setIsTimer, setBeatNumber } = useMetronome();
  const {
    bpm,
    playing,
    currentBeat,
    beatsPerCycle,
    handleBPM,
    startStop,
    handleBeatsChange,
    firstCycle,
    soundOn,
    toggleSound,
  } = useContext(MetronomeContext);

  const playingRef = useRef(playing);
  // const soundOnRef = useRef(soundOn);
  const screenWidth = Dimensions.get('window').width;

  const [sound1, setSound1] = useState(null);
  const [sound2, setSound2] = useState(null);
  const trimmedMetronome =
    'https://firebasestorage.googleapis.com/v0/b/project-k-f4ea9.appspot.com/o/audio-files%2F2024-07-01T14%3A04%3A15.443Z_Untitled_Project_V2.mp3?alt=media';

  const muteSound = () => {
    if (sound2) {
      sound2.setVolume(isMuted ? 1.0 : 0.0);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    console.log('I came', lesson);
    Sound.setCategory('Playback');

    const sound1 = new Sound(lesson.audioFileURL, '', error => {
      if (error) {
        console.log('failed to load the sound1', error);
        return;
      }
      setSound1(sound1);
      console.log('sound1 loaded');
    });

    // const notTrimmed_nm_url = "https://firebasestorage.googleapis.com/v0/b/project-k-f4ea9.appspot.com/o/audio-files%2F2024-06-29T14%3A26%3A36.711Z_nm.wav?alt=media"
    // const trimmed_nm_url = "https://firebasestorage.googleapis.com/v0/b/project-k-f4ea9.appspot.com/o/audio-files%2F2024-07-01T06%3A07%3A07.202Z_nm_trimmed_v1.mp3?alt=media"

    const metronomeFile = lesson.metronomeFileURL
      ? lesson.metronomeFileURL
      : trimmedMetronome;
    console.log('MetronomeFile', metronomeFile);

    const sound2 = new Sound(metronomeFile, '', error => {
      if (error) {
        console.log('failed to load the sound2', error);
        return;
      }
      setSound2(sound2);
      console.log('sound2 loaded');
    });

    // Wait for both sounds to load, then play them in sync

    // Cleanup function to release the sounds when the component unmounts
    return () => {
      sound1.release();
      sound2.release();
    };
  }, []);

  // useEffect(() => {
  //   playingRef.current = playing;
  // }, [playing]);
  // useEffect(() => {
  //   soundOnRef.current = soundOn;
  // }, [soundOn]);
  // useEffect(() => {
  //   // loadSound();
  //   // setIsRecord(false);
  //   handleBPM(parseInt(lesson.Tempo));
  //   handleBeatsChange(parseInt(lesson.Beats));
  //   // setContextBeats(lesson.Beats);
  //   // setContextTempo(lesson.Tempo);
  //   // setToggleMetronome(metronomeToggle);
  // }, [])

  useEffect(() => {
    // Function to handle the hardware back button
    const backHandler = () => {
      console.log('backhanfler', isPlaying, playingRef.current);
      if (isPlaying || playingRef.current) {
        Alert.alert(
          'Warning',
          'Audio is playing. Are you sure you want to go back?',
          [
            {
              text: 'Yes',
              onPress: () => {
                // if (playingRef.current) {
                //   startStop();
                // }
                if (sound1) {
                  sound1.release();
                  setIsPlaying(false);
                }
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
      // if (!soundOnRef.current) {
      //   toggleSound();
      // }
      if (isMuted) {
        muteSound();
      }
      // Check if recording is in progress
      // setContextBeats('0');
      // setContextTempo('0');
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

  useEffect(() => {
    fetchViews();
    // return () => {
    //   if (sound1) {
    //     sound1.release();  // Release the sound when the component is unmounted
    //     sound2.release();
    //     // stopMetronome(false);
    //     console.log("Enteted useEffec", playing);
    //     // if (playing) {
    //     //   startStop();
    //     // }
    //     // setIsTimer(false);
    //     // setBeatNumber(0);
    //     // setMetronomeDefault();
    //   }
    // };
  }, []);

  useEffect(() => {
    // Set the initial value for selectedView when the component mounts
    if (views.length > 0 && !selectedView) {
      setSelectedView(views[0]);
    }
  }, [views, selectedView]);

  // Function to play the audio file
  const playAudio = () => {
    if (!sound1 && !sound2) {
      return;
    }
    // if (isPlaying) {
    //   return; // Avoid playing if already playing
    // }

    // const newSound = new Sound(lesson.audioFileURL, '', (error) => {
    //   if (error) {
    //     console.log('Failed to load the sound', error);
    //     return;
    //   }
    //   if (lesson.Beats > 0) {
    //     console.log("PlayingSS", playingRef.current);
    //     // startMetronome();
    //     startStop();
    //     console.log("PlayingSS", playingRef.current);
    //   }
    //   console.log("Playingggg", playingRef.current);
    //   newSound.play((success) => {

    //     if (success) {
    //       console.log('Audio Successfully finished playing');
    //       console.log("PlayingS", playingRef.current);
    //       if (playingRef.current) {
    //         startStop();
    //       }
    //     } else {
    //       console.log('Playback failed due to audio decoding errors');
    //     }

    //     setIsPlaying(false);
    //     // if (lesson.Beats > 0) {
    //     // stopMetronome();
    //     console.log("Playing", playingRef.current);

    //     // }
    //   });
    // });

    // setSound(newSound);
    setIsPlaying(true);

    sound1.play(success => {
      if (!success) {
        console.log('playback failed due to audio decoding errors');
      } else {
        console.log('sound1 played');
        setIsPlaying(false);
        sound2.stop();
      }
    });
    sound2.play(success => {
      if (!success) {
        console.log('playback failed due to audio decoding errors');
      }
    });
  };

  // Function to pause the audio file
  const pauseAudio = () => {
    console.log('noiand');
    if (sound1 && isPlaying) {
      sound1.stop();
      sound2.stop();
      console.log('PauseAudio', playing);
      // stopMetronome();
      // if (playing) {
      //   startStop();
      // }
      setIsPlaying(false);
    }
  };

  // Function to fetch the views data from the server
  const fetchViews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_views`);
      const result = await response.json();
      setViews(result);
    } catch (error) {
      console.error('Fetch Views Error:', error);
    }
  };

  // Function to move the lesson to the selected view
  const moveLessonToView = async () => {
    if (!selectedView) {
      // Handle case when no view is selected
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/shift_to_standard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lesson.id,
          LessonId: selectedView.lesson_id,
        }),
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        Alert.alert('Success', 'Lesson moved successfully', [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              navigation.navigate('Unorganized Lessons'); // Navigate back to UnorganizedLessons
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to move lesson');
      }
    } catch (error) {
      console.error('Move Lesson Error:', error);
      Alert.alert('Error', 'Failed to move lesson');
    }
  };

  const editLessonTitle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit_unauthlesson`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lesson.id,
          Title: newTitle,
        }),
      });
      const result = await response.json();
      console.log('Edit Lesson Title Response:', result); // Add this line
      if (response.ok) {
        Alert.alert('Success', 'Lesson title updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              setEditModalVisible(false);
              lesson.Title = newTitle;
              navigation.setParams({lesson});
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update lesson title');
      }
    } catch (error) {
      console.error('Edit Lesson Title Error:', error);
      Alert.alert('Error', 'Failed to update lesson title');
    }
  };

  // Function to render the view items in the modal
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.viewItem,
        selectedView && selectedView.lesson_id === item.lesson_id
          ? styles.selectedItem
          : null,
      ]}
      onPress={() => setSelectedView(item)}>
      <Text
        style={[
          styles.itemText,
          selectedView && selectedView.lesson_id === item.lesson_id
            ? styles.selectedItemText
            : null,
        ]}>
        {item.lesson_title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Lesson Information</Text>
        <Text style={styles.headerDisplay}>
          ID: <Text style={styles.info}>{lesson.id}</Text>
        </Text>
        <Text style={styles.headerDisplay}>
          Title: <Text style={styles.info}>{lesson.Title}</Text>
        </Text>
        <Text style={styles.headerDisplay}>
          Tempo: <Text style={styles.info}>{lesson.Tempo}</Text>
        </Text>
        {/* <Text style={styles.headerDisplay}>Time Cycle: <Text style={styles.info}>{lesson.TimeCycle}</Text></Text> */}
        <Text style={styles.headerDisplay}>
          Beats: <Text style={styles.info}>{lesson.Beats}</Text>
        </Text>
        {/* <Text style={styles.headerDisplay}>Complexity Level: <Text style={styles.info}>{lesson.Complexity}</Text></Text> */}
        {/* <Text style={styles.headerDisplay}>Composer: <Text style={styles.info}>{lesson.Composer}</Text></Text> */}
        {/* <Text style={styles.headerDisplay}>Posted By: <Text style={styles.info}>{lesson.PostedBy}</Text></Text> */}
        <Text style={styles.headerDisplay}>
          Total Beats: <Text style={styles.info}>{lesson.totalBeats}</Text>
        </Text>
        {/* <Text style={styles.headerDisplay}>Tags: <Text style={styles.info}>{lesson.Tags.join(', ')}</Text></Text> */}
        <Text style={styles.headerDisplay}>
          Timestamp:{' '}
          <Text style={styles.info}>
            {new Date(lesson.timestamp._seconds * 1000).toLocaleString()}
          </Text>
        </Text>
        {/* Add more details as needed */}
      </View>

      {/* Audio controls */}
      <View style={styles.audioContainer}>
        <Button
          style={styles.audioButton}
          onPress={playAudio}
          disabled={isPlaying || !sound1 || !sound2}>
          Play Audio
        </Button>
        <Button
          style={styles.audioButton}
          onPress={pauseAudio}
          disabled={!isPlaying}>
          Stop Audio
        </Button>
      </View>

      {/* Add Lyrics button */}
      <Button
        style={styles.addLyricsButton}
        onPress={() => {
          navigation.navigate('AddLyrics', {
            lessonId: lesson.id,
            isStandard: false,
          });
        }}>
        Add Lyrics
      </Button>

      {/* "Edit Title" button */}
      <Button
        style={styles.editButton}
        onPress={() => setEditModalVisible(true)}>
        Edit Title
      </Button>

      {/* "Move To" button */}
      <Button style={styles.moveButton} onPress={() => setModalVisible(true)}>
        Move To
      </Button>

      {/* Metronome Toggle */}
      <View style={styles.metronomeToggleContainer}>
        <Toggle checked={!isMuted} onChange={muteSound}>
          <Text style={styles.metronomeLabel}>
            {!isMuted ? 'Metronome ON' : 'Metronome OFF'}
          </Text>
        </Toggle>
      </View>

      {/* Modal for selecting views */}
      <Modal
        visible={modalVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setModalVisible(false)}
        animationType="slide">
        <View style={[styles.modalContainer, {width: screenWidth * 0.75}]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a View</Text>
            <FlatList
              data={views}
              keyExtractor={item => item.lesson_id.toString()}
              renderItem={renderItem}
              style={{marginBottom: 20}}
            />
            <Button style={styles.modalButton} onPress={moveLessonToView}>
              Move Lesson
            </Button>
            <Button
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Modal for editing lesson title */}
      <Modal
        visible={editModalVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setEditModalVisible(false)}
        animationType="slide">
        <View style={[styles.modalContainer, {width: screenWidth * 0.75}]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Lesson Title</Text>
            <TextInput
              style={styles.input}
              onChangeText={setNewTitle}
              value={newTitle}
              placeholder="Enter new title"
            />
            <Button style={styles.modalButton} onPress={editLessonTitle}>
              Save
            </Button>
            <Button
              style={styles.modalButton}
              onPress={() => setEditModalVisible(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 16,
  },
  infoContainer: {
    padding: 16,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  headerDisplay: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
    color: '#333',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'normal',
    color: '#555',
  },
  audioContainer: {
    alignItems: 'center',
    marginTop: 10,
    // width: '100%',
  },
  audioButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginBottom: 12,
    width: '70%',
    borderRadius: 12,
    elevation: 3,
  },
  metronomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  metronomeLabel: {
    fontSize: 18,
    marginRight: 12,
  },
  modalButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  moveButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginBottom: 12,
    width: '70%',
    alignSelf: 'center',
    borderRadius: 12,
    elevation: 3,
  },
  addLyricsButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginBottom: 12,
    width: '70%',
    alignSelf: 'center',
    borderRadius: 12,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginBottom: 12,
    width: '70%',
    alignSelf: 'center',
    borderRadius: 12,
    elevation: 3,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    // width: '150%',
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 8,
    color: '#000',
  },
  viewItem: {
    padding: 10,
    color: '#000',
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  selectedItem: {
    backgroundColor: '#232b2b',
    borderRadius: 10,
  },
  selectedItemText: {
    color: '#fff',
  },
  metronomeToggleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default LessonDetails;
