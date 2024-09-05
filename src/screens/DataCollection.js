import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Select, SelectItem, Button, Input, IndexPath } from '@ui-kitten/components';
import { useRecord } from '../Context/RecordContext';
import { useFocusEffect } from '@react-navigation/native';
import Sound from 'react-native-sound';
import { API_BASE_URL } from '../config';

const DataCollection = () => {
	const [lessonUploaded, setLessonUploaded] = useState(false);
	const [selectedSyllableIndex, setSelectedSyllableIndex] = useState(new IndexPath(0));
	const [age, setAge] = useState('');
	const [gender, setGender] = useState('');
	const [paused, setPaused] = useState(true);
	const [formValid, setFormValid] = useState(false);
	const { initAudioRecord, audioFile, loaded, setLoaded, recording, hasRecorded, setRecordDefault, startRecord, handleStopRecording, setHasRecorded, setAudioFile } = useRecord();
	let sound1 = null;
	const [recSound, setRecSound] = useState();

	const syllableSet = ["THA", "DHI", "THOM", "NAM", "KA", "KI", "KU", "TA", "GI", "NA", "JHA", "NU", "RI", "THAAM", "MI", "THA LAANGU", "DHIN", "DHIM"];
	const [selectedSyllable, setSelectedSyllable] = useState(syllableSet[selectedSyllableIndex.row]);

	const startStopRecording = () => {
		if (!recording) {
			startRecord();
		}
		else {
			handleStopRecording();
		}
	};

	useEffect(() => {
		const backHandler = () => {
			if (recording) {
				handleStopRecording();
			}
			setRecordDefault();
			setHasRecorded(false);
			return false;
		};

		const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', backHandler);

		return () => backHandlerListener.remove();
	}, [recording]);

	useEffect(() => {
		setFormValid(age !== '' && gender !== '' && selectedSyllable !== '');
	}, [age, gender, selectedSyllable]);

	useEffect(() => {
		initAudioRecord();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			// Reset form and other state variables when screen gains focus
			setAge('');
			setGender('');
			setSelectedSyllable(syllableSet[0]);
			setSelectedSyllableIndex(new IndexPath(0)); // Reset the selected syllable index
			setLoaded(false);
			setHasRecorded(false);
			setPaused(true);
			setAudioFile(null);
		}, [])
	);

	const load = () => {
		return new Promise((resolve, reject) => {
			if (!audioFile) {
				return reject('file path is empty');
			}

			sound1 = new Sound(audioFile, '', error => {
				if (error) {
					console.log('failed to load the file', error);
					return reject(error);
				}
				setLoaded(true);
				setRecSound(sound1);
				return resolve();
			});
		});
	};

	const pause = () => {
		// Pause the recorded audio when the "Pause" button is pressed
		console.log("Pause");
		recSound.pause();
		setLoaded(false);
		setPaused(true);
	};

	const handleTogglePlayback = async () => {
		if (!loaded) {
			try {
				await load();
			} catch (error) {
				console.log(error);
			}
		}
		setPaused(false);
		Sound.setCategory('Playback');
		sound1.play(success => {
			if (success) {
				console.log('successfully finished playing');
			} else {
				console.log('playback failed due to audio decoding errors');
			}
			setLoaded(false);
			setPaused(true);
		});
	};

	const handleUpload = async () => {
		let bodyContent = new FormData();
		if (selectedSyllable == "THA LAANGU") {
			bodyContent.append("syllable", "THALAANGU");
		}
		else {
			bodyContent.append("syllable", selectedSyllable);
		}
		bodyContent.append("gender", gender);
		bodyContent.append("age", age);
		bodyContent.append('audioFile', {
			uri: 'file://' + audioFile,
			type: 'audio/wave',
			name: `${selectedSyllable}_userRecording.wav`,
		});

		try {
			const res = await fetch(
				`${API_BASE_URL}/add_one_syllable_recording`,
				{
					method: 'POST',
					body: bodyContent,
				},
			);

			const resData = await res.json();

			console.log(resData);
		} catch (err) {
			console.log(err.message);
		}
		setRecordDefault();
		setLessonUploaded(true);
		handleNextSyllable();
		setTimeout(() => {
			setLessonUploaded(false);
		}, 1500);
	};

	// Function to move to the next syllable
	const handleNextSyllable = () => {
		if (selectedSyllableIndex.row + 1 < syllableSet.length) {
			selectedSyllableIndex.row = selectedSyllableIndex.row + 1;
			setSelectedSyllableIndex(selectedSyllableIndex);
			setSelectedSyllable(syllableSet[selectedSyllableIndex.row]);
		}
	};

	return (
		<>
			<View style={styles.container}>
				{/* Age Input */}
				<View style={{ marginBottom: 10 }}>
					<Text style={{
						fontSize: 16,
						fontWeight: 400,
						marginVertical: 8,
						color: 'black'
					}}>Age</Text>

					<Input
						placeholder='Enter your age'
						keyboardType='numeric'
						value={age}
						onChangeText={text => setAge(text)}
						onSubmitEditing={() => Keyboard.dismiss()}
					/>
				</View>

				{/* Gender Input */}
				<View style={{ marginBottom: 20 }}>
					<Text style={{
						fontSize: 16,
						fontWeight: 400,
						marginVertical: 8,
						color: 'black'
					}}>Gender</Text>

					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{['Male', 'Female', 'Other'].map((option) => (
							<TouchableOpacity
								key={option}
								style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
								onPress={() => setGender(option)}
							>
								<View
									style={{
										height: 24,
										width: 24,
										borderRadius: 12,
										borderWidth: 1,
										borderColor: 'black',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{gender === option && (
										<View
											style={{
												height: 12,
												width: 12,
												borderRadius: 6,
												backgroundColor: 'black'
											}}
										/>
									)}
								</View>
								<Text style={{ marginLeft: 8, color: 'black' }}>{option}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Syllable Input */}
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' }}>
					<Select
						label="Syllable"
						selectedIndex={selectedSyllableIndex}
						// onSelect={handleSelectSyllable}
						onSelect={(index) => {
							setSelectedSyllableIndex(index);
							setSelectedSyllable(syllableSet[index.row]);
						}}
						style={{ flex: 1 }}
						value={selectedSyllable || 'Select Syllable'}
					>
						{syllableSet.map((option, index) => (
							<SelectItem key={index} title={option} />
						))}
					</Select>
					{/* Next Button */}
					<Button style={styles.nextButton} onPress={handleNextSyllable} disabled={selectedSyllableIndex.row === syllableSet.length - 1}
					>
						Next
					</Button>
				</View>

				<View style={styles.playbackContainer}>
					<Button
						onPress={startStopRecording}
						style={styles.playButton}
						disabled={!formValid}
					>{recording ? "Stop Recording" : "Record"}</Button>
					{(hasRecorded && !recording) && <>
						{paused ? (
							<Button style={styles.playButton} onPress={handleTogglePlayback} disabled={!audioFile}>
								Play
							</Button>
						) : (
							<Button style={styles.pauseButton} onPress={pause} disabled={!audioFile}>
								Pause
							</Button>
						)}
						<Button style={styles.uploadButton} onPress={handleUpload} disabled={!audioFile}>
							Upload
						</Button>
					</>}
					{/* Next Button */}

				</View>
			</View>

			{/* Display success message if lesson uploaded */}
			{lessonUploaded && (
				<View style={styles.successMessageContainer}>
					<Text style={styles.successMessage}>Lesson uploaded successfully!</Text>
				</View>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// justifyContent: 'center',
		padding: 20,
	},
	input: {
		height: 40,
		borderColor: '#ccc',
		borderWidth: 1,
		marginBottom: 10,
		paddingLeft: 10,
	},
	playbackContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
		marginTop: 16,
	},
	playButton: {
		flex: 1,
		marginRight: 8,
		borderRadius: 12,
		fontWeight: 'bold',
	},
	pauseButton: {
		flex: 1,
		marginRight: 8,
		borderRadius: 12,
		fontWeight: 'bold',
	},
	uploadButton: {
		flex: 1,
		borderRadius: 12,
		fontWeight: 'bold',
	},
	nextButton: {
		borderRadius: 12,
		fontWeight: 'bold',
		backgroundColor: '#007bff',
		color: '#fff',
		marginTop: 18,
		marginLeft: 10,
	},
	successMessageContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#4CAF50',
		padding: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	successMessage: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default DataCollection;
