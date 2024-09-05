import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, TextInput, Dimensions } from 'react-native';
import { Card, Layout, Modal, Button } from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { getLessonType } from '../utils/fetchLesson';
import { useAllLessons } from '../Context/AllLessonsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPermissions } from '../utils/recordingPermission';

const LessonScreen = ({ route }) => {
	const navigation = useNavigation();
	const idx=route.params?.index
	console.log("INDEX",route.params.index)
	const screenWidth = Dimensions.get('window').width;
	// const lessonDescription = "Learn the basics of Konnakkol syllables in Lesson 1. Explore the fundamental rhythmic elements and build a strong foundation for advanced compositions.";
	// const syllables = ['Tha', 'Dhi', 'Thom', 'Nam', 'Ka', 'Ki', 'Ku', 'Ta', 'Gi', 'Na', 'Jha', 'Nu', 'Ri', 'Thaam', 'Mi', 'Tha Laangu', 'Dhin', 'Dhim'];
	const [lessons, setLessons] = useState([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [selectedLesson, setSelectedLesson] = useState(null);
	const lessonId = route.params?.lessonId;
	const viewId = route.params?.viewId;
	const [LessonTitle, setLessonTitle] = useState('');
	const [LessonSubTitle, setLessonSubTitle] = useState('');
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [newTitle, setNewTitle] = useState('');
	const {allLessons,updateLessons,completedUpto,updateSingleArray,singleArray}=useAllLessons();
	const [data,setData]=useState(null)
	const keyExtractor = (item) => {
		// console.log("IMTE",item.id)
		return item.id;
	};
	useFocusEffect(() => {
		if (Platform.OS === 'android') {
			StatusBar.setBackgroundColor('#ffffff');
		}
		StatusBar.setBarStyle('dark-content');
	});
	useEffect(()=>{
		// console.log(singleArray)
		if(data && singleArray){
		  const lessonStates=data.map((view,level)=>({
			...view,
			lessons:view.lessons.map((lesson,index)=>({
			  ...lesson,
			  locked: (() => {
				if (lesson.locked != null && lesson.locked == false) return false;
		  
				const currIdx = singleArray.findIndex((item) => item.id == lesson.id);
				
				if (currIdx == 0 || currIdx == 1) return false;
		  
				return singleArray[currIdx - 1].success == 0 || singleArray[currIdx - 2].success == 0;
			  })()
			}))
		  }))
		  console.log("UPDATING LESSONS")
		  updateLessons(lessonStates)
		}
	  },[data,singleArray])
	const fetchViewsData = async () => {
		const phoneNumber = await AsyncStorage.getItem('logined');
		console.log(phoneNumber)
		  try {
			const response =  await fetch(`${API_BASE_URL}/get_user_lessons_list`, {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
				mobile: phoneNumber.slice(-10)
			  }),
			})
			const data=await response.json();
			let purchased1 = await AsyncStorage.getItem('purchased') === 'true';
			console.log(purchased1,data)
			const updatedData = data.map((view,level) => ({
			  ...view,
			  lessons: view.lessons.map((lesson, index) => ({
				...lesson,
				auth: (purchased1 || true || level==0 || (level==1 && (index==0 || index ==1))) ? true : false ,
				type:level==0?"without":"with",
				index:level
			  }))
			}));
			const singleArray=updatedData.map(item => item.lessons).flat();
			updateSingleArray(singleArray)
			setData(updatedData)
		  } catch (error) {
			console.error("Fetch Error:", error);
		  }
		}
	const onReordered = async (fromIndex, toIndex) => {
		console.log("ONREORDERED",fromIndex,toIndex,lessons[0].LessonId)
		try {
			const response = await fetch(`${API_BASE_URL}/reorder_lessons`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					lessonId:lessons[0].LessonId,
					from_index_number: fromIndex + 1,
					make_it_index_number: toIndex + 1,
				}),
			});
			if (response.status === 201) {
				fetchLessons(); // Fetch the updated data after reordering
				await fetchViewsData();

			} else {
				console.error('Error reordering views:', response.status);
			}
		} catch (error) {
			console.error('Reorder Views Error:', error);
		}
	};


	// Fetch the lessons for the selected lessonId
	const fetchLessons = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/get_standard_lessons?id=${lessonId}`);
			const data = await response.json();
			// console.log("data", data);
			setLessons(data);
			console.log("DATA . ",data.length)
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}

	// Fetch the lesson data for the selected lessonId
	const fetchLessonData = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/get_views`);
			const data = await response.json();
			// setViewsData(data);
			// console.log(lessonId, data);
			const filteredData = data.filter(item => item.lesson_id === lessonId);
			// console.log("----------------")
			// console.log(filteredData)
			setLessonTitle(filteredData[0].lesson_title);
			setLessonSubTitle(filteredData[0].lesson_subtitle);
			// console.log('Views Data:', data);
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}

	useEffect(() => {
		fetchLessons();
		fetchLessonData();
	}, []);
	// const [recPermission,setRecPermission]=useState(false);
	const handleCardPress = (syllableId) => {
		checkPermissions().then((status)=>{
			if(status==true){
					try {
						getLessonType(syllableId).then((type)=>{
							console.log(type,idx)
							
							type=="without"?(navigation.navigate("Learn Screen",{id:syllableId,play:true,save:false})):(navigation.navigate("Lesson with Metronome",{id:syllableId,play:true,index:idx,save:false}))
						})
					} catch (error) {
						console.log("ERROR IN OPENING LESSON")
					}
			}

		})
	};

	const handleMenuPress = (lesson) => {
		setSelectedLesson(lesson);
		setModalVisible(true);
	};

	const editLessonTitle = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/edit_lesson`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: selectedLesson.id,
					Title: newTitle,
				}),
			});
			const result = await response.json();
			console.log('Edit Lesson Response:', result);
			if (response.ok) {
				setEditModalVisible(false);
				fetchLessons(); // Refresh the lessons after editing
				Alert.alert('Success', 'Lesson title updated successfully');
			} else {
				Alert.alert('Error', 'Failed to update lesson title');
			}
		} catch (error) {
			console.error("Edit Lesson Title Error:", error);
			Alert.alert('Error', 'Failed to update lesson title');
		}
	};

	const handleDeleteLesson = async () => {
		console.log('Deleting lesson:', selectedLesson);
		try {
			const response = await fetch(`${API_BASE_URL}/delete_lesson`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: selectedLesson.id }),
			});

			if (response.ok) {
				setLessons(lessons.filter(lesson => lesson.id !== selectedLesson.id));
				setModalVisible(false);
				Alert.alert("Success", "Lesson deleted successfully");
			} else {
				Alert.alert("Error", "Failed to delete lesson");
			}
		} catch (error) {
			console.error("Delete Error:", error);
			Alert.alert("Error", "An error occurred while deleting the lesson");
		}
	};

	const handleAddLyrics = () => {
		setModalVisible(false);
		navigation.navigate('AddLyrics', { lessonId: selectedLesson.id, isStandard: true });
	};

	const renderSyllableCard = (info) => {
		const { item, onDragStart, onDragEnd, isActive } = info;
		// console.log("item",item)
		return (
			<TouchableOpacity
				key={item.id}
				 // Adding styles
			>
				<View style={styles.syllableCardContainer}>
				<Card onPress={() => handleCardPress(item.id)}>
					<View style={styles.cardContent}>
						<View style={styles.textContainer}>
							<Text style={styles.syllableText}>{item.Title}</Text>
						</View>
						<TouchableOpacity 
						onPress={() => handleMenuPress(item)}
						onPressIn={onDragStart}
						onPressOut={onDragEnd}
						style={[styles.item, isActive && styles.activeItem]}
						>
							<Icon name="dots-three-vertical" size={20} color="black" />
					
						</TouchableOpacity>
					</View>
				</Card>
			</View>
			</TouchableOpacity>
			
		);
	};
	const HeaderComponent=()=>{
		return (
			<View style={styles.header}>
						<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={28} color="#000" />
						</TouchableOpacity>
						<View style={styles.titleContainer}>
							<Text style={[styles.heading, styles.boldText]}>{LessonTitle}</Text>
							<Text style={styles.heading}>{LessonSubTitle}</Text>
						</View>
			</View>
		)
	}
	const FooterComponent=()=>{
		return (
			<TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Post Lesson", { lessonId })}><Text style={styles.addButtonText}>Add lesson</Text></TouchableOpacity>
				
		)
	}
	return (
		<>
			{lessons && lessons.length > 0 ? (
				<Layout style={styles.container}>
					
					<View contentContainerStyle={styles.scrollContainer}>
						
					<DragList
						data={lessons}
						keyExtractor={keyExtractor}
						renderItem={renderSyllableCard}
						onReordered={onReordered}
						ListHeaderComponent={HeaderComponent}
						ListFooterComponent={FooterComponent}
					/>
						{/* {lessons.map(renderSyllableCard)} */}
					</View>
					</Layout>
			) : (
				<Layout style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
					<Text style={styles.heading}>{LessonTitle}</Text>
					<View style={styles.comingSoonContainer}>
						<Text style={styles.comingSoonText}>Coming Soon!</Text>
					</View>
				</Layout>
			)}

			<Modal
				visible={isModalVisible}
				backdropStyle={styles.backdrop}
				onBackdropPress={() => setModalVisible(false)}
			>
				<View style={[styles.modalContainer, { width: screenWidth * 0.8 }]}>
					<Text style={styles.modalTitle}>Options</Text>
					{selectedLesson && selectedLesson.Beats !== '0' && (
						<Button style={styles.modalButton} onPress={handleAddLyrics}>
							Add Lyrics
						</Button>
					)}
					<Button
						style={styles.modalButton}
						onPress={() => {
							setNewTitle(selectedLesson.Title);
							setEditModalVisible(true);
						}}
					>
						Edit Title
					</Button>
					<Button style={styles.modalButton} onPress={handleDeleteLesson}>
						Delete Lesson
					</Button>
					<Button style={styles.modalButton} onPress={() => setModalVisible(false)}>
						Cancel
					</Button>
				</View>
			</Modal>

			<Modal
				visible={editModalVisible}
				backdropStyle={styles.backdrop}
				onBackdropPress={() => setEditModalVisible(false)}
			>
				<View style={[styles.modalContainer, { width: screenWidth * 0.8 }]}>
					<Text style={styles.modalTitle}>Edit Lesson Title</Text>
					<TextInput
						style={styles.input}
						onChangeText={setNewTitle}
						value={newTitle}
						placeholder="Enter new title"
					/>
					<Button style={styles.modalButton} onPress={editLessonTitle}>Save</Button>
					<Button style={styles.modalButton} onPress={() => setEditModalVisible(false)}>Cancel</Button>
				</View>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	addButton: {
		backgroundColor: '#000',
		padding: 16,
		borderRadius: 8,
		marginTop: 16,
		alignItems: 'center',
	},
	addButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	backButton: {
		position: 'absolute',
		left: 16,
		top: 0,
		zIndex: 1,
	},
	titleContainer: {
		flex: 1,
		alignItems: 'center',
	},
	heading: {
		fontSize: 24,
		textAlign: 'center',
		marginBottom: 16,
		color: '#000',
	},
	boldText: {
		fontWeight: 'bold',
		fontSize: 36,
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
	syllableCardContainer: {
		// borderColor: 'red',
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
	syllableText: {
		fontSize: 18,
		fontWeight: 'bold',
		// textAlign: 'center',
		color: '#000',
		color:'black'
	},
	backdrop: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContainer: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		// width: '170%',
		alignSelf: 'center',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
		marginLeft: 8,
		color: '#000',
	},
	modalButton: {
		marginVertical: 6,
		backgroundColor: '#3366FF',
		borderColor: '#3366FF',
		marginBottom: 12,
		borderRadius: 12,
		elevation: 3,
	},
	comingSoonContainer: {
		backgroundColor: '#f5f5f5',
		padding: 16,
		borderRadius: 8,
		marginTop: 16,
	},
	comingSoonText: {
		fontSize: 18,
		textAlign: 'center',
		color: '#777',
	},
	input: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		paddingHorizontal: 10,
		borderRadius: 8,
		color: '#000',
	},
});

export default LessonScreen;
