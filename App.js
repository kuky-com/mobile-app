import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import Text from '@/components/Text';
import MainApp from '@/screens'
import { NavigationContainer } from '@react-navigation/native';
import Toast, { BaseToast } from 'react-native-toast-message'
import images from '@/utils/images';
import { Image } from 'expo-image';
import { isReadyRef, navigationRef } from '@/utils/NavigationService';
import { Provider } from 'jotai';
import { storeAtom } from '@/actions/global';
import './sheets'
import { SheetProvider } from "react-native-actions-sheet"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Suspense, useEffect } from 'react';
import axios, { Axios } from 'axios';
import dayjs from 'dayjs'

var relativeTime = require('dayjs/plugin/relativeTime')
var customParseFormat = require("dayjs/plugin/customParseFormat")

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

{/* <BaseToast
      {...props}
      style={{ padding: 0, margin: 0, backgroundColor: '#725ED4', width: Dimensions.get('screen').width, height: Dimensions.get('screen').height, alignItems: 'center' }}
      contentContainerStyle={{ padding: 0, margin: 0, backgroundColor: '#725ED4', width: Dimensions.get('screen').width, height: Dimensions.get('screen').height, alignItems: 'center' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400'
      }}
    /> */}
const toastConfig = {
  sent: ({ text1, props, text2 }) => (
    <View style={{ flex: 1, padding: 16, margin: 0, gap: 32, backgroundColor: '#725ED4', width: Dimensions.get('window').width, height: Dimensions.get('window').height, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={images.sent_icon} style={{ width: 120, height: 120 }} contentFit='contain' />
      <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{text1}</Text>
      <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{text2}</Text>
    </View>
  ),
  deny: ({ text1, props, text2 }) => (
    <View style={{ flex: 1, padding: 16, margin: 0, gap: 32, backgroundColor: '#725ED4', width: Dimensions.get('window').width, height: Dimensions.get('window').height, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={images.deny_icon} style={{ width: 120, height: 120 }} contentFit='contain' />
    </View>
  ),
}

export default function App() {
  const [loaded, error] = useFonts({
    'Comfortaa-Light': require('./src/assets/fonts/Comfortaa-Light.ttf'),
    'Comfortaa-Regular': require('./src/assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('./src/assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-SemiBold': require('./src/assets/fonts/Comfortaa-SemiBold.ttf'),
    'Comfortaa-Bold': require('./src/assets/fonts/Comfortaa-Bold.ttf'),
  });

  return (
    <SafeAreaProvider>
      <SheetProvider>
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => {
            isReadyRef.current = true;
          }}>
          <StatusBar translucent style='dark' />
          <Suspense>
          <Provider store={storeAtom}>
            <MainApp />
          </Provider>
          </Suspense>
          <Toast config={toastConfig} />
        </NavigationContainer>
      </SheetProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
