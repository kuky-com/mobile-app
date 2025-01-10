import { userAtom } from "@/actions/global";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import apiClient from "@/utils/apiClient";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Keyboard, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F1F3",
    },
    inputContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: "#000000",
        backgroundColor: "white",
        borderRadius: 20,
        alignItems: "center",
    },
});

const socials = [
    { name: 'Instagram', image: images.instagram_icon, link: 'https://www.instagram.com/kuky_app/' },
    { name: 'X', image: images.twitter_icon, link: 'https://x.com/kuky_app' },
    { name: 'Facebook', image: images.facebook_icon, link: 'https://facebook.com/kukyapp' },
    { name: 'Whatsapp', image: images.whatsapp_icon, link: 'https://wa.me/610491711556' },
    { name: 'Youtube', image: images.youtube_icon, link: 'https://www.youtube.com/@kuky_app' },
    { name: 'Tiktok', image: images.tiktok_icon, link: 'https://www.tiktok.com/@kuky_app' },
    { name: 'Cal.com', image: images.cal_icon, link: 'https://cal.com/kuky.com/15min' },
    { name: 'LinkedIn', image: images.linkedin_icon, link: 'https://linkedin.com/company/kuky-com' },
]

const ConnectUsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentUser, setUser] = useAtom(userAtom);
    const [fullName, setFullName] = useState(currentUser?.full_name);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'ConnectUsScreen',
            screen_class: 'ConnectUsScreen',
        })
    }, [])

    const moreAction = async () => {
        const options = currentUser?.login_type === "email" ? [{ text: "Update Password" }] : [];

        await SheetManager.show("action-sheets", {
            payload: {
                actions: options,
                onPress(index) {
                    if (index === 0) {
                        navigation.push("UpdatePasswordScreen");
                    }
                },
            },
        });
    };

    const updateProfile = async () => {
        try {
            Keyboard.dismiss();
            setLoading(true);

            apiClient
                .post("users/update", { full_name: fullName })
                .then((res) => {
                    console.log({ res });
                    setLoading(false);
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data);
                        Toast.show({ text1: res.data.message, type: "success" });
                    } else {
                        Toast.show({ text1: res.data.message, type: "error" });
                    }
                })
                .catch((error) => {
                    console.log({ error });
                    setLoading(false);
                    Toast.show({ text1: error, type: "error" });
                });
        } catch (error) {
            setLoading(false);
        }
    };

    const openLink = (link) => {
        try {
            Linking.openURL(link)
        } catch (error) {
            
        }
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    zIndex: 2,
                    gap: 8,
                    borderBottomLeftRadius: 45,
                    borderBottomRightRadius: 45,
                    backgroundColor: "#725ED4",
                    paddingHorizontal: 16,
                    paddingBottom: 24,
                    paddingTop: insets.top,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                    >
                        <Image
                            source={images.back_icon}
                            style={{ width: 25, height: 25 }}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 20, color: "white", fontWeight: "bold" }}>
                    Connect with Us
                </Text>
            </View>
            <View style={{ flex: 1, padding: 32, backgroundColor: "white" }}>
                <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
                    {
                        socials.map((item) => {
                            return (
                                <View key={item.name} style={{ alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={() => openLink(item.link)} style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={item.image} style={{ width: 30, height: 30 }} contentFit="contain" />
                                    </TouchableOpacity>

                                    <Text style={{fontSize: 10, color: '#333333'}}>{item.name}</Text>
                                </View>
                            )
                        })
                    }
                </View>
            </View>
        </View>
    );
};

export default ConnectUsScreen;
