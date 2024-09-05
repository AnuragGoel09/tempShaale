import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Layout, Modal, Button } from '@ui-kitten/components';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import { API_BASE_URL } from '../config';

const UnorganizedLessons = ({ navigation }) => {
	const lessonDescription = "Explore a collection of rhythmic compositions curated by talented artists.";

	const [data, setData] = useState([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [selectedLesson, setSelectedLesson] = useState(null);

	// Function to fetch the all unorganized recordings from the server
	const fetchLessonData = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/get_all`);
			const result = await response.json();
			// console.log('Fetched data:', result);
			setData(result);
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	};

	useEffect(() => {
		fetchLessonData();
	}, []);

	// useFocusEffect is used to trigger the fetchLessonData function when the screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			fetchLessonData();
		}, [])
	);

	// Function to handle the card press
	const handleCardPress = (lesson) => {
		// console.log('Card for lesson pressed with id:', lesson.id);
		console.log('Lesson:', lesson);
		navigation.navigate('Lesson Details', { lesson });
	};

	// Function to handle the menu icon press
	const handleMenuPress = (lesson) => {
		setSelectedLesson(lesson);
		setModalVisible(true);
	};

	// Function to handle the deletion of a lesson
	const handleDeleteLesson = async () => {
		console.log('Deleting lesson:', selectedLesson);
		try {
			const response = await fetch(`${API_BASE_URL}/delete_unauthlesson`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: selectedLesson.id,
				}),
			});

			if (response.status === 200) {
				setData(data.filter(lesson => lesson.id !== selectedLesson.id));
				setModalVisible(false);
				Alert.alert('Success', 'Lesson deleted successfully.');
			} else {
				Alert.alert('Error', 'Failed to delete the lesson.');
			}
		} catch (error) {
			console.error('Delete Error:', error);
			Alert.alert('Error', 'An error occurred while deleting the lesson.');
		}
	};

	// Function to render the lesson card
	const renderLessonCard = (lesson) => (
		<View key={lesson.id} style={styles.lessonCardContainer}>
			<Card onPress={() => handleCardPress(lesson)}>
				<View style={styles.cardContent}>
					<View style={styles.textContainer}>
						<Text style={styles.lessonTitle}>{lesson.Title}</Text>
						<Text style={styles.lessonInfo}>{`Composed by: ${lesson.Composer}`}</Text>
					</View>
					<TouchableOpacity onPress={() => handleMenuPress(lesson)}>
						<Icon name="dots-three-vertical" size={20} color="black" />
					</TouchableOpacity>
				</View>
			</Card>
		</View>
	);

	return (
		<Layout style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.heading}>Unorganized Lessons</Text>
			</View>

			<View style={styles.descriptionContainer}>
				<Text style={styles.description}>{lessonDescription}</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContainer}>
				{data.map(renderLessonCard)}
			</ScrollView>

			<Modal
				visible={isModalVisible}
				backdropStyle={styles.backdrop}
				onBackdropPress={() => setModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<Text style={styles.modalTitle}>Options</Text>
					<Button style={styles.modalButton} onPress={handleDeleteLesson}>
						Delete Lesson
					</Button>
					<Button style={styles.modalButton} onPress={() => setModalVisible(false)}>
						Cancel
					</Button>
				</View>
			</Modal>

		</Layout>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
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
	descriptionContainer: {
		marginBottom: 16,
	},
	description: {
		color: '#9f9fa4',
		textAlign: 'left',
		margin: 12,
		fontSize: 14,
	},
	scrollContainer: {
		flexGrow: 1,
	},
	cardContainer: {
		flex: 1,
		flexDirection: 'column',
	},
	lessonCardContainer: {
		marginVertical: 10,
		marginHorizontal: 8,
		marginBottom: 10,
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 2,
		shadowOffset: { width: 2, height: 2 },
		elevation: 2,
	},
	cardContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	textContainer: {
		flex: 1,
	},
	lessonTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 8,
	},
	lessonInfo: {
		fontSize: 16,
		color: '#555',
		marginBottom: 8,
	},
	modalContainer: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		width: '170%',
		alignSelf: 'center',
	},
	backdrop: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	modalButton: {
		marginVertical: 10,
	},
	syllableText: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#000',
	},
});

export default UnorganizedLessons;
