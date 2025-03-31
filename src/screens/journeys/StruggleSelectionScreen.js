import { userAtom } from "@/actions/global";
import { useAlert } from "@/components/AlertProvider";
import AvatarImage from "@/components/AvatarImage";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import apiClient from "@/utils/apiClient";
import colors from "@/utils/colors";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import axios from "axios";
import { Image, ImageBackground } from "expo-image";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'
import { StatusBar } from "expo-status-bar";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        paddingHorizontal: 16
    },
    itemContainer: {
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        height: 55,
        borderRadius: 15,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        elevation: 1,
        shadowColor: "#000000",
        flexDirection: "row",
        paddingHorizontal: 22,
        marginHorizontal: 2,
        gap: 5
    },
    closeButton: {
        marginTop: 50,
        marginLeft: 20,
        backgroundColor: '#ff0000',
        padding: 10,
        borderRadius: 5,
    },
});

const StruggleSelectionScreen = ({ navigation, route }) => {
    const { journeyCategory } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets();
    const [journeys, setJourneys] = useState([]);
    const [currentUser, setUser] = useAtom(userAtom);
    const [selectedJourney, setSelectedJourney] = useState(currentUser?.journey ?? null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const getCategoryList = async () => {
        try {
            setFetching(true)
            const res = await apiClient.get(`journeys/journeys?category=${journeyCategory ? journeyCategory.id : currentUser.journey_category_id}`)

            if (res && res.data && res.data.success) {
                setJourneys(res.data.data)
            }
            setFetching(false)
        } catch (error) {
            console.log({ error })
            setFetching(false)
        }
    }

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'StuggleSelectionScreen',
            screen_class: 'StuggleSelectionScreen',
        });

        getCategoryList()
    }, [])

    const onContinue = () => {
        try {

            setLoading(true)

            if (journeyCategory) {
                apiClient.post('users/update', { journey_category_id: journeyCategory.id, journey_id: selectedJourney?.id })
                    .then((res) => {
                        setLoading(false)
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)

                            NavigationService.reset('JourneyMatchingScreen')
                        } else {
                            Toast.show({ text1: res.data.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                        setLoading(false)
                    })
            } else {
                apiClient.post('users/update', { journey_id: selectedJourney?.id })
                    .then((res) => {
                        setLoading(false)
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)

                            NavigationService.reset('CommunitySuggestionScreen')
                        } else {
                            Toast.show({ text1: res.data.message, type: 'error' })
                        }
                    })
                    .catch((error) => {
                        console.log({ error })
                        Toast.show({ text1: error, type: 'error' })
                        setLoading(false)
                    })
            }


        } catch (error) {
        }
    }

    const onSkip = () => {
        navigation.goBack()
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <TouchableOpacity style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => {
                        if (journeyCategory) {
                            navigation.goBack()
                        } else {
                            NavigationService.reset('JourneySelectionScreen')
                        }
                    }}>
                    <Image source={images.back_icon_no_border} style={{ width: 24, height: 24, tintColor: "black" }} contentFit='contain' />
                </TouchableOpacity>
                <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                <Text style={{ fontSize: 20, lineHeight: 40, maxWidth: '100%', fontWeight: '600', color: 'black' }}>{`${journeyCategory ? journeyCategory.question : currentUser?.journey_category?.question}`}</Text>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.mainColor }}>{`For ${journeyCategory ? journeyCategory.name : currentUser?.journey_category?.name}`}</Text>
                <ScrollView refreshControl={<RefreshControl refreshing={fetching} onRefresh={getCategoryList} />} style={{ flex: 1, width: '100%' }}>
                    <View style={{ width: '100%', alignItems: 'center', gap: 8, flex: 1 }}>
                        {journeys.map((item) => (
                            <TouchableOpacity
                                onPress={() => setSelectedJourney(item)}
                                style={styles.itemContainer}
                                key={item?.name}
                            >
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                                    {item?.name}
                                </Text>
                                <Image
                                    source={selectedJourney?.id === item?.id ? images.checked_icon : images.uncheck_icon}
                                    style={{ width: 24, height: 24 }}
                                    contentFit="contain"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <ButtonWithLoading
                    text={journeyCategory ? 'Save' : 'Explore My Community'}
                    onPress={onContinue}
                    disabled={!selectedJourney}
                    loading={loading}
                />
                {
                    journeyCategory &&
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ padding: 8, fontSize: 14, fontWeight: 'bold', color: '#333333' }} onPress={onSkip}>Discard the changes</Text>
                    </View>
                }
            </View>
        </View>
    );
};

export default StruggleSelectionScreen;
