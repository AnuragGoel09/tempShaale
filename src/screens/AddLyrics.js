import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Layout, Input, Button } from '@ui-kitten/components';
import { API_BASE_URL } from '../config';
import { useRoute } from '@react-navigation/native';
const AddLyrics = ({ navigation }) => {

  const route = useRoute();
  const lessonId = route.params?.lessonId;
  const isStandard = route.params?.isStandard;
  console.log("Lesson ID:", lessonId, "Is Standard:", isStandard);
  const [lyrics, setLyrics] = useState(Array.from({ length: totalBeats }, () => ''));
  const [beats, setBeats] = useState(0);
  const [totalBeats, setTotalBeats] = useState(0);
  const [Lyrics, setFetchedLyrics] = useState(null);
  const [fetchedLesson, setFetchedLesson] = useState(null);
  // useEffect(() => {
  //   // Initialize lyrics state with empty strings for each beat
  //   setLyrics(Array(numberOfBeats).fill(''));
  // }, [numberOfBeats]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     try {
  //       console.log("lessonId", lessonId)
  //       const res = await fetch(
  //         `${API_BASE_URL}/get_id`,
  //         {
  //           method: 'POST',
  //           body: { id: lessonId },
  //         },
  //       );
  //       // const resData = await res.json();
  //       console.log("resss", res);
  //     } catch (err) {
  //       console.log("err", err.message);
  //     }
  //   }
  //   fetch();
  // }, [])

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const endPoint = isStandard ? 'get_standard_id' : 'get_id';
        // console.log("lessonId", lessonId)
        const response = await fetch(
          `${API_BASE_URL}/${endPoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: lessonId }),
          }
        );
        const data = await response.json();
        console.log("Response in add lyrics:", data);
        setFetchedLesson(data.data);
        setBeats(data.data.Beats);
        setTotalBeats(data.data.totalBeats);
        setLyrics(data.data.Lyrics ? data.data.Lyrics : Array.from({ length: data.data.totalBeats }, () => ''));
        console.log("Beats:", data.data.Beats, "Total beats:", totalBeats, "Lyrics:", Lyrics);
      } catch (error) {
        console.log("Error:", error.message);
      }
    };
    fetchLesson();
  }, []);

  useEffect(() => {
    console.log("Lyrics:", Lyrics);
    if (Lyrics) {
      const newLyrics = [];
      for (let i = 0; i < totalBeats; i++) {
        newLyrics.push(Lyrics[i]);
      }
      setLyrics(newLyrics);
    }
  }, [])

  // Function to handle lyrics change for each beat
  const handleLyricsChange = (text, index) => {
    const newLyrics = [...lyrics];
    newLyrics[index] = text;
    setLyrics(newLyrics);
  };

  const postLyrics = async () => {
    try {
      console.log('Posting lyrics:', lyrics);
      const formattedLyrics = {};

      lyrics.forEach((beat, index) => {
        formattedLyrics[`beat${index + 1}`] = beat;
      });

      console.log('Formatted lyrics:', formattedLyrics);

      const endPoint = isStandard ? 'add_lyrics_auth' : 'add_lyrics'

      const response = await fetch(`${API_BASE_URL}/${endPoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: lessonId,
          lyrics: formattedLyrics,
        }),
      });
      console.log('Response:', response);
      if (response.ok) {
        Alert.alert('Success', 'Lyrics added successfully');
        navigation.goBack();
      } else {
        console.log('Response status:', response.status);
        Alert.alert('Error', 'Failed to add lyrics');
      }
    } catch (error) {
      console.error('Error adding lyrics:', error);
      Alert.alert('Error', 'Failed to add lyrics');
    }
  };

  const addLyrics = () => {
    console.log("Lyrics added:", lyrics);
  }

  return (
    <Layout style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.heading}>Add Lyrics</Text>
      </View> */}

      <Text style={styles.subheading}>Rules:</Text>
      <View style={styles.ruleContainer}>
        <Text style={styles.ruleText}>1. If there is a rider, mark it with a #</Text>
        <Text style={styles.ruleText}>2. If gaps, mark it with x</Text>
        <Text style={styles.ruleText}>3. Give space between each syllable.</Text>
      </View>

      <Text style={styles.subheading}>Lyrics:</Text>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 80}
      >
        <ScrollView style={styles.lyricsContainer}>
          {lyrics.map((lyric, index) => (
            <View key={index} style={styles.lyricsRow}>
              <Text style={styles.beatNumber}>{(index % beats) + 1}</Text>
              <Input
                style={styles.lyricsInput}
                placeholder='Enter lyrics'
                value={lyric}
                onChangeText={(text) => handleLyricsChange(text, index)}
              />
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <Button style={styles.addLyricsButton} onPress={postLyrics}>
        Add Lyrics
      </Button>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 32,
    textAlign: 'center',
    color: '#000',
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#000',
  },
  ruleContainer: {
    marginTop: 10,
    color: '#000',
  },
  ruleText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
  },
  lyricsContainer: {
    marginTop: 10,
  },
  lyricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  beatNumber: {
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  lyricsInput: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 5,
    padding: 8,
    fontSize: 16,
    color: '#000',
  },
  // lyricsInput: {
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   padding: 8,
  //   borderRadius: 5,
  //   marginBottom: 10,
  //   fontSize: 16,
  //   color: '#000',
  // },
  addLyricsButton: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
    marginHorizontal: 8,
    // marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
});

export default AddLyrics;
