import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { InAppPurchaseService } from './InAppPurchaseService';
import Footer from './Footer';

const SubscriptionScreen = () => {
  const { subscriptions } = InAppPurchaseService();

  const renderSubscriptionItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>{item.localizedPrice}</Text>
      <Footer sku={item.productId} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Subscriptions</Text>
      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.productId}
        ListEmptyComponent={<Text>No subscriptions available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemTitle: {
    fontSize: 18,
  },
});

export default SubscriptionScreen;