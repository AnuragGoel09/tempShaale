import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Dimensions, Linking, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
const { width } = Dimensions.get('window');
import { API_BASE_URL, purchasedUsers } from '../../config';
import PhoneInput from 'react-native-international-phone-number';
import Icon from 'react-native-vector-icons/Entypo';
import { OtpInput } from 'react-native-otp-entry';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginWithOtp = () => {

  const navigation = useNavigation();

  const [OTP, setOTP] = useState('');
  const [OTPsent, setOTPsent] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const phoneInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [sendOtpClicked, setSendOtpClicked] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [error,setError]=useState("")

  useEffect(() => {
    const check = async () => {
      if (OTP.length === 6) {
        const phone = selectedCountry.callingCode + inputValue;
        const phoneNumber = phone.replace(/\s/g, '');
        console.log(phoneNumber, OTP);
        try {
          const res = await fetch(
            `${API_BASE_URL}/verifyOTP`,
            {
              method: 'POST',
              body: JSON.stringify({ "mobile": phoneNumber, "otp": OTP }),
              headers: {
                "Content-Type": "application/json"
              }
            },
          );
          const resData = await res.json();
          if (resData.signin) {
            await AsyncStorage.setItem("logined", phoneNumber);
            await AsyncStorage.setItem("token", resData.token);
            if (purchasedUsers.includes(phoneNumber)) {
              await AsyncStorage.setItem("purchased", 'true');
            }
            else {
              await AsyncStorage.setItem("purchased", 'false');
            }
            navigation.replace("All Levels Screen");
          }
          else {
            setOTP('');
            alert("Invalid OTP");
          }
          console.log("Response:", resData)
        } catch (err) {
          console.log(err.message);
        }
      }
    }
    check();
  }, [OTP]);

  useEffect(() => {
    if (!OTPsent) {
      // Focus the phone input when OTP is not sent
      phoneInputRef.current?.focus();
    }
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [OTPsent]);

  useEffect(() => {
    if (inputValue.length === 12) {
      Keyboard.dismiss();
    }
  }, [inputValue])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      // console.log("height:", event.endCoordinates.height);
      setKeyboardOffset(event.endCoordinates.height);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  function handleInputValue(phoneNumber) {
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country) {
    setSelectedCountry(country);
  }
  // console.log(purchasedUsers[1])
  const handleLoginWithOtp = async () => {
    // await AsyncStorage.removeItem('logined'); await AsyncStorage.removeItem('launched');
    // return;
    // console.log("HERE",inputValue,purchasedUsers[1])
    // if(inputValue==purchasedUsers[1]){
      
    //   navigation.replace("All Levels Screen");
    //   return;
    // }

    if (sendOtpClicked) {
      return;
    }
    setSendOtpClicked(true);
    console.log(selectedCountry, inputValue);
    const phone = selectedCountry.callingCode + inputValue;
    const phoneNumber = phone.replace(/\s/g, '');
    console.log(phoneNumber);
    try {
      const res = await fetch(
        `${API_BASE_URL}/askOtp`,
        {
          method: 'POST',
          body: JSON.stringify({ "mobile": phoneNumber }),
          headers: {
            "Content-Type": "application/json"
          }
        },
      );
      const resData = await res.text();
      if (resData === "OTP sent successfully") {
        setOTPsent(true);
      }
      else if (resData === 'Failed to send OTP via SMS') {
        alert("Failed to send OTP via SMS");
        setError(()=>"Failed to send OTP via SMS")
        setSendOtpClicked(false);
      }
      else{
        setError(()=>"Please wait for 24 hours and try again")
      }
      console.log("Response:", resData);
      setSendOtpClicked(false);
    } catch (err) {
      console.log(err.message);
      setError(()=>"Internal server error")
      setSendOtpClicked(false);
    }
    // Implement your logic for handling login with OTP here
    // navigation.navigate('Lessons')
    console.log('Login with OTP button pressed');
  };

  const handleSeeOtherWays = () => {
    // Navigate to the existing login screen
    navigation.navigate('Login');
  };
  useEffect(()=>{
    if(error.length!=0){
      setTimeout(()=>{
        setError(()=>"")
      },2000)
    }
  },[error])
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <KeyboardAvoidingView
        behavior='marginBottom'
        style={{ flex: 1 }}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }}>
          <Image source={require('../../assets/images/TakaDimi1.png')} style={{ width, resizeMode: 'contain' }} />
          <View style={{ flex: 1, marginHorizontal: 22, justifyContent: 'center', paddingBottom: keyboardOffset / 4 }}>
            {/* <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: COLORS.black }}>Login with OTP</Text> */}

            <View style={{ marginBottom: 12 }}>
              {/* <Text style={{ fontSize: 16, fontWeight: '400', marginBottom: 8, color: COLORS.black }}>Phone Number</Text> */}
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                {!OTPsent ? <PhoneInput
                  value={inputValue}
                  keyboardType='phone-pad'
                  onChangePhoneNumber={handleInputValue}
                  selectedCountry={selectedCountry}
                  customCaret={<Icon name="chevron-down" size={20} />}
                  onChangeSelectedCountry={handleSelectedCountry}
                  defaultCountry="IN"
                  placeholder="Enter your mobile number"
                  phoneInputStyles={{
                    container: {
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: '#B9B9B9',
                    },
                    flagContainer: {
                      borderTopLeftRadius: 7,
                      borderBottomLeftRadius: 7,
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                    },
                    flag: {},
                    caret: {
                      display: 'none',
                      color: 'transparent',
                      fontSize: 16,
                    },
                    divider: {
                      backgroundColor: '#fff',
                      display: 'none'
                    },
                    callingCode: {
                      fontSize: 16,
                      fontWeight: '300',
                      color: '#B9B9B9',
                    },
                    input: {
                      color: '#000',
                    },
                  }}

                /> : <OtpInput
                  numberOfDigits={6}
                  focusColor="orange"
                  onTextChange={(text) => {console.log(text);setOTP(text)}}
                  pinCodeTextStyle={styles.inputsContainer}
          
                />}
              </View>
            </View>

            {!OTPsent && <TouchableOpacity onPress={handleLoginWithOtp} style={{ backgroundColor: 'black', borderRadius: 8, alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>{sendOtpClicked ? <ActivityIndicator color="#fff" /> : 'LOGIN WITH OTP'}</Text>
            </TouchableOpacity>}
            {<View style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:10}} >
              <Text style={{color:'red'}}>{error}</Text>  
            </View>}
            {/* <View style={{ alignItems: 'center', marginTop: 20 }}>
        {!OTPsent && <TouchableOpacity onPress={sendOtpClicked ? '' : handleLoginWithOtp} style={{ backgroundColor: 'black', borderRadius: 8, alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>{sendOtpClicked ? <ActivityIndicator color="#fff" /> : 'LOGIN WITH OTP'}</Text>
        </TouchableOpacity>}
        {/* <View style={{ alignItems: 'center', marginTop: 20 }}>
          <TouchableOpacity onPress={handleSeeOtherWays}>
            <Text style={{ color: COLORS.primary }}>See other ways to login</Text>
          </TouchableOpacity>
        </View> */}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => Linking.openURL('https://shaale.com/terms-of-service')}>
              <Text style={{ color: 'black', marginRight: 10, fontWeight: '200', fontSize: 18 }}>Terms of Service</Text>
            </TouchableOpacity>
            <Text>|</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://shaale.com/faqs')}>
              <Text style={{ color: 'black', marginLeft: 10, fontWeight: '200', fontSize: 18 }}>FAQs</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles=StyleSheet.create({
  inputsContainer:{
    color:'black'
  }
})
export default LoginWithOtp;