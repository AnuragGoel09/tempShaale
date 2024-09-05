import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Alert, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, ScrollView, BackHandler, AppState } from 'react-native';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/AntDesign';
import { Input, IndexPath, Layout, Select, SelectItem, Divider, Button, Modal } from '@ui-kitten/components';
import { MetronomeContext } from '../Context/MetrnomeContext';
import { useRecord } from '../Context/RecordContext';
import { API_BASE_URL } from '../config';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import {
	isHeadphonesConnected,
	isWiredHeadphonesConnected,
	isBluetoothHeadphonesConnected,
	getDeviceName,
	getSystemVersion,
	getBrand,
	getManufacturer,
	getModel,
	getUniqueId,
	isEmulator,
} from 'react-native-device-info';

const ArtistLessonScreen = ({ navigation }) => {
	const [deviceInfo, setDeviceInfo] = useState('');

	const fetchDeviceInfo = async () => {
		const deviceName = await getDeviceName();
		const systemVersion = getSystemVersion();
		const brand = getBrand();
		const manufacturer = getManufacturer();
		const model = getModel();
		const uniqueId = getUniqueId();
		const headphone = await isHeadphonesConnected();
		// console.log("isHeadphonesConnected:", headphone);
		// console.log("--------------");

		setDeviceInfo(`
			Device Name: ${deviceName}
			System Version: ${systemVersion}
			Brand: ${brand}
			Manufacturer: ${manufacturer}
			Model: ${model}
			Unique ID: ${uniqueId}
		`);
	};

	useFocusEffect(() => {
		fetchDeviceInfo();
		// console.log(deviceInfo);
	});

	// const { startMetronome, loadSound, stopMetronome, beatNumber, setContextBeats, setContextTempo, setMetronomeDefault, isTimer, Tempo, Beats, setBeatNumber, setIsTimer, setToggleMetronome, setIsRecord, setTotalBeats, totalBeats } = useMetronome();
	const {
		bpm,
		playing,
		currentBeat,
		beatsPerCycle,
		handleBPM,
		startStop,
		handleBeatsChange,
		firstCycle,
		countDown,
		toggleCountDown,
		totalBeats,
	} = useContext(MetronomeContext);
	const { initAudioRecord, audioFile, loaded, setLoaded, recording, hasRecorded, setRecordDefault, startRecord, handleStopRecording, setHasRecorded, setAudioFile } = useRecord();
	const route = useRoute();
	const beatsOptions = Array.from({ length: 41 }, (_, index) => (index).toString());
	const [beatsIndex, setBeatsIndex] = useState(new IndexPath(1)); // Default beats index

	const complexityOptions = ['Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'];
	const [complexityIndex, setComplexityIndex] = useState(new IndexPath(0)); // Default complexity index
	const lessonId = route.params?.lessonId;
	// console.log("llll", lessonId);
	const [title, setTitle] = useState('');
	const [timeCycle, setTimeCycle] = useState('');
	const [beats, setBeats] = useState('0');
	const [complexityLevel, setComplexityLevel] = useState('');
	const [composer, setComposer] = useState('');
	const [postedBy, setPostedBy] = useState('');
	const [tags, setTags] = useState([]);
	const [tagInput, setTagInput] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [paused, setPaused] = useState(true);
	let sound1 = null;
	const [recSound, setRecSound] = useState();
	const [docid, setDocid] = useState('');
	const [isTimer, setIsTimer] = useState(true);
	const [TotalBeats, setTotalBeats] = useState(0);

	useEffect(() => {
		initAudioRecord();  // Initialize the audio recorder here
		// setIsRecord(true);
		// setDefaults();  // Set the post screen state to default here
		// console.log(recording);
		// console.log(hasRecorded);
		// console.log("view", lessonId);
	}, []);

	useEffect(() => {
		const appStateListener = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'background' || nextAppState === 'inactive') {
				if (recording) {
					stopRecording();
				}
				setIsModalVisible(false);
				setIsTimer(true);
			}
		});

		return () => {
			appStateListener.remove();
		};
	}, [recording]);

	// useEffect(() => {
	// 	loadSound();  // Load the sound file here
	// }, []);

	useEffect(() => {
		// Function to handle the hardware back button
		const backHandler = () => {
			// Check if recording is in progress
			if (recording) {
				// If recording is in progress, show alert
				Alert.alert(
					'Warning',
					'Are you sure you want to go back? Your recording will be lost.',
					[
						{
							text: 'Cancel',
							onPress: () => { },
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: () => {
								// If user chooses to go back, stop recording and navigate back
								// stopRecording();
								if (recording) {
									stopRecording();
								}
								navigation.goBack();
							},
						},
					],
					{ cancelable: false }
				);
				return true; // Returning true prevents the default back action
			}
			setDefaults();
			setHasRecorded(false);
			return false; // If not recording, proceed with the default back action
		};

		// Attach the back handler to the hardware back button
		const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', backHandler);

		// Clean up the listener when the component unmounts
		return () => backHandlerListener.remove();
	}, [recording, navigation]);

	useEffect(() => {
		if (!firstCycle && playing && countDown) {
			setIsTimer(false);
			startRecord();
		}
	}, [firstCycle])

	// Function to stop recording
	const stopRecording = async () => {
		if (bpm == '0' && beatsPerCycle == '0') {
			handleStopRecording();
		}
		else {
			setTotalBeats(totalBeats.toString());
			if (playing) {
				startStop();
			}
			handleStopRecording();
		}
	};

	// Function to handle the record button press
	// const handleRecord = () => {
	// 	if (!countDown) {
	// 		toggleCountDown();
	// 	}
	// 	console.log("dfdaf", isHeadphonesConnected());
	// 	Promise.all([
	// 		isHeadphonesConnected(),
	// 		isWiredHeadphonesConnected(),
	// 		isBluetoothHeadphonesConnected()
	// 	]).then(([headphonesConnected, wiredHeadphonesConnected, bluetoothHeadphonesConnected]) => {
	// 		if (!headphonesConnected && !wiredHeadphonesConnected && !bluetoothHeadphonesConnected) {
	// 			Alert.alert('Please connect headphones to record');
	// 			return;
	// 		}
	// 		if (recSound) {
	// 			setPaused(true);
	// 			recSound.stop();
	// 		}
	// 		if (recording) {
	// 			stopRecording();
	// 		}
	// 		else {
	// 			if (!title) {
	// 				Alert.alert('Error', 'Please enter Title');
	// 				return;
	// 			}
	// 			// if (!complexityLevel) {
	// 			// 	Alert.alert('Error', 'Please select Complexity Level');
	// 			// 	return;
	// 			// }
	// 			if (!bpm || !beatsPerCycle) {
	// 				Alert.alert('Error', 'Select 0 for tempo and beats if metronome is not required');
	// 				return;
	// 			}
	// 			setIsTimer(true);
	// 			if (bpm == '0' && beatsPerCycle == '0') {
	// 				// setToggleMetronome(false);
	// 				startRecord();
	// 			}
	// 			else {
	// 				// setToggleMetronome(true);
	// 				// startMetronome();
	// 				startStop();
	// 			}
	// 			setIsModalVisible(true);
	// 		}
	// 	});
	// };

	const handleRecord = async () => {
		if (!countDown) {
			toggleCountDown();
		}

		try {
			// const headphonesConnected = await isHeadphonesConnected();
			// const wiredHeadphonesConnected = await isWiredHeadphonesConnected();
			// const bluetoothHeadphonesConnected = await isBluetoothHeadphonesConnected();

			// console.log('headphonesConnected:', headphonesConnected)
			// console.log('wiredHeadphonesConnected:', wiredHeadphonesConnected)
			// console.log('bluetoothHeadphonesConnected:', bluetoothHeadphonesConnected)

			// if (!headphonesConnected && !wiredHeadphonesConnected && !bluetoothHeadphonesConnected) {
			// 	Alert.alert('Please connect headphones to record');
			// 	return;
			// }

			if (recSound) {
				setPaused(true);
				recSound.stop();
			}

			if (recording) {
				stopRecording();
			} else {
				if (!title) {
					Alert.alert('Error', 'Please enter Title');
					return;
				}
				if (!bpm || !beatsPerCycle) {
					Alert.alert('Error', 'Select 0 for tempo and beats if metronome is not required');
					return;
				}

				setIsTimer(true);

				if (bpm == '0' && beatsPerCycle == '0') {
					startRecord();
				} else {
					startStop();
				}

				setIsModalVisible(true);
			}
		} catch (error) {
			console.error('Error checking headphone connection:', error);
			Alert.alert('Error', 'Failed to check headphone connection.');
		}
	};

	// Function to load the sound file
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

	// Function to handle the play/pause button press
	const handleTogglePlayback = async () => {
		console.log("countDown", countDown);
		if (countDown) {
			toggleCountDown();
		}
		// console.log("Handle Toggle Playback");
		if (!loaded) {
			try {
				await load();
			} catch (error) {
				console.log(error);
			}
		}
		setPaused(false);
		Sound.setCategory('Playback');
		startStop();
		sound1.play(success => {
			if (success) {
				console.log('successfully finished playing');
			} else {
				console.log('playback failed due to audio decoding errors');
			}
			startStop();
			setLoaded(false);
			if (!countDown) {
				toggleCountDown();
			}
			setPaused(true);
		});
	};

	// Function to pause the audio file
	const pause = () => {
		// console.log("Pause");
		recSound.pause();
		setLoaded(false);
		setPaused(true);
	};

	// Function to handle the adding of tags
	const handleAddTag = () => {
		if (tagInput.trim() !== '') {
			setTags([...tags, tagInput.trim()]);
			setTagInput('');
		}
	};

	// Function to handle the removal of tags
	const handleRemoveTag = (index) => {
		const updatedTags = [...tags];
		updatedTags.splice(index, 1);
		setTags(updatedTags);
	};

	// Function to handle the upload of the lesson
	const handleUpload = async () => {
		console.log("totalBeats", TotalBeats);
		// console.log("beats", Beats);
		let bodyContent = new FormData();
		bodyContent.append("Title", title);
		// bodyContent.append("TimeCycle", timeCycle);
		bodyContent.append("Beats", beatsPerCycle);
		bodyContent.append("Tempo", bpm);
		// bodyContent.append("Composer", composer);
		bodyContent.append('audioFile', {
			uri: 'file://' + audioFile,
			type: 'audio/wave',
			name: 'test.wav',
		});
		// bodyContent.append("Complexity", complexityLevel);
		// bodyContent.append("PostedBy", postedBy);
		bodyContent.append("totalBeats", TotalBeats);

		// Convert tags array to a comma-separated string
		// const tagsString = tags.join(',');
		// Append the string representation of tags to the request body
		// bodyContent.append("Tags", tagsString);
		let endPoint = 'add_to_unauth'

		if (lessonId) {
			bodyContent.append("id", lessonId);
			endPoint = 'add_standard_lessons'
		}

		console.log("mm", endPoint);

		try {
			const res = await fetch(
				`${API_BASE_URL}/${endPoint}`,
				{
					method: 'POST',
					body: bodyContent,
				},
			);
			const resData = await res.json();
			console.log("resss", resData);
			setDocid(resData.docid);
			// console.log("ll", resData);
		} catch (err) {
			console.log(err.message);
		}
		setModalVisible(true);
		setIsModalVisible(false);
		setTitle('');
		// setContextTempo('0');
		setTimeCycle('');
		// setContextBeats('0');
		setComplexityLevel('');
		setComposer('');
		setPostedBy('');
		setTags([]);
		// setMetronomeDefault();
		setRecordDefault();
		// setDefaults();
	};

	// Function to set the state to default
	const setDefaults = () => {
		// setTempoIndex(new IndexPath(1));
		// setBeatsIndex(new IndexPath(1));
		setComplexityIndex(new IndexPath(0));
		setTitle('');
		handleBPM(120);
		handleBeatsChange(8);
		// setContextTempo('120');
		setTimeCycle('');
		// setContextBeats('8');
		setComplexityLevel('');
		setComposer('');
		setPostedBy('');
		setTags([]);
		setTagInput('');
		setModalVisible(false);
		setPaused(true);

		// stopMetronome();
		// setMetronomeDefault();
		setRecordDefault();
	};

	// Function to increment the beats
	const handleIncrementBeats = () => {
		handleBeatsChange(beatsPerCycle + 1)
		// const currentBeats = parseInt(beatsPerCycle) || 0;  // Ensure Beats is a valid number or set it to 0
		// const updatedBeats = currentBeats + 1;  // Increase beats
		// setBeats(updatedBeats.toString());
		// setContextBeats(updatedBeats.toString());
	};

	// Function to decrement the beats
	const handleDecrementBeats = () => {
		handleBeatsChange(beatsPerCycle - 1)
		// const currentBeats = parseInt(beatsPerCycle) || 0;  // Ensure Beats is a valid number or set it to 0
		// const updatedBeats = Math.max(currentBeats - 1, 0);  // Decrease beats
		// setBeats(updatedBeats.toString());
		// setContextBeats(updatedBeats.toString());
	};

	return (
		<ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#ffffff', flex: 1 }}>
			<View style={{ padding: 20 }}>
				<Text style={styles.title}>Create a new lesson</Text>
				<>
					{/* Modal for recording */}


					{/* Modal for recording */}
					<Modal
						visible={isModalVisible}
						backdropStyle={styles.backdrop}
						onRequestClose={() => {
							setModalVisible(false);
						}}
					>
						<View style={styles.modalContainer}>
							{!isTimer && <Button
								style={styles.recordButton}
								onPress={handleRecord}
							>
								{recording ? 'Stop Recording' : hasRecorded ? 'Record again' : 'Record'}
							</Button>}
							{(recording) && <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>Recording Started!</Text>}
							<View style={styles.beatsContainer}>
								{currentBeat != 0 && <TouchableOpacity
								>
									<Text style={styles.beatText}>{currentBeat}</Text>
								</TouchableOpacity>}
							</View>
							{hasRecorded && !recording && !isTimer ? (
								<View style={styles.playbackContainer}>
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
								</View>
							) : null}
							<Button style={styles.modalButton} onPress={() => { setIsModalVisible(false); if (recording) { stopRecording(); } setIsTimer(true); }}>Cancel</Button>
						</View>
					</Modal>

					{/* Lesson Title */}
					<Input
						style={{ marginBottom: 10 }}
						placeholder='Lesson Title'
						value={title}
						onChangeText={setTitle}
					/>

					{/* Tempo */}
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ marginBottom: 10, color: '#000' }}>Tempo: </Text>
						<Input
							style={{ marginBottom: 10 }}
							placeholder='Tempo'
							value={bpm.toString()}
							onChangeText={handleBPM}
							keyboardType='numeric'
						/>
					</View>
					<View style={{ marginBottom: 10 }}>
						<Slider
							style={{ width: '100%', height: 40 }}
							minimumValue={0}
							maximumValue={200}
							step={1}
							minimumTrackTintColor="#000000"
							maximumTrackTintColor="#000000"
							thumbTintColor="#000000"
							value={parseInt(bpm)}
							onValueChange={(value) => {
								// setTempoValue(value);
								// setTempo(value.toString());
								// setContextTempo(value.toString());
								handleBPM(value);
							}}
						/>
					</View>
					{/* <Select
						label="Tempo"
						value={tempo || 'Select Tempo'}
						selectedIndex={tempoIndex}
						onSelect={index => {
							setTempoIndex(index);
							setTempo(tempoOptions[index.row]);
							setContextTempo(tempoOptions[index.row]);
						}}
						style={{ marginBottom: 10 }}
					>
						{tempoOptions.map((option, index) => (
							<SelectItem key={index} title={option} />
						))}
					</Select> */}

					{/* Time Cycle */}
					{/* <Input
						style={{ marginBottom: 10 }}
						placeholder='Time Cycle (Tala)'
						value={timeCycle}
						onChangeText={setTimeCycle}
					/> */}

					{/* Beats */}
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
						<Text style={{ color: '#000' }}>Beats: </Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<TouchableOpacity onPress={handleDecrementBeats} style={styles.iconButton}>
								<Icon name="minus" size={20} color="black" />
							</TouchableOpacity>
							<Input
								placeholder='Beats'
								value={beatsPerCycle.toString()}
								onChangeText={handleBeatsChange}
								keyboardType='numeric'
							/>
							<TouchableOpacity onPress={handleIncrementBeats} style={styles.iconButton}>
								<Icon name="plus" size={20} color="black" />
							</TouchableOpacity>
						</View>
					</View>
					{/* <Select
						label="Beats"
						selectedIndex={beatsIndex}
						onSelect={(index) => {
							setBeatsIndex(index);
							setBeats(beatsOptions[index.row]);
							setContextBeats(beatsOptions[index.row]);
						}}
						style={{ marginBottom: 10 }}
						value={beats || 'Select Beats'}
					>
						{beatsOptions.map((option, index) => (
							<SelectItem key={index} title={option} />
						))}
					</Select> */}

					{/* Complexity Level */}
					{/* <Select
						label="Complexity Level"
						selectedIndex={complexityIndex}
						onSelect={(index) => {
							setComplexityIndex(index);
							setComplexityLevel(complexityOptions[index.row]);
						}}
						style={{ marginBottom: 10 }}
						value={complexityLevel || 'Select Complexity Level'}
					>
						{complexityOptions.map((option, index) => (
							<SelectItem key={index} title={option} />
						))}
					</Select> */}

					{/* Composer */}
					{/* <Input
						style={{ marginBottom: 10 }}
						placeholder='Composer'
						value={composer}
						onChangeText={setComposer}
					/> */}

					{/* Posted By */}
					{/* <Input
						style={{ marginBottom: 10 }}
						placeholder='Posted By'
						value={postedBy}
						onChangeText={setPostedBy}
					/> */}

					{/* Tags */}
					{/* <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
						{tags.map((tag, index) => (
							<TouchableOpacity key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, marginRight: 8, marginBottom: 8, padding: 8 }}>
								<Text style={{ color: '#000' }}>{tag}</Text>
								<TouchableOpacity onPress={() => handleRemoveTag(index)}>
									<Icon name="close" size={18} color="black" style={{ marginLeft: 5 }} />
								</TouchableOpacity>
							</TouchableOpacity>
						))}
						<Input
							placeholder='Add a tag'
							value={tagInput}
							onSubmitEditing={handleAddTag}
							onChangeText={setTagInput}
							style={{ height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, marginBottom: 8 }}
						/>
					</View> */}
				</>

				{/* Modal for successful upload */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						setModalVisible(false);
					}}
				>
					<View style={styles.modalContainer} >
						<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Icon name="close" size={18} color="black" style={{ marginLeft: 5 }} />
							</TouchableOpacity>
							<Text style={styles.modalTitle}>Lesson Successfully uploaded!</Text>
							<Button
								style={styles.modalButton}
								onPress={() => {
									setModalVisible(false);
									navigation.replace('AddLyrics', { lessonId: docid, isStandard: lessonId ? true : false });
									// might have to change lessonId to docid in the above line in front of isStandard.
								}}
							// onPress={() => {
							// 	navigation.navigate('AddLyrics'), { lessonId: docid }
							// }}
							>
								Add Lyrics
							</Button>
						</View>
					</View>
				</Modal>
				<Text style={styles.message}>NOTE: Use headphones 🎧 while recording</Text>
				{!isModalVisible && !modalVisible &&
					<View style={{ marginBottom: 30 }}>
						<Button
							style={styles.recordButton}
							onPress={handleRecord}
						>
							{playing ? 'Stop' : 'Start'}
						</Button>
					</View>
				}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	message: {
		marginTop: 12,
		marginBottom: 20,
		color: '#9f9fa4',
		textAlign: 'center',
		fontSize: 14,
	},
	title: {
		fontSize: 30,
		fontWeight: 'bold',
		// marginTop: 12,
		marginBottom: 27,
		color: '#000',
		textAlign: 'center'
	},
	beatsContainer: {
		display: 'flex',
		flexDirection: 'row',
		// flexWrap: 'wrap',
		justifyContent: 'center',
		// width: '100%',
		// marginTop: 16,
	},
	beatCircle: {
		width: 50,
		height: 50,
		borderRadius: 25,
		borderWidth: 2,
		borderColor: '#333',
		alignItems: 'center',
		justifyContent: 'center',
		margin: 8,
		backgroundColor: '#fff',
	},
	highlightedCircle: {
		backgroundColor: '#3498db',
	},
	beatText: {
		fontSize: 100,
		// fontWeight: 'bold',
		color: '#000',
	},
	buttonContainer: {
		marginTop: 16,
		marginBottom: 10,
	},
	select: {
		flex: 1,
		margin: 2,
	},
	recordButton: {
		marginBottom: 12,
		borderRadius: 12,
		fontWeight: 'bold',
		color: '#ffffff'
	},
	playbackContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		// marginBottom: 40,
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
		// backgroundColor: '#FF5733',
	},
	uploadButton: {
		flex: 1,
		borderRadius: 12,
		fontWeight: 'bold',
		// backgroundColor: '#4CAF50',
	},
	iconButton: {
		backgroundColor: '#ccc',
		borderRadius: 5,
		padding: 5,
		marginHorizontal: 10,
	},
	modalButton: {
		backgroundColor: '#3366FF',
		borderColor: '#3366FF',
		marginHorizontal: 8,
		marginBottom: 12,
		marginTop: 12,
		borderRadius: 12,
		elevation: 3,
		// position: 'absolute',
		// bottom: 0,
		// left: '40%'
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		width: '180%',
		alignSelf: 'center',
		height: 300,
		width: 300,
		// position: 'relative',
	},
	backdrop: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalTitle: {
		color: '#000',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
		marginHorizontal: 8,
	},
	input: {
		color: '#000',
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		width: '100%',
	},
});

export default ArtistLessonScreen;
