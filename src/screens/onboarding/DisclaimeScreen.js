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
import colors from "../../utils/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import analytics from '@react-native-firebase/analytics'

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

const DisclaimeScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [disclaime, setDiscalime] = useState('')
    const [accepted, setAccepted] = useState(false)

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'DisclaimeScreen',
            screen_class: 'DisclaimeScreen'
        })
    }, [])

    useEffect(() => {
        const getDisclaime = async () => {
            setLoading(true)
            try {
                const res = await apiClient.get('users/disclaime')
                if (res && res.data && res.data.data) {
                    setDiscalime(res.data.data)
                }
                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
        }

        getDisclaime()
    }, [])

    const onContinue = () => {
        NavigationService.reset('VerificationSuccessScreen')
    }

    return (
        <View
            style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}
        >
            <StatusBar translucent style="dark" />
            <View style={{ gap: 16, width: Platform.isPad ? 600 : "100%", alignSelf: "center", justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={images.logo_with_text}
                    style={{ width: 120, height: 40, marginBottom: 32 }}
                    contentFit="contain"
                />
                <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "black" }}
                >{`Important Disclaime`}</Text>
            </View>
            <View style={{ alignSelf: "center", width: Platform.isPad ? 600 : "100%", flex: 1, borderRadius: 25, paddingHorizontal: 28, paddingVertical: 20, backgroundColor: '#CDB8E2' }}>
                <Text style={{ fontSize: 14, lineHeight: 25, fontWeight: '500', color: 'black' }}>{disclaime}</Text>
            </View>

            <View style={{ alignSelf: "center", width: Platform.isPad ? 600 : "100%", flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingHorizontal: 8}}>
                <TouchableOpacity onPress={() => setAccepted(old => !old)} style={{ width: 20, height: 20, marginTop: 3}}>
                    <FontAwesome5 name={accepted ? 'check-square' : 'square'} solid={accepted} size={20} color={colors.mainColor}/>
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold', color: 'black', lineHeight: 25 }}>I agree to the terms and understand that Kuky is not a substitute for professional medical or mental health care.</Text>
            </View>

            <ButtonWithLoading
                text="Agree & Continue"
                onPress={onContinue}
                disabled={!accepted}
                loading={loading}
            />
        </View>
    );
};

export default DisclaimeScreen;
