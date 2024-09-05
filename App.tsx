import 'react-native-gesture-handler';
import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
  <ApplicationProvider {...eva} theme={eva.light}>
    <AppNavigator />
  </ApplicationProvider>
    
  );
}