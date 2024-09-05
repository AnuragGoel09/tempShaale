import React from "react";
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/TakaDimi1.png')} style={styles.logo} />
        <ActivityIndicator size="large" color="#000000" style={styles.activityIndicator} />
    </View>
);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    activityIndicator: {
        marginTop: 20,
    },
});

export default LoadingScreen;