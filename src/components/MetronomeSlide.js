import React from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

const RenderSlide = ({ item, numberOfParts, highlightedIndex, initialOffset, customColors, lyricsScrollViewRef, clapLesson, cycleCountRef, totalCycles, Lyrics, count }) => {
	if (item.id === 1) {
		const circleRadius = Dimensions.get('window').width * 0.3;
		const dotSize = 10;
		const numberRadius = circleRadius - 20;  // Adjust this value to position numbers closer to the center if needed

		return (
			<View style={[styles.slide, { width }]}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<View style={[styles.circle, { width: circleRadius * 2, height: circleRadius * 2 }]}>
						<Text style={styles.centerText}>
							{count > 0 ? count : Lyrics[highlightedIndex + (cycleCountRef.current - 1) * numberOfParts]}
						</Text>
						{Array.from({ length: numberOfParts }).map((_, index) => {
							const angle = ((index + numberOfParts / 4) * 360) / numberOfParts;
							const dotX = circleRadius + circleRadius * Math.cos((angle * Math.PI) / 180);
							const dotY = circleRadius + circleRadius * Math.sin((angle * Math.PI) / 180);
							const numberX = circleRadius + numberRadius * Math.cos((angle * Math.PI) / 180);
							const numberY = circleRadius + numberRadius * Math.sin((angle * Math.PI) / 180);

							return (
								<View key={index} style={{ position: 'absolute', left: dotX - dotSize / 2, top: dotY - dotSize / 2 }}>
									<View
										style={[
											styles.dot,
											{
												backgroundColor: customColors[(index + initialOffset) % numberOfParts],
												borderRadius: highlightedIndex === (index + initialOffset) % numberOfParts ? 0 : 5,
												transform: highlightedIndex === (index + initialOffset) % numberOfParts ? "scale(1.5)" : 'scale(1)'
											},
										]}
									/>
									<Text style={[styles.indexText, { position: 'absolute', left: numberX - dotX, top: numberY - dotY, }]}>
										{((index + initialOffset) % numberOfParts) + 1}
									</Text>
								</View>
							);
						})}
					</View>
				</View>
			</View>
		);
	} else {
		return (
			<View style={[styles.slide, { width }]}>
				<View style={{ maxHeight: height - 400, paddingTop: 35 }}>
					<ScrollView ref={lyricsScrollViewRef} contentContainerStyle={styles.lyricsContentContainer}>
						<View style={styles.column}>
							<Text style={styles.heading}>Cycle</Text>
							{clapLesson.map((beat, index) => (
								<Text key={index} style={[styles.beatNumber, index === ((highlightedIndex + (cycleCountRef.current - 1) * numberOfParts) % (totalCycles * numberOfParts)) && styles.highlightedBeat]}>
									{(index % numberOfParts) === 0 ? (index / numberOfParts) + 1 : " "}
								</Text>
							))}
						</View>
						<View style={styles.column}>
							<Text style={styles.heading}>Beat</Text>
							{clapLesson.map((beat, index) => (
								<Text key={index} style={[styles.beatNumber, index === ((highlightedIndex + (cycleCountRef.current - 1) * numberOfParts) % (totalCycles * numberOfParts)) && styles.highlightedBeat]}>
									{(index % numberOfParts) + 1}
								</Text>
							))}
						</View>
						<View style={styles.column}>
							<Text style={styles.heading}>Notation</Text>
							{clapLesson.map((beat, index) => (
								<Text key={index} style={[styles.beatText, index === ((highlightedIndex + (cycleCountRef.current - 1) * numberOfParts) % (totalCycles * numberOfParts)) && styles.highlightedBeat]}>
									{beat.split(" ").map((word, wordIndex) => word.startsWith('#') ? <Text key={wordIndex} style={{ fontWeight: rider ? 'bold' : '400' }}>{word.substring(1) + ' '}</Text> : word + ' ')}
								</Text>
							))}
						</View>
					</ScrollView>
				</View>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	slide: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1
	},
	circle: {
		borderRadius: 9999,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5D17D',
		opacity: 0.46,
		zIndex: -1,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#AEAEAE',
		position: 'absolute',
		zIndex: 1,
	},
	indexText: {
		position: 'absolute',
		color: 'black',
		fontSize: 16,
	},
	centerText: {
		position: 'absolute',
		color: 'black',
		fontSize: 24,
		fontWeight: 'bold',
	},
	column: {
		// display: 'flex',
		// width: '60%',
		alignItems: 'center',
	},
	beatNumber: {
		marginBottom: 5,
		color: 'black',
		fontSize: 18,
		fontWeight: '200'
	},
	beatText: {
		marginBottom: 5,
		color: 'black',
		fontSize: 18,
		fontWeight: '200'
	},
	highlightedBeat: {
		backgroundColor: 'yellow',
	},
	heading: {
		fontSize: 18,
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#000',
	},
	lyric: {
		fontSize: 16,
		marginBottom: 10,
		textAlign: 'center',
		color: '#000',
	},
	lyricsScrollView: {
		height: 100, // Set the desired height for the scrollable lyrics container
		marginTop: 25, // Adjust as necessary
	},
	lyricsContentContainer: {
		width: '85%',
		flexGrow: 1,
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		gap: 10,
		alignItems: 'center',
	},
});

export default RenderSlide;