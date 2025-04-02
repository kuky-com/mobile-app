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
import CustomSlider from "../../components/CustomSlider";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.mainColor
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

const GeneralJPFScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [questions, setQuestions] = useState([]);
    const [currentUser, setUser] = useAtom(userAtom);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const getCategoryList = async () => {
        try {
            setFetching(true)
            const res = await apiClient.get(`journeys/jpf-general-questions`)

            if (res && res.data && res.data.success) {
                setQuestions(res.data.data)

                res.data.data.forEach(question => {
                    if (question.question_type === 'one_to_ten') {
                        answers[question.id] = 5
                    }
                });
            }
            setFetching(false)
        } catch (error) {
            console.log({ error })
            setFetching(false)
        }
    }

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'GeneralJPFScreen',
            screen_class: 'GeneralJPFScreen',
        });

        getCategoryList()
    }, [])

    const onContinue = () => {
        try {

            setLoading(true)

            const keys = Object.keys(answers)
            const data = keys.map((item) => {
                const filterQ = questions.filter((q) => q.id.toString() === item.toString())
                if (filterQ && filterQ.length > 0) {
                    const question = filterQ[0]
                    if (question.question_type === 'one_to_ten') {
                        return ({ question_id: item, answer_text: answers[item].toString() })
                    } else {
                        return ({ question_id: item, answer_id: answers[item] })
                    }
                }
            })

            apiClient.post('journeys/submit-answer', { answers: data })
                .then((res) => {
                    setLoading(false)
                    if (res && res.data && res.data.success) {
                        setUser(res.data.data)

                        if (currentUser?.askJPFSpecific) {
                            return 'SpecificJPFScreen'
                        } {
                            return 'JourneyVideoTutorialScreen'
                        }

                    } else {
                        Toast.show({ text1: res.data.message, type: 'error' })
                    }
                })
                .catch((error) => {
                    console.log({ error })
                    Toast.show({ text1: error, type: 'error' })
                    setLoading(false)
                })
        } catch (error) {
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 }]}>
            <StatusBar translucent style='dark' />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{`Understand Your Journey`}</Text>
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={fetching} onRefresh={getCategoryList} />} style={{ flex: 1, width: '100%' }}>
                    <View style={{ width: '100%', alignItems: 'center', gap: 32, flex: 1 }}>
                        {
                            questions.map((question, index) => (
                                <View key={question.id.toString()} style={{ gap: 12, width: '100%' }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white', marginBottom: 12 }}>{`${index + 1}. ${question.question}`}</Text>
                                    {question.question_type === 'one_to_ten' &&
                                        <CustomSlider
                                            key={question.id.toString()}
                                            value={answers[question.id]}
                                            setValue={(value) => setAnswers({ ...answers, [question.id]: value })} />
                                    }
                                    {question.question_type !== 'one_to_ten &&' && (question.answers || []).map((answer) => {
                                        return (
                                            <TouchableOpacity
                                                style={styles.itemContainer}
                                                key={answer.id.toString()}
                                                onPress={() => setAnswers({ ...answers, [question.id]: answer.id })}
                                            >
                                                <Text style={{ flex: 1, fontSize: 16, fontWeight: "bold", color: "#333333" }}>
                                                    {answer.content}
                                                </Text>
                                                <Image
                                                    source={answers[question.id] === answer.id ? images.checked_icon : images.uncheck_icon}
                                                    style={{ width: 24, height: 24 }}
                                                    contentFit="contain"
                                                />
                                            </TouchableOpacity>
                                        )
                                    }
                                    )}
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <ButtonWithLoading
                    text='Next'
                    onPress={onContinue}
                    disabled={Object.keys(answers).length !== questions.length && questions.length > 0}
                    loading={loading}
                />
            </View>
        </View>
    );
};

export default GeneralJPFScreen;
