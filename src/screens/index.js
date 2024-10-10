import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Tabbar from '@/components/Tabbar';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import ExploreScreen from './interest/ExploreScreen';
import MatchesScreen from './match/MatchesScreen';
import ProfileScreen from './profile/ProfileScreen';
import SplashScreen from './auth/SplashScreen';
import GetStartScreen from './auth/GetStartScreen';
import SignUpEmailScreen from './auth/SignUpEmailScreen';
import SignUpScreen from './auth/SignUpScreen';
import SignInScreen from './auth/SignInScreen';
import MessageScreen from './chat/MessageScreen';
import BlockedUsersScreen from './profile/BlockedUsersScreen';
import ConnectProfileScreen from './interest/ConnectProfileScreen';
import EmailVerificationScreen from './auth/EmailVerificationScreen';
import UpdateProfileScreen from './auth/UpdateProfileScreen';
import UpdatePasswordScreen from './auth/UpdatePasswordScreen';
import AvatarUpdateScreen from './onboarding/AvatarUpdateScreen';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import VerificationSuccessScreen from './auth/VerificationSuccessScreen';
import PremiumRequestScreen from './chat/PremiumRequestScreen';
import InterestSelectScreen from './interest/InterestSelectScreen';
import DislikeSelectScreen from './interest/DislikeSelectScreen';
import GetMatchScreen from './match/GetMatchScreen';
import BirthdayUpdateScreen from './onboarding/BirthdayUpdateScreen';
import GenderUpdateScreen from './onboarding/GenderUpdateScreen';
import LocationUpdateScreen from './onboarding/LocationUpdateScreen';
import OnboardingCompleteScreen from './onboarding/OnboardingCompleteScreen';
import ProfileTagScreen from './onboarding/ProfileTagScreen';
import PronounsUpdateScreen from './onboarding/PronounsUpdateScreen';
import ReviewProfileScreen from './onboarding/ReviewProfileScreen';
import SettingScreen from './profile/SettingScreen';
import { deviceIdAtom, pushTokenAtom, userAtom } from '@/actions/global';
import DeviceInfo from 'react-native-device-info'
import NavigationService, { navigationRef } from '@/utils/NavigationService';
import { useRoute } from '@react-navigation/native'
import PurposeUpdateScreen from './onboarding/PurposeUpdateScreen';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import apiClient from '@/utils/apiClient';
import NameUpdateScreen from './onboarding/NameUpdateScreen';
import NotificationListScreen from './notification/NotificationListScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DislikeUpdateScreen from './profile/DislikeUpdateScreen';
import InterestUpdateScreen from './profile/InterestUpdateScreen';
import PurposeProfileScreen from './profile/PurposeProfileScreen';
import { Platform } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: '#00000000' }}
            screenOptions={{ tabBarShowLabel: false, headerShown: false, lazy: false }}
            tabBar={props => <Tabbar {...props} />} initialRouteName="ExploreScreen">
            <Tab.Screen name="ExploreScreen" component={ExploreScreen} />
            <Tab.Screen name="MatchesScreen" component={MatchesScreen} />
            <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppStack = ({ navgation }) => {
    const setDeviceId = useSetAtom(deviceIdAtom)
    const setPushToken = useSetAtom(pushTokenAtom)
    const currentUser = useAtomValue(userAtom)

    useEffect(() => {
        if (Platform.OS === 'ios') {
            PushNotificationIOS.requestPermissions()
                .then((data) => {
                    console.log({ data })
                })
                .catch(error => {
                    console.log({ error })
                })
        }
    }, [])

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            try {

                await messaging().registerDeviceForRemoteMessages();
                const token = await messaging().getToken();
                console.log({ pushToken: token })
                setPushToken(token)
                AsyncStorage.getItem('ACCESS_TOKEN', (error, result) => {
                    if (result) {
                        apiClient.post('users/update-token', { session_token: token })
                            .then((res) => {
                                console.log({ res })
                            })
                            .catch((error) => {
                                console.log({ error })
                            })
                    }
                })
            } catch (error) {

            }
        }
    }

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        });
    
        return unsubscribe;
      }, []);

      useEffect(() => {
        const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
            if (remoteMessage) {
                if(remoteMessage.data && remoteMessage.data.data) {
                    try {
                        const notiData = JSON.parse(remoteMessage.data.data)
                        if(navigationRef.current.getCurrentRoute().name === 'SplashScreen') {
                            setTimeout(() => {
                                if(notiData.type === 'message') {
                                    if(notiData.match && notiData.match.conversation_id) {
                                        NavigationService.resetRaw([
                                            {name: 'Dashboard'},
                                            {name: 'MessageScreen', params: {conversation: notiData.match}}
                                        ])
                                    } else {
                                        NavigationService.resetRaw([
                                            {name: 'Dashboard'},
                                            {name: 'MatchesScreen'}
                                        ])
                                    }
                                } else {
                                    NavigationService.resetRaw([
                                        {name: 'Dashboard'},
                                        {name: 'NotificationScreen'}
                                    ])
                                }
                            }, 1200);
                        } else {
                            if(notiData.type === 'message') {
                                if(notiData.match && notiData.match.conversation_id) {
                                    NavigationService.resetRaw([
                                        {name: 'Dashboard'},
                                        {name: 'MessageScreen', params: {conversation: notiData.match}}
                                    ])
                                } else {
                                    NavigationService.resetRaw([
                                        {name: 'Dashboard'},
                                        {name: 'MatchesScreen'}
                                    ])
                                }
                            } else {
                                NavigationService.resetRaw([
                                    {name: 'Dashboard'},
                                    {name: 'NotificationScreen'}
                                ])
                            }
                        }
                        
                    } catch (error) {
                        console.log({error})
                    }
                }
            }
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    if(remoteMessage.data && remoteMessage.data.data) {
                        try {
                            const notiData = JSON.parse(remoteMessage.data.data)
                            if(navigationRef.current.getCurrentRoute().name === 'SplashScreen') {
                                setTimeout(() => {
                                    if(notiData.type === 'message') {
                                        if(notiData.match && notiData.match.conversation_id) {
                                            NavigationService.resetRaw([
                                                {name: 'Dashboard'},
                                                {name: 'MessageScreen', params: {conversation: notiData.match}}
                                            ])
                                        } else {
                                            NavigationService.resetRaw([
                                                {name: 'Dashboard'},
                                                {name: 'NotificationScreen'}
                                            ])
                                        }
                                    } else {
                                        NavigationService.resetRaw([
                                            {name: 'Dashboard'},
                                            {name: 'NotificationScreen'}
                                        ])
                                    }
                                }, 1200);
                            } else {
                                if(notiData.type === 'message') {
                                    if(notiData.match && notiData.match.conversation_id) {
                                        NavigationService.resetRaw([
                                            {name: 'Dashboard'},
                                            {name: 'MessageScreen', params: {conversation: notiData.match}}
                                        ])
                                    } else {
                                        NavigationService.resetRaw([
                                            {name: 'Dashboard'},
                                            {name: 'NotificationScreen'}
                                        ])
                                    }
                                } else {
                                    NavigationService.resetRaw([
                                        {name: 'Dashboard'},
                                        {name: 'NotificationScreen'}
                                    ])
                                }
                            }
                            
                        } catch (error) {
                            console.log({error})
                        }
                    }
                }
            });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const getDeviceId = async () => {
            const deviceId = await DeviceInfo.getUniqueId()
            setDeviceId(deviceId)
            AsyncStorage.setItem('DEVICE_ID', deviceId)
            .then(() => {})
            .catch(() => {})
        }

        getDeviceId()

        requestUserPermission()

    }, [])

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="SplashScreen">
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="GetStartScreen" component={GetStartScreen} />
            <Stack.Screen name="SignUpEmailScreen" component={SignUpEmailScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="SignInScreen" component={SignInScreen} />
            <Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} />
            <Stack.Screen name="MessageScreen" component={MessageScreen} />
            <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} />
            <Stack.Screen name="Dashboard" component={TabNavigator} />
            <Stack.Screen name="ConnectProfileScreen" component={ConnectProfileScreen} />
            <Stack.Screen name="UpdateProfileScreen" component={UpdateProfileScreen} />
            <Stack.Screen name="UpdatePasswordScreen" component={UpdatePasswordScreen} />
            <Stack.Screen name="AvatarUpdateScreen" component={AvatarUpdateScreen} />
            <Stack.Screen name="VerificationSuccessScreen" component={VerificationSuccessScreen} />
            <Stack.Screen name="PremiumRequestScreen" component={PremiumRequestScreen} />
            <Stack.Screen name="InterestSelectScreen" component={InterestSelectScreen} />
            <Stack.Screen name="DislikeSelectScreen" component={DislikeSelectScreen} />
            <Stack.Screen name="GetMatchScreen" component={GetMatchScreen} />
            <Stack.Screen name="BirthdayUpdateScreen" component={BirthdayUpdateScreen} />
            <Stack.Screen name="GenderUpdateScreen" component={GenderUpdateScreen} />
            <Stack.Screen name="LocationUpdateScreen" component={LocationUpdateScreen} />
            <Stack.Screen name="OnboardingCompleteScreen" component={OnboardingCompleteScreen} />
            <Stack.Screen name="ProfileTagScreen" component={ProfileTagScreen} />
            <Stack.Screen name="PronounsUpdateScreen" component={PronounsUpdateScreen} />
            <Stack.Screen name="ReviewProfileScreen" component={ReviewProfileScreen} />
            <Stack.Screen name="SettingScreen" component={SettingScreen} />
            <Stack.Screen name="PurposeUpdateScreen" component={PurposeUpdateScreen} />
            <Stack.Screen name="NameUpdateScreen" component={NameUpdateScreen} />
            <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
            <Stack.Screen name="DislikeUpdateScreen" component={DislikeUpdateScreen} />
            <Stack.Screen name="InterestUpdateScreen" component={InterestUpdateScreen} />
            <Stack.Screen name="PurposeProfileScreen" component={PurposeProfileScreen} />
        </Stack.Navigator>
    );
};


export default AppStack;
