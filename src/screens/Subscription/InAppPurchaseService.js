import React, { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';

const itemSkus = Platform.select({
  ios: [
    'takadimi_199_1m',
    'takadimi_1999_1y_2m0',
  ],
  android: [
    'takadimi_199_1m',
    'takadimi_1999_1y_2m0',
  ],
});

export const InAppPurchaseService = () => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing connection...');
        const result = await RNIap.initConnection();
        console.log('Connection initialized successfully:', result);
        setIsInitialized(true);

        // Fetch products and subscriptions
        fetchProducts();
      } catch (err) {
        console.warn('Error connecting to store:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        console.log('Fetching subscriptions with SKUs:', itemSkus);
        const products = await RNIap.getSubscriptions(itemSkus);
        console.log('Available subscriptions:', products);
        setProducts(products);
        setSubscriptions(products);
      } catch (err) {
        console.warn('Error fetching subscriptions:', err);
      }
    };

    initializeIAP();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  useEffect(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
      console.log('Purchase updated:', purchase);
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          await RNIap.finishTransaction(purchase, false);
          console.log('Transaction finished:', purchase);
          Alert.alert('Purchase Successful', 'Thank you for your purchase!');
        } catch (error) {
          console.warn('Error finishing transaction:', error);
          Alert.alert('Purchase Error', 'Something went wrong. Please try again.');
        }
      }
    });

    const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.warn('Purchase error:', error);
      Alert.alert('Purchase Error', 'Something went wrong. Please try again.');
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, []);

  const requestPurchase = async (sku) => {
    try {
      console.log(`Requesting purchase for SKU: ${sku}`);
      await RNIap.requestSubscription(sku);
    } catch (err) {
      console.warn(`Error purchasing product ${sku}:`, err);
      Alert.alert('Purchase Error', 'Something went wrong. Please try again.');
    }
  };

  return {
    products,
    subscriptions,
    requestPurchase,
    isInitialized,
  };
};
