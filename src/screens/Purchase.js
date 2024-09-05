import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { PurchaseError, requestSubscription, useIAP, validateReceiptIos, validateReceiptAndroid } from 'react-native-iap';
import { APP_STORE_SECRET, GOOGLE_PLAY_PUBLIC_KEY } from '@env';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Subscription SKUs for different platforms
const subscriptionSkus = Platform.select({
  ios: ['takadimi_199_1m', 'takadimi_1999_1y_2m0'],
  android: ['takadimi_monthly', 'takadimi_1yearly'],
});

const Purchase = ({ navigation }) => {
  // Hooks provided by react-native-iap for managing in-app purchases
  const {
    connected, // Boolean indicating if the app is connected to the IAP service
    subscriptions, // List of available subscriptions
    getSubscriptions, // Function to fetch subscriptions
    currentPurchase, // Details of the current purchase
    finishTransaction, // Function to finalize the transaction
    purchaseHistory, // List of past purchases
    getPurchaseHistory, // Function to fetch purchase history
  } = useIAP();

  const [loading, setLoading] = useState(true); // State to manage loading indicator for fetching subscriptions
  const [purchaseLoading, setPurchaseLoading] = useState(false); // State to manage loading indicator for purchase process

  // Function to fetch purchase history
  const handleGetPurchaseHistory = async () => {
    console.log("Fetching purchase history...");
    try {
      const history = await getPurchaseHistory();
      console.log("Purchase history fetched successfully", history);
    } catch (error) {
      console.error('Error fetching purchase history', error);
    }
  };

  // Effect to fetch purchase history when connection status changes
  useEffect(() => {
    console.log("Connected status changed:", connected);
    if (connected) {
      handleGetPurchaseHistory();
    }
  }, [connected]);

  // Function to fetch subscriptions
  const handleGetSubscriptions = async () => {
    console.log("Fetching subscriptions with SKUs:", subscriptionSkus);
    try {
      const subs = await getSubscriptions({ skus: subscriptionSkus });
      console.log("Subscriptions fetched successfully", subs);
    } catch (error) {
      console.error('Error fetching subscriptions', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch subscriptions when connection status changes
  useEffect(() => {
    console.log("Checking connection status for fetching subscriptions...");
    if (connected) {
      handleGetSubscriptions();
    }
  }, [connected]);

  // Effect to navigate to 'All Levels Screen' if user has purchased a relevant subscription
  useEffect(() => {
    console.log("Purchase history updated:", purchaseHistory);
    if (
      purchaseHistory.some(
        (x) => x.productId === subscriptionSkus[0] || x.productId === subscriptionSkus[1],
      )
    ) {
      console.log("User has a relevant subscription, navigating to 'All Levels Screen'");
      navigation.navigate('All Levels Screen');
    }
  }, [connected, purchaseHistory, subscriptions]);

  // Function to handle the purchase of a subscription
  const handleBuySubscription = async (productId) => {
    console.log("Initiating purchase for product ID:", productId);
    setPurchaseLoading(true);
    try {
      const subscription = subscriptions.find(sub => sub.productId === productId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      if (isIos) {
        await requestSubscription({ sku: productId });
      } else if (isAndroid) {
        const offerToken = subscription.subscriptionOfferDetails[0]?.offerToken;
        console.log("Offer token:", offerToken);
        // await requestSubscription({ sku: productId, subscriptionOffers: [{ offerToken }] });
        await requestSubscription({ sku: productId, subscriptionOffers: [{sku : productId, offerToken}]});
      }
      console.log("Subscription request successful for product ID:", productId);
    } catch (error) {
      navigation.navigate("Purchase Status",{status:"failed"})
      if (error instanceof PurchaseError) {
        console.error(`[${error.code}]: ${error.message}`, error);
      } else {
        console.error('Error purchasing subscription', error);
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Effect to validate the current purchase and navigate to 'All Levels Screen' if validation is successful
  useEffect(() => {
    const checkCurrentPurchase = async (purchase) => {
      console.log("Checking current purchase:", purchase);
      if (purchase) {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            if (isIos) {
              const isTestEnvironment = __DEV__;
              const appleReceiptResponse = await validateReceiptIos(
                {
                  'receipt-data': receipt,
                  password: APP_STORE_SECRET,
                },
                isTestEnvironment,
              );
              console.log("iOS receipt validation response:", appleReceiptResponse);

              if (appleReceiptResponse && appleReceiptResponse.status === 0) {
                console.log("iOS receipt validation successful, navigating to 'All Levels Screen'");
                
                  navigation.navigate("Purchase Status",{status:"success"})
                // Alert.alert('Success', 'Subscription completed successfully!', [
                //   { text: 'OK', onPress: () => navigation.navigate('All Levels Screen') }
                // ]);
              }
            } else if (isAndroid) {
              const androidReceiptResponse = await validateReceiptAndroid({
                packageName: purchase.packageNameAndroid,
                productId: purchase.productId,
                token: receipt,
                key: GOOGLE_PLAY_PUBLIC_KEY,
                // productToken: purchase.purchaseToken,
                // accessToken: GOOGLE_PLAY_PUBLIC_KEY,
                // isSub: true,
              });
              console.log("Android receipt validation response:", androidReceiptResponse);

              if (androidReceiptResponse && androidReceiptResponse.purchaseState === 0) {
                console.log("Android receipt validation successful, navigating to 'All Levels Screen'");
                navigation.navigate("Purchase Status",{status:"success"})
                // Alert.alert('Success', 'Subscription completed successfully!', [
                //   { text: 'OK', onPress: () => navigation.navigate('All Levels Screen') }
                // ]);
              }
            }
          }
        } catch (error) {
          
          navigation.navigate("Purchase Status",{status:"failed"})
          console.error('Error validating purchase', error);
        }
      }
    };
    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);

  useEffect(() => {
    console.log("Subscriptions updated:", subscriptions);
  }, [subscriptions]);

  if (!connected || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={require('../assets/images/TakaDimi1.png')} style={styles.image} />
        <View style={styles.innerContainer}>
          <Text style={styles.header}>ACCESS ALL LESSONS FOR</Text>
          {subscriptions.map((subscription, index) => {
            const owned = purchaseHistory.some(
              (s) => s?.productId === subscription.productId,
            );
            return (
              <View key={index} style={styles.subscriptionContainer}>
                <TouchableOpacity
                  onPress={() => handleBuySubscription(subscription.productId)}
                  style={[
                    styles.button,
                    {
                      backgroundColor: subscription.productId.includes('_1y') ? '#F5D17D' : '#B9B9B9',
                    },
                  ]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>
                      {isIos ? (
                        <Text style={styles.boldText}>{subscription.localizedPrice} </Text>
                      ) :
                        <Text style={styles.boldText}>{subscription.subscriptionOfferDetails && subscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice} </Text>
                      }
                      / {subscription.productId.includes('_1y') ? 'year' : 'month'}
                    </Text>
                    {subscription.productId.includes('_1y') && (
                      <Text style={styles.subText}>Get <Text style={styles.boldText}>2 months free</Text></Text>
                    )}
                  </View>
                </TouchableOpacity>
                {owned && (
                  <Text style={styles.ownedText}>You are Subscribed to this plan!</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      {purchaseLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    resizeMode: 'contain',
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 22,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '300',
  },
  subscriptionContainer: {
    width: '100%',
    marginVertical: 10,
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 24,
    fontWeight: '300',
  },
  boldText: {
    fontWeight: 'bold',
  },
  subText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '300',
  },
  ownedText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'green',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Purchase;