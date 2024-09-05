import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { Card, Layout, Button, Modal, Input } from '@ui-kitten/components';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Entypo';
import DragList from 'react-native-draglist';
import { API_BASE_URL } from '../config';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllLessonsScreen = ({ navigation }) => {
	const lessonDescription = "Explore the fascinating world of Konnakkol syllables. Get started with the basics and build your rhythmic vocabulary.";
	const screenWidth = Dimensions.get('window').width;
	const [viewsData, setViewsData] = useState([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [newViewTitle, setNewViewTitle] = useState('');
	const [newViewSubtitle, setNewViewSubtitle] = useState('');
	const [selectedView, setSelectedView] = useState(null);
	const [isMenuVisible, setIsMenuVisible] = useState(false);

	// const keyExtractor = (item) => item.id.toString();
	const keyExtractor = (item) => item.view_id.toString();

	useEffect(() => {
		fetchViewsData();  // Fetch the views data when the screen is loaded
	}, []);

	useFocusEffect(() => {
		if (Platform.OS === 'android') {
			StatusBar.setBackgroundColor('#ffffff');
		}
		StatusBar.setBarStyle('dark-content');
	});

	// Function to fetch the views data from the server
	const fetchViewsData = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/get_views`);
			const data = await response.json();
			setViewsData(data);
			console.log("ALL DATA",data)
			console.log('Views Data:', data);
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}

	// Function to add a new view to the database
	const handleAddView = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/add_views`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: newViewTitle,
					subtitle: newViewSubtitle,
				}),
			});
			if (response.status === 201) {
				fetchViewsData();  // If the view is added successfully, fetch the updated data
				toggleModal();  // Close the modal after adding the view
			} else {
				console.error('Error adding view:', response.status);
			}
		} catch (error) {
			console.error('Add View Error:', error);
		}
	};

	// Function to toggle the modal visibility
	const toggleModal = () => {
		setModalVisible(!isModalVisible);
		// setNewViewTitle('');
		// setNewViewSubtitle('');
	};

	// Function to navigate to the lesson details screen
	const navigateToLessonDetails = (lessonId, viewId,index) => {
		console.log(`Navigate to Lesson ${lessonId}`);
		console.log(`Navigate to View ${viewId}`);
		console.log(lessonId)
		navigation.navigate('Lesson Screen', { lessonId, viewId,index});
	};

	// Function to set the header right button to navigate to the PostLesson screen
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<>
					{!isMenuVisible ? <TouchableOpacity
						style={styles.menuButton}
						onPress={() => {
							setIsMenuVisible(!isMenuVisible); console.log("Menu visibility:", isMenuVisible); // Add this line
						}}
					>
						<Icon name="menu" size={20} color="black" style={{ padding: 20 }} />
					</TouchableOpacity> : <TouchableOpacity
						style={styles.menuButton}
						onPress={() => {
							setIsMenuVisible(!isMenuVisible); console.log("Menu visibility:", isMenuVisible); // Add this line
						}}
					>
						<Icon name="cross" size={20} color="black" style={{ padding: 20 }} />
					</TouchableOpacity>}
				</>
			),
		});
	}, [navigation, isMenuVisible]);

	// Function to handle the long press on the lesson card
	const handleLongPress = (lesson) => {
		setSelectedView(lesson);
		setNewViewTitle(lesson.lesson_title);
		setNewViewSubtitle(lesson.lesson_subtitle);
		toggleModal();
	};

	// Function to handle the edit view
	const handleEditView = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/update_view`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: selectedView.id,
					title: newViewTitle,
					subtitle: newViewSubtitle,
				}),
			});
			if (response.status === 200) {
				fetchViewsData();  // Fetch the updated data after editing the view
				toggleModal();  // Close the modal after editing the view
				setSelectedView(null);  // Reset the selected view
			} else {
				console.error('Error updating view:', response.status);
			}
		} catch (error) {
			console.error('Update View Error:', error);
		}
	};

	// Function to handle the delete view
	const handleDeleteView = async () => {
		console.log(selectedView.id)
		try {
			const response = await fetch(`${API_BASE_URL}/delete_view`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: selectedView.id, // Assuming id is the unique identifier for the view
				}),
			});
			if (response.status === 200) {
				fetchViewsData();  // Fetch the updated data after deleting the view
				toggleModal();  // Close the modal after deleting the view
				setSelectedView(null);  // Reset the selected view
			} else {
				console.error('Error deleting view:', response);
				fetchViewsData();  // Fetch the updated data after deleting the view
				toggleModal();  // Close the modal after deleting the view
				setSelectedView(null);  // Reset the selected view
			}
		} catch (error) {
			console.error('Delete View Error:', error);
		}
	};

	// Function to handle the cancel button press
	const handleCancel = () => {
		if (selectedView) {
			// If in edit mode, reset the selected view and close the modal
			setSelectedView(null);
			toggleModal();
		} else {
			// If in add mode, close the modal without resetting the state
			toggleModal();
		}
	};

	// Function to handle press on the options button
	const handleOptionsPress = (lesson) => {
		console.log("Pressed");
		setSelectedView(lesson);
		setNewViewTitle(lesson.lesson_title);
		setNewViewSubtitle(lesson.lesson_subtitle);
		toggleModal();
		// setModalVisible(true);
	};

	// Function to render the lesson card (new_one)
	const renderItemForDrag = ({ item, onDragStart, onDragEnd, isActive,index }) => (
		<TouchableOpacity
			key={item.id}
		>
			<View style={styles.lessonCardContainer}>
				<Card onPress={() => {navigateToLessonDetails(item.lesson_id, item.view_id,index)}}>
					<View style={styles.cardContent}>
						{/* Title and Subtitle */}
						<View style={styles.textContainer}>
							<Text style={styles.lessonCardTitle}>{item.lesson_title}</Text>
							<Text style={styles.lessonCardSubtitle}>{item.lesson_subtitle}</Text>
						</View>
						{/* Options Icon */}
						{/* {renderOptionsIcon(item)} */}
						{/* Drag Icon */}
						<TouchableOpacity
							// style={styles.iconButton}
							onPress={() => handleOptionsPress(item)}
							onPressIn={onDragStart}
							onPressOut={onDragEnd}
						>
							<Icon name="menu" size={20} color="black" />
						</TouchableOpacity>
					</View>
				</Card>
			</View>
		</TouchableOpacity>
	);
	const renderItem = (item) => {
		console.log("IMTE",item)
		return (
			<View style={styles.lessonCardContainer} key={item.id}>
				<Card onPress={() => {navigateToLessonDetails(item.lesson_id, item.view_id,item.view_id-1)}}>
					<View style={styles.cardContent}>
						{/* Title and Subtitle */}
						<View style={styles.textContainer}>
							<Text style={styles.lessonCardTitle}>{item.lesson_title}</Text>
							<Text style={styles.lessonCardSubtitle}>{item.lesson_subtitle}</Text>
						</View>
						{/* Options Icon */}
						{/* {renderOptionsIcon(item)} */}
						{/* Drag Icon */}
						<TouchableOpacity
							// style={styles.iconButton}
							onPress={() => handleOptionsPress(item)}
						>
							<Icon name="menu" size={20} color="black" />
						</TouchableOpacity>
					</View>
				</Card>
			</View>
	)};

	// Function to handle the reordering of views
	const onReordered = async (fromIndex, toIndex) => {
		try {
			const response = await fetch(`${API_BASE_URL}/reorder_lesson_view_map`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from_view_number: fromIndex + 1,
					make_it_view_number: toIndex + 1,
				}),
			});
			if (response.status === 201) {
				fetchViewsData(); // Fetch the updated data after reordering
			} else {
				console.error('Error reordering views:', response.status);
			}
		} catch (error) {
			console.error('Reorder Views Error:', error);
		}
	};

	return (
		<ScrollView style={styles.container}>
			{isMenuVisible && (
				<View style={styles.menuContainer}>
					<TouchableOpacity
						style={styles.menuOption}
						onPress={() => { setIsMenuVisible(false); navigation.navigate('Post Lesson') }}
					>
						<Icon name="mic" size={20} color="white" />
						<Text style={styles.menuOptionText}>Record Lesson</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.menuOption}
						onPress={() => { setIsMenuVisible(false); navigation.navigate('Upload Lesson') }}
					>
						<Icon name="upload" size={20} color="white" />
						<Text style={styles.menuOptionText}>Upload Lesson</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.menuOption}
						onPress={() => { setIsMenuVisible(false); navigation.navigate('Unorganized Lessons') }}
					>
						<Icon name="folder" size={20} color="white" />
						<Text style={styles.menuOptionText}>Unorganized</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.menuOption}
						onPress={async () => {
							setIsMenuVisible(false);
							await AsyncStorage.removeItem('logined');
							await AsyncStorage.removeItem('token');
							navigation.reset({
								index: 0,
								routes: [{ name: 'LoginWithOtp' }],
							});
						}}
					>
						<Icon name="log-out" size={20} color="white" />
						<Text style={styles.menuOptionText}>Logout</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Header with the title and description */}
			<View style={styles.header}>
				<Text style={styles.heading}>All Lessons</Text>
			</View>

			<View style={styles.descriptionContainer}>
				<Text style={styles.description}>{lessonDescription}</Text>
			</View>

			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('Subscriptions')}>Subscriptions</Button> */}
			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('Purchase')}>Purchase</Button> */}
			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('soundMerge')}>Sound merge</Button> */}
			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('LessonWM')}>LessonWM</Button> */}
			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('MultiTrackPlayerScreen')}>MultiTrackPlayerScreen</Button> */}
			{/* <Button style={styles.addViewButton} onPress={() => navigation.navigate('WebSocket')}>Web Socket to send recording</Button> */}

			{/* Scrollable view to display the lesson cards and button to add a new view */}
			{/* <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>
          {viewsData.map(renderLessonCard)}
        </View>
        <Button style={styles.addViewButton} onPress={toggleModal}>Add New View</Button>
      </ScrollView> */}
			<View style={styles.lessonCardContainer}>
				<Card onPress={() => navigation.navigate('Data Collection')}>
					<View style={styles.cardContent}>
						{/* Title and Subtitle */}
						<View style={styles.textContainer}>
							<Text style={styles.lessonCardTitle}>Syllables</Text>
							<Text style={styles.lessonCardSubtitle}>Data Collection</Text>
						</View>
						{/* Options Icon */}
						{/* {renderOptionsIcon(item)} */}
						{/* Drag Icon */}
					</View>
				</Card>
			</View>

			{/* DragList to display the lesson cards and button to add a new view */}
			<View style={styles.scrollContainer}>
				<View style={styles.cardContainer}>
					{/* <DragList
						data={viewsData}
						keyExtractor={keyExtractor}
						onReordered={onReordered}
						renderItem={renderItem}
					/> */}
					{
						viewsData.map((item=>{
							return renderItem(item)
						}))
					}
				</View>
				<Button style={styles.addViewButton} onPress={toggleModal}>Add New Level</Button>
			</View>

			{/* Modal to add, edit or delete a view */}
			<Modal
				visible={isModalVisible}
				backdropStyle={styles.backdrop}
				onBackdropPress={handleCancel}
			>
				<View style={[styles.modalContainer, { width: screenWidth * 0.8 }]}>
					<Text style={styles.modalTitle}>{selectedView ? 'Edit Level' : 'Add New Level'}</Text>
					<Input
						style={styles.input}
						placeholder='Title'
						value={newViewTitle}
						onChangeText={text => setNewViewTitle(text)}
					/>
					<Input
						style={styles.input}
						placeholder='Subtitle'
						value={newViewSubtitle}
						onChangeText={text => setNewViewSubtitle(text)}
					/>
					{selectedView ? (
						<>
							<Button style={styles.modalButton} onPress={handleEditView}>Edit Level</Button>
							<Button style={styles.modalButton} onPress={handleDeleteView}>Delete Level</Button>
						</>
					) : (
						<Button style={styles.modalButton} onPress={handleAddView}>Add Level</Button>
					)}
					<Button style={styles.modalButton} onPress={handleCancel}>Cancel</Button>
				</View>
			</Modal>

		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	scrollContainer: {
		flexGrow: 1,
	},
	header: {
		alignItems: 'center',
		marginTop: 16,
	},
	heading: {
		fontWeight: 'bold',
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
	cardContainer: {
		flex: 1,
		flexDirection: 'column',
	},
	lessonCardContainer: {
		// flexDirection: 'row',
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
	iconButton: {
		padding: 10,
	},
	optionsIcon: {
		width: 24,
		height: 24,
	},
	lessonCard: {
		marginVertical: 10,
		marginHorizontal: 8,
		marginBottom: 10,
		borderRadius: 10,
	},
	lessonCardTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#000',
	},
	lessonCardSubtitle: {
		fontSize: 16,
		color: '#9f9fa4',
	},
	postButton: {
		marginRight: 24,
		color: '#000',
		fontWeight: 'bold',
		fontSize: 16,
	},
	menuButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
	menuButton: {
		marginRight: 16,
	},
	menuContainer: {
		position: 'absolute',
		top: 0,
		right: 16,
		backgroundColor: '#333',
		padding: 16,
		borderRadius: 8,
		elevation: 3,
		zIndex: 1000,
	},
	menuOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	menuOptionText: {
		color: '#fff',
		marginLeft: 8,
	},
	selectedOptionText: {
		marginTop: 20,
		fontSize: 18,
	},
	addViewButton: {
		backgroundColor: '#3366FF',
		borderColor: '#3366FF',
		marginHorizontal: 8,
		marginVertical: 12,
		marginBottom: 12,
		borderRadius: 12,
		elevation: 3,
	},
	modalButton: {
		backgroundColor: '#3366FF',
		borderColor: '#3366FF',
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 12,
		elevation: 3,
	},
	modalContainer: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		// width: '180%',
		alignSelf: 'center',
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

export default AllLessonsScreen;