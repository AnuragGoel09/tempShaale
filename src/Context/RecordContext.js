import React, { createContext, useContext, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
const RecordContext = createContext();

export function RecordProvider({ children }) {
	const [audioFile, setAudioFile] = useState('');
	const [recording, setRecording] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [hasRecorded, setHasRecorded] = useState(false);

	const initAudioRecord = async () => {
		await checkPermissions();

		const options = {
			sampleRate: 22050,
			channels: 1,
			bitsPerSample: 16,
			wavFile: 'test.wav'
		};

		AudioRecord.init(options);

		AudioRecord.on('data', data => {
			const chunk = Buffer.from(data, 'base64');
			// console.log('chunk size', chunk.byteLength);
			// do something with audio chunk
		});
	};

	const checkPermissions = async () => {
		try {
			if (Platform.OS === 'android') {
				const result = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
				if (result === RESULTS.GRANTED) {
					console.log('You can use the mic');
				} else {
					const requestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
					if (requestResult === RESULTS.GRANTED) {
						console.log('You can use the mic');
					} else {
						console.log('Permission denied');
					}
				}
			}
			else if (Platform.OS === 'ios') {
				const result = await check(PERMISSIONS.IOS.MICROPHONE);
				if (result === RESULTS.GRANTED) {
					console.log('You can use the mic');
				} else {
					const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
					if (requestResult === RESULTS.GRANTED) {
						console.log('You can use the mic');
					} else {
						console.log('Permission denied');
					}
				}
			}
		} catch (err) {
			console.warn(err);
		}
	};

	const requestAudioPermission = async () => {
		if (Platform.OS === 'android') {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
					{
						title: 'Permissions for write access',
						message: 'Give permission to your storage to write a file',
						buttonPositive: 'ok',
					},
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					console.log('You can use the mic');
				} else {
					console.log('Permission denied');
					return;
				}
			} catch (err) {
				console.warn(err);
				return;
			}
		}
	};

	const startRecord = async () => {
		// console.log("Handle Record");
		try {
			console.log('Started recording!');
			setAudioFile('');
			setRecording(true);
			setLoaded(false);
			AudioRecord.start();
		} catch (error) {
			console.error('Error recording:', error);
			Alert.alert('Error', 'Failed to start recording');
		}
	};

	const handleStopRecording = async () => {
		console.log("Handle Stop Recording");
		try {
			if (!recording) return;
			console.log('Recording stopped!');
			let audioFilePath = await AudioRecord.stop();
			console.log('audioFilePath', audioFilePath);
			setAudioFile(audioFilePath);
			setRecording(false);
			setHasRecorded(true);
		} catch (error) {
			console.error('Error stopping recording:', error);
			Alert.alert('Error', 'Failed to stop recording');
		}
	};

	const setRecordDefault = () => {
		setRecording(false);
		setAudioFile('');
		setHasRecorded(false);
		setLoaded(false);
	};

	return (
		<RecordContext.Provider value={{ initAudioRecord, startRecord, handleStopRecording, audioFile, loaded, setLoaded, recording, hasRecorded, setRecording, setAudioFile, setHasRecorded, setRecordDefault }}>
			{children}
		</RecordContext.Provider>
	);
}

export function useRecord() {
	return useContext(RecordContext);
}