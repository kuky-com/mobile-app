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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'
import * as Location from 'expo-location';
import { FontAwesome6 } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
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

const JourneySelectionScreen = ({ navigation, route }) => {
    const { isUpdate } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState([]);
    const [currentUser, setUser] = useAtom(userAtom);
    const [selectedCategory, setSelectedCategory] = useState(currentUser?.journey_category ?? null);

    console.log({ current: currentUser?.journey_category })

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const getCategoryList = async () => {
        try {
            setFetching(true)
            const res = await apiClient.get('journeys/categories')

            if (res && res.data && res.data.success) {
                setCategories(res.data.data)
            }
            setFetching(false)
        } catch (error) {
            console.log({ error })
            setFetching(false)
        }
    }

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'JourneySelectionScreen',
            screen_class: 'JourneySelectionScreen',
        });

        getCategoryList()
    }, [])

    const onContinue = () => {
        try {

            setLoading(true)

            if (isUpdate) {
                setLoading(false)
                navigation.push('StruggleSelectionScreen', { journeyCategory: selectedCategory })
            } else {
                apiClient.post('users/update', { journey_category_id: selectedCategory?.id })
                    .then((res) => {
                        setLoading(false)
                        if (res && res.data && res.data.success) {
                            setUser(res.data.data)

                            NavigationService.reset('StruggleSelectionScreen')
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
                <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                <Text style={{ fontSize: 20, lineHeight: 40, maxWidth: '80%', fontWeight: '600', color: 'black' }}>{`What’s one area of life you’d like to improve?`}</Text>
                <ScrollView refreshControl={<RefreshControl refreshing={fetching} onRefresh={getCategoryList} />} style={{ flex: 1, width: '100%' }}>
                    <View style={{ width: '100%', alignItems: 'center', gap: 8, flex: 1 }}>
                        {categories.map((item) => {
                            if (currentUser?.journey_category && currentUser?.journey && currentUser?.journey_category?.id === item?.id) {
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedCategory(item)}
                                        style={[styles.itemContainer, { flexDirection: 'column', height: 90, paddingHorizontal: 0, gap: 0 }]}
                                        key={item.name}
                                    >
                                        <View style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15, flex: 1, paddingHorizontal: 16, width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#CDB8E2' }}>
                                            <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                                                {item.name}
                                            </Text>
                                            <Image
                                                source={selectedCategory?.id === item?.id ? images.checked_icon : images.uncheck_icon}
                                                style={{ width: 24, height: 24 }}
                                                contentFit="contain"
                                            />
                                        </View>
                                        <View style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flex: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', backgroundColor: '#CDB8E250' }}>
                                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mainColor }} />
                                            <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, fontWeight: 'bold', color: '#333333' }}>{currentUser?.journey?.name}</Text>
                                            <FontAwesome6 name='chevron-right' size={15} color='#333333' />
                                        </View>
                                    </TouchableOpacity>
                                )
                            } else {
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedCategory(item)}
                                        style={styles.itemContainer}
                                        key={item.name}
                                    >
                                        <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                                            {item.name}
                                        </Text>
                                        <Image
                                            source={selectedCategory?.id === item?.id ? images.checked_icon : images.uncheck_icon}
                                            style={{ width: 24, height: 24 }}
                                            contentFit="contain"
                                        />
                                    </TouchableOpacity>
                                )
                            }
                        })}
                    </View>
                </ScrollView>
                <ButtonWithLoading
                    text={isUpdate ? 'Save and continue' : 'Next'}
                    onPress={onContinue}
                    disabled={!selectedCategory}
                    loading={loading}
                />
                {
                    isUpdate &&
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ padding: 8, fontSize: 14, fontWeight: 'bold', color: '#333333' }} onPress={onSkip}>Discard the changes</Text>
                    </View>
                }
            </View>
        </View>
    );
};

export default JourneySelectionScreen;
