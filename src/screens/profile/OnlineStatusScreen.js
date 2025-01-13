import Text from "@/components/Text";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImagePicker from "react-native-image-crop-picker";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import axios from "axios";
import { capitalize, getAuthenScreen } from "@/utils/utils";
import DoubleSwitch from "@/components/DoubleSwitch";
import SwitchWithText from "@/components/SwitchWithText";
import apiClient from "@/utils/apiClient";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import analytics from '@react-native-firebase/analytics'
import { useAtom, useAtomValue } from "jotai";
import { userAtom } from "../../actions/global";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 16,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 24,
    },
    itemContainer: {
        backgroundColor: "#ECECEC",
        alignItems: "center",
        justifyContent: "center",
        height: 55,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: "#000000",
        flexDirection: "row",
        paddingHorizontal: 22,
        gap: 8
    },
    closeButton: {
        width: 30,
        height: 30,
        backgroundColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        position: "absolute",
        top: 8,
        right: 8,
    },
});

const allStatus = [
    { name: 'Active', color: '#2EE62A', backgroundColor: '#2EE62A30' },
    { name: 'Away', color: '#FFD322', backgroundColor: '#FFD32230' },
    { name: 'Offline', color: '#A7A7A7', backgroundColor: '#A7A7A730' },
]

const OnlineStatusScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentUser, setUser] = useAtom(userAtom)
    const [status, setStatus] = useState(currentUser?.online_status);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: "GenderUpdateScreen",
            screen_class: "GenderUpdateScreen",
        });
    }, [])

    const onContinue = () => {
        try {
            setLoading(true);
            apiClient
                .post("users/update", { online_status: status })
                .then((res) => {
                    setLoading(false);
                    if (res && res.data && res.data.success) {
                        NavigationService.goBack()
                        setUser(res.data.data);
                    } else {
                        Toast.show({ text1: res.data.message, type: "error" });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log({ error });
                    Toast.show({ text1: error, type: "error" });
                });
        } catch (error) {
            setLoading(false);
        }
    };

    return (
        <View
            style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}
        >
            <StatusBar translucent style="dark" />
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : "100%", alignSelf: "center" }}>
                <Image
                    source={images.logo_with_text}
                    style={{ width: 120, height: 40, marginBottom: 32 }}
                    contentFit="contain"
                />
                <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "black" }}
                >{`Set your status`}</Text>
                <View
                    style={{
                        flex: 1,
                        width: "100%",
                        paddingVertical: 32,
                        gap: 16,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                    }}
                >
                    {allStatus.map((item) => (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => setStatus(item.name.toLowerCase())}
                            style={styles.itemContainer}
                        >
                            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: item.backgroundColor, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                            </View>
                            <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                                {item.name}
                            </Text>
                            <Image
                                source={status.toLowerCase() === item.name.toLowerCase() ? images.checked_icon : images.uncheck_icon}
                                style={{ width: 24, height: 24 }}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ButtonWithLoading
                text="Save changes"
                onPress={onContinue}
                loading={loading}
            />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Text onPress={() => navigation.goBack()} style={{ fontSize: 14, fontWeight: '100%', color: '#333333' }}>Discard changes</Text>
            </View>
        </View>
    );
};

export default OnlineStatusScreen;
