import { Alert, Linking, Platform } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const checkPermissions = async () => {
    try {
        if (Platform.OS === 'android') {
            const result = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
            if (result === RESULTS.GRANTED) {
                console.log('You can use the mic');
                return true;
            } else {
                const requestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (requestResult === RESULTS.GRANTED) {
                    console.log('You can use the mic');
                    return true;
                } else {
                    Alert.alert(
                              'Microphone Permission Required', // Title of the alert
                              '', // Message of the alert
                              [
                                { text: "Open Settings", onPress: () => Linking.openSettings() },
                              ]
                          )
                    console.log('Permission denied');
                    return false;
                }
            }
        }
        else if (Platform.OS === 'ios') {
            const result = await check(PERMISSIONS.IOS.MICROPHONE);
            if (result === RESULTS.GRANTED) {
                console.log('You can use the mic');
                return true;
            } else {
                const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
                if (requestResult === RESULTS.GRANTED) {
                    console.log('You can use the mic');
                    return true;
                } else {
                    Alert.alert(
                        'Microphone Permission Required', // Title of the alert
                        '', // Message of the alert
                        [
                          { text: "Open Settings", onPress: () => Linking.openSettings() },
                        ]
                    )
                    console.log('Permission denied');
                    return false;
                }
            }
        }
    } catch (err) {
        console.warn(err);
        return false;
    }
    return false
};
export {
    checkPermissions
}