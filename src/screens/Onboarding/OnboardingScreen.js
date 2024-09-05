import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, Image, StyleSheet, Animated, FlatList, View, Text, StatusBar, TouchableOpacity, Dimensions, Platform } from 'react-native';
import COLORS from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../../assets/images/ob1.png'),
    backgroundColor: '#F5D17D',
  },
  {
    id: '2',
    image: require('../../assets/images/ob2.png'),
    backgroundColor: '#FFFFFF',
  },
  {
    id: '3',
    image: require('../../assets/images/ob3.png'),
    backgroundColor: '#FFFFFF',
  },
  {
    id: '4',
    image: require('../../assets/images/ob4.png'),
    backgroundColor: '#FFFFFF',
  },
  {
    id: '5',
    image: require('../../assets/images/ob5.png'),
    backgroundColor: '#F5D17D',
  },
];

const Slide = ({ item }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {item?.image && (
        <Image
          source={item?.image}
          style={{ height: height, width, resizeMode: 'cover' }}
        />
      )}
      <View style={{ width }}>
        <Text style={styles.title}>{item?.title}</Text>
        <Text style={styles.subtitle}>{item?.subtitle}</Text>
      </View>
    </View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef();
  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const currentSlideBackgroundColor = slides[currentSlideIndex]?.backgroundColor || COLORS.primary;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentSlideBackgroundColor);
    }
    StatusBar.setBarStyle(currentSlideBackgroundColor === '#FFFFFF' ? 'dark-content' : 'light-content');
  }, [currentSlideBackgroundColor]);

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const skip = () => {
    const lastSlideIndex = slides.length - 1;
    const offset = lastSlideIndex * width;
    ref?.current.scrollToOffset({ offset });
    setCurrentSlideIndex(lastSlideIndex);
  };

  const Footer = () => {
    const isWhiteBackground = currentSlideIndex === 0 || currentSlideIndex === 4;
    const buttonColor = isWhiteBackground ? COLORS.black : COLORS.white;
    const buttonBackgroundColor = isWhiteBackground ? COLORS.white : COLORS.black;

    return (
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex == index && {
                  backgroundColor: COLORS.indicator,
                  width: 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: buttonBackgroundColor }]}
            onPress={async () => {
              AsyncStorage.setItem('launched', 'Yes');
              navigation.replace('LoginWithOtp');
            }}
          >
            <Text style={[styles.btnText, { color: buttonColor }]}>
              GET STARTED
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentSlideBackgroundColor }]}>
      {/* <View style={styles.imageContainer}>
        <Image
          source={slides[currentSlideIndex].image}
          style={styles.backgroundImage}
        />
      </View>
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height * 1 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        // renderItem={({ item }) => <Slide item={item} />}
        // renderItem={({ item }) => (
        //   <View style={styles.imageContainer}>
        //     <Image source={item.image} style={styles.backgroundImage} />
        //   </View>
        // )}
        renderItem={() => <View style={{ width, height }} />}
      /> */}
      <View style={styles.imageContainer}>
        {slides.map((slide, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.Image
              key={index}
              source={slides[currentSlideIndex].image}
              style={[styles.backgroundImage, { opacity }]}
            />
          );
        })}
      </View>
      <Animated.FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: updateCurrentSlideIndex }
        )}
        renderItem={() => <View style={{ width, height }} />}
        contentContainerStyle={{ height: height * 1 }}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'absolute',
    width: width,
    height: height,
    // flexDirection: 'row',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 23,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: '#AEAEAE',
    marginHorizontal: 3,
    borderRadius: 999,
  },
  footer: {
    height: height * 0.1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom:13
  },
  buttonContainer: {
    // marginTop: 10,
    // marginBottom: 20,
  },
  btn: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.black,
  },
});

export default OnboardingScreen;