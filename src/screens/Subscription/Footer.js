import React from 'react';
import { View, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { InAppPurchaseService } from './InAppPurchaseService';

const Footer = ({ sku }) => {
  const { requestPurchase, isInitialized } = InAppPurchaseService();

  return (
    <View style={styles.footer}>
      {!isInitialized ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Purchase" onPress={() => requestPurchase(sku)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Footer;
