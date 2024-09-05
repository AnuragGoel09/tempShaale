import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Input, Button, Modal } from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/AntDesign';
import Slider from '@react-native-community/slider';
import { API_BASE_URL } from '../config';

// Function to display the Upload Lesson Screen
const UploadLessonScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [tempo, setTempo] = useState(80);
  const [beats, setBeats] = useState(4);
  const [totalBeats, setTotalBeats] = useState(8);
  const [audioFile, setAudioFile] = useState(null);
  const [metronomeFile, setMetronomeFile] = useState(null);
  const [docid, setDocid] = useState('');
  const [modalVisible, setModalVisible] = useState(false);  // State to control the modal visibility
  const [uploading, setUploading] = useState(false);  // State to control the uploading status

  // Function to select an audio file
  const selectAudioFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });
      console.log('Selected File:', res);
      setAudioFile(res);
      if (res[0]?.name) {   // Extract title from the file name (excluding extension)
        const fileName = res[0].name;
        const titleWithoutExtension = fileName.split('.').slice(0, -1).join('.');
        setTitle(titleWithoutExtension);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Canceled');
      } else {
        Alert.alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  // Function to select a metronome file
  const selectMetronomeFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });
      console.log('Selected Metronome File:', res);
      setMetronomeFile(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Canceled');
      } else {
        Alert.alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  // Function to handle the upload of the lesson
  const handleUpload = async () => {
    if (!audioFile) {  // Check if an audio file is selected
      Alert.alert('Error', 'Please select an audio file.');
      return;
    }
    if (!title) {  // Check if a title is provided
      Alert.alert('Error', 'Please provide a title.');
      return;
    }
    setUploading(true);

    let formData = new FormData();
    formData.append("Title", title);
    formData.append("Tempo", tempo);
    formData.append("Beats", beats);
    formData.append('audioFile', {
      uri: audioFile[0].uri,
      type: audioFile[0].type,
      name: audioFile[0].name,
    });
    formData.append("totalBeats", totalBeats);

    if (metronomeFile) {
      formData.append('metronomeFile', {
        uri: metronomeFile[0].uri,
        type: metronomeFile[0].type,
        name: metronomeFile[0].name,
      });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/add_to_unauth`, {
        method: 'POST',
        body: formData,
      });
      const resData = await res.json();
      console.log("Response in upload screen:", resData);
      setDocid(resData.docid);
      setModalVisible(true);
    } catch (err) {
      console.log(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Function to reset the form fields
  const resetForm = () => {
    setTitle('');
    setTempo(80);
    setBeats(4);
    setTotalBeats(8);
    setAudioFile(null);
    setMetronomeFile(null);
    setDocid('');
  };  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>Upload a new lesson</Text>

          {/* Audio File Selection */}
          <Button style={styles.selectAudioButton} onPress={selectAudioFile}>Select Audio File</Button>
          {audioFile && audioFile[0]?.name && <Text style={styles.selectedAudio}>Selected Audio: {audioFile[0].name}</Text>}

          {/* Metronome File Selection */}
          <Button style={styles.selectAudioButton} onPress={selectMetronomeFile}>Select Metronome File</Button>
          {metronomeFile && metronomeFile[0]?.name && <Text style={styles.selectedAudio}>Selected Metronome: {metronomeFile[0].name}</Text>}
          
          {/* Title */}
          <Input
            style={{ marginBottom: 14 }}
            placeholder='Lesson Title'
            value={title}
            onChangeText={setTitle}
          />

          {/* Tempo */}
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ marginBottom: 10, color: '#000' }}>Tempo: </Text>
            <Input
              style={{ marginBottom: 10 }}
              placeholder='.......'
              value={tempo.toString()}
              onChangeText={(val) => setTempo(Number(val))}
              keyboardType='numeric'
            />
          </View>

          {/* Tempo Slider */}
          <View style={{ marginBottom: 10 }}>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={200}
              step={1}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#000000"
              thumbTintColor="#000000"
              value={tempo}
              onValueChange={(value) => setTempo(value)}
            />
          </View>

          {/* Beats */}
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#000' }}>Beats: </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { if (beats > 1) setBeats(beats - 1) }} style={styles.iconButton}>
                <Icon name="minus" size={20} color="black" />
              </TouchableOpacity>
              <Input
                placeholder='...'
                value={beats.toString()}
                onChangeText={(val) => setBeats(Number(val))}
                keyboardType='numeric'
              />
              <TouchableOpacity onPress={() => setBeats(beats + 1)} style={styles.iconButton}>
                <Icon name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Total Beats */}
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#000' }}>Total Beats: </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { if (totalBeats > 1) setTotalBeats(totalBeats - 1) }} style={styles.iconButton}>
                <Icon name="minus" size={20} color="black" />
              </TouchableOpacity>
              <Input
                placeholder='.....'
                value={totalBeats.toString()}
                onChangeText={(val) => setTotalBeats(Number(val))}
                keyboardType='numeric'
              />
              <TouchableOpacity onPress={() => setTotalBeats(totalBeats + 1)} style={styles.iconButton}>
                <Icon name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <Button style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
            {uploading ? (
                <Text style={{ marginLeft: 10, color: '#ffffff' }}><ActivityIndicator size="small" color="#ffffff"/>  Uploading...</Text>
            ) : (
              'Upload Lesson'
            )}
          </Button>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              resetForm();
            }}
            backdropStyle={styles.backdrop}
            onBackdropPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}>
                  <Icon name="close" size={18} color="black" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Lesson Successfully Uploaded!</Text>
                <Button
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                    navigation.replace('AddLyrics', { lessonId: docid });
                  }}
                >
                  Add Lyrics
                </Button>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 27,
    color: '#000',
    textAlign: 'center'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginHorizontal: 8,
    marginBottom: 12,
    marginTop: 12,
    borderRadius: 12,
    elevation: 3,
  },
  iconButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 10,
  },
  selectAudioButton: {
    marginBottom: 12,
    borderRadius: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  selectedAudio: {
    marginVertical: 6,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  uploadButton: {
    marginBottom: 12,
    borderRadius: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay color
  },
});

export default UploadLessonScreen;