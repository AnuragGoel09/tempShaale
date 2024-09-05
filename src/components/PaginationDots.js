import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Image, SafeAreaView, BackHandler, Alert } from 'react-native';

const PaginationDots = ({ currentIndex, slides }) => {
	return (
		<View style={styles.pagination}>
			{slides.map((_, index) => (
				<View
					key={index}
					style={[
						styles.Dot,
						{ opacity: currentIndex === index ? 1 : 0.3 },
					]}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	pagination: {
		position: 'absolute',
		bottom: 20,
		flexDirection: 'row',
		alignSelf: 'center',
	},
	Dot: {
		height: 10,
		width: 10,
		borderRadius: 5,
		backgroundColor: '#000',
		margin: 8,
	},
});

export default PaginationDots;