import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Tabbar from '@/components/Tabbar';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import LikeScreen from './interest/LikeScreen';
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
import { deviceIdAtom, userAtom } from '@/actions/global';
import DeviceInfo from 'react-native-device-info'
import NavigationService, { navigationRef } from '@/utils/NavigationService';
import { useRoute } from '@react-navigation/native'
import PurposeUpdateScreen from './onboarding/PurposeUpdateScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: '#00000000' }}
            screenOptions={{ tabBarShowLabel: false, headerShown: false }}
            tabBar={props => <Tabbar {...props} />} initialRouteName="LikeScreen">
            <Tab.Screen name="LikeScreen" component={LikeScreen} />
            <Tab.Screen name="MatchesScreen" component={MatchesScreen} />
            <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppStack = ({navgation}) => {
    const setDeviceId = useSetAtom(deviceIdAtom)

    useEffect(() => {
        const getDeviceId = async () => {
            const deviceId = await DeviceInfo.getUniqueId()
            setDeviceId(deviceId)
        }

        getDeviceId()

    }, [])

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, gestureEnabled: false }}
            initialRouteName="PurposeUpdateScreen">
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
        </Stack.Navigator>
    );
};


export default AppStack;
