import { userAtom } from "@/actions/global";
import { useAlert } from "@/components/AlertProvider";
import AvatarImage from "@/components/AvatarImage";
import ButtonWithLoading from "@/components/ButtonWithLoading";
import CustomVideo from "@/components/CustomVideo";
import { Header } from "@/components/Header";
import Text from "@/components/Text";
import apiClient from "@/utils/apiClient";
import constants from "@/utils/constants";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import dayjs from "dayjs";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { SectionCard } from "@/components/SectionCard";
import {
    DeviceEventEmitter,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { AEMReporterIOS, AppEventsLogger } from "react-native-fbsdk-next";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Properties } from "react-native-smartlook-analytics";
import Smartlook from "react-native-smartlook-analytics";
import Toast from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import colors from "../../utils/colors";
import { Rating } from "@/components/Rating";
import { getAuthenScreen } from "../../utils/utils";
import { FontAwesome6 } from "@expo/vector-icons";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tagContainer: {
        backgroundColor: "#7B65E8",
        height: 30,
        borderRadius: 15,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tagText: {
        color: "#E8FF58",
        fontSize: 15,
        fontWeight: "bold",
    },
    nameBackground: {
        position: "absolute",
        height: "50%",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
    },
});

const OnboardingSampleProfile = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [sampleProfiles, setSampleProfiles] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [pendingVideo, setPendingVideo] = useState(true)
    const [isMute, setIsMute] = useState(true)

    const currentUser = useAtomValue(userAtom)

    const videoRef = useRef(null);

    const currentProfile = (sampleProfiles && sampleProfiles.length > 0 && currentProfileIndex < sampleProfiles.length) ? sampleProfiles[currentProfileIndex] : null

    const onRefresh = () => {
        if (sampleProfiles.length > 0) return

        try {
            setLoading(true);
            apiClient.get(`matches/sample-profiles`)
                .then((res) => {
                    setLoading(false);
                    console.log({ sampleProfiles: res })
                    if (res && res.data && res.data.success) {
                        const profiles = res.data.data
                        setSampleProfiles(profiles)
                        if (profiles.length > 0) {
                            setCurrentProfileIndex(0)
                        }
                    }
                })
                .catch((error) => {
                    console.log({ error });
                    setLoading(false);
                });
        } catch (error) {
            console.log({ error })
            setLoading(false);
        }
    };

    useEffect(() => {
        onRefresh();
    }, []);

    const likeAction = () => {
        handleNextProfile()
        try {
            setLoading(true);
            Toast.show({
                type: "sent",
                position: "top",
                text1: "Connection Sent!",
                text2: `Your invitation to connect has been sent to ${currentProfile?.full_name}.`,
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 0
            });
            apiClient
                .post("matches/accept", { friend_id: currentProfile?.id })
                .then((res) => {
                    console.log({ res });
                    setLoading(false);
                })
                .catch((error) => {
                    console.log({ error });
                    setLoading(false);
                });
        } catch (error) {
            setLoading(false);
        }
    };

    const rejectAction = () => {
        handleNextProfile()
        try {
            setLoading(true);
            Toast.show({
                type: "deny",
                position: "top",
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 0
            });
            apiClient
                .post("matches/reject", { friend_id: currentProfile?.id })
                .then((res) => {
                    console.log({ res });
                    setLoading(false);
                })
                .catch((error) => {
                    console.log({ error });
                    setLoading(false);
                });

        } catch (error) {
            setLoading(false);
        }
    };

    const handleNextProfile = () => {
        pauseVideo()

        if (sampleProfiles.length > 0 && currentProfileIndex === (sampleProfiles.length - 1)) {
            setTimeout(() => {
                NavigationService.reset('OnboardingVideoTutorialScreen')
            }, 1000);
        } else {
            setTimeout(() => {
                setCurrentProfileIndex(old => (old + 1))
            }, 500);
        }
    }

    let userDislikes = [];
    let userInterests = [];

    try {
        userInterests = (currentProfile?.interests ?? []).filter(
            (item) => item.user_interests.interest_type === "like",
        );
        userDislikes = (currentProfile?.interests ?? []).filter(
            (item) => item.user_interests.interest_type === "dislike",
        );
    } catch (error) { }

    const playVideo = async () => {
        if (videoRef && videoRef.current) {
            setPendingVideo(true)
            try {
                await videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 });
            } catch (error) {
                console.log({ error })
                setPendingVideo(false)
            }
        }
    };

    const pauseVideo = async () => {
        setPendingVideo(false)
        if (videoRef && videoRef.current) {
            try {
                await videoRef.current.setStatusAsync({ shouldPlay: false });
            } catch (error) {

            }
        }
    };

    const onSkip = () => {
        NavigationService.reset('OnboardingVideoTutorialScreen')
        // NavigationService.reset(getAuthenScreen(currentUser, true))
    }

    const onChangeMuteOption = () => {
        setIsMute(!isMute)
    }

    return (
        <View style={[styles.container]}>
            <Header
                showLogo
                rightText='Skip to Proceed'
                rightAction={onSkip}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
                style={{ flex: 1, width: "100%" }}
            >
                <View
                    style={{
                        flex: 1,
                        width: Platform.isPad ? 600 : "100%",
                        alignSelf: "center",
                        padding: 16,
                        gap: 16,
                        paddingBottom: insets.bottom + 16,
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            height: Math.min(
                                700,
                                Dimensions.get("screen").height - insets.top - insets.bottom - 220,
                                (Dimensions.get("screen").width - 32) * 1.4,
                            ),
                            borderWidth: 8,
                            borderColor: "white",
                            borderRadius: 15,
                        }}
                    >
                        {!playing && !pendingVideo && (
                            <AvatarImage
                                avatar={currentProfile?.avatar}
                                full_name={currentProfile?.full_name}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 10,
                                }}
                            />
                        )}
                        {currentProfile?.video_intro && (
                            <CustomVideo
                                style={{
                                    display: (pendingVideo || playing) ? 'flex' : 'none',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 10,
                                }}
                                ref={videoRef}
                                resizeMode={ResizeMode.COVER}
                                source={{ uri: currentProfile?.video_intro }}
                                onPlaybackStatusUpdate={(status) => {
                                    console.log({ status });
                                    setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                                    if (status.didJustFinish || status.isPlaying) {
                                        setPendingVideo(false)
                                    }
                                }}
                                onError={() => {
                                    setPendingVideo(false)
                                    setPlaying(false)
                                }}
                                isMuted={isMute}
                                shouldPlay={true}
                            />
                        )}
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.79)"]}
                            style={styles.nameBackground}
                        />
                        <View
                            style={{
                                flex: 1,
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >

                            <View style={{ width: "100%", alignItems: "space-between", padding: 16 }}>
                                {
                                    (playing || pendingVideo) &&
                                    <TouchableOpacity onPress={onChangeMuteOption} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mainColor }}>
                                        <FontAwesome6 name={isMute ? 'volume-xmark' : 'volume-high'} size={20} color='white' />
                                    </TouchableOpacity>
                                }
                                {!(playing || pendingVideo) && <View style={styles.tagContainer}>
                                    <Text
                                        style={[
                                            styles.tagText,
                                            {
                                                fontSize: (currentProfile?.tag?.name ?? "").length > 20 ? 13 : 15,
                                            },
                                        ]}
                                    >
                                        {currentProfile?.tag?.name}
                                    </Text>
                                </View>
                                }
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    justifyContent: "flex-end",
                                    paddingBottom: 25,
                                    paddingHorizontal: 16,
                                    gap: 16,
                                }}
                            >
                                {
                                    !playing &&
                                    <Text style={{ fontSize: 32, color: "white", fontWeight: "bold" }}>
                                        {currentProfile?.full_name}
                                    </Text>
                                }

                                <View
                                    style={{
                                        marginTop: 32,
                                        width: "100%",
                                        flexDirection: "row",
                                        alignItems: "flex-end",
                                        justifyContent: "space-between",
                                        paddingHorizontal: 9,
                                    }}
                                >
                                    {
                                        currentProfile &&
                                        <View style={{ alignItems: "center", gap: 13 }}>
                                            <TouchableOpacity
                                                disabled={loading}
                                                onPress={rejectAction}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 30,
                                                    backgroundColor: "#6C6C6C",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Image
                                                    source={images.close_icon}
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                        tintColor: "#E8FF58",
                                                    }}
                                                    contentFit="contain"
                                                />
                                            </TouchableOpacity>
                                            <Text
                                                style={{
                                                    color: "#949494",
                                                    fontSize: 10,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                Pass
                                            </Text>
                                        </View>
                                    }
                                    {currentProfile?.video_intro && (
                                        <View style={{ alignItems: "center", gap: 13 }}>
                                            {!playing && !pendingVideo && (
                                                <TouchableOpacity
                                                    onPress={playVideo}
                                                    style={{
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Image
                                                        source={images.play_icon}
                                                        style={{ width: 80, height: 80 }}
                                                        contentFit="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            {(playing || pendingVideo) && (
                                                <TouchableOpacity
                                                    onPress={pauseVideo}
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 40,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Image
                                                        source={images.pause_icon}
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: 40,
                                                        }}
                                                        contentFit="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            <Text
                                                style={{
                                                    color: "#949494",
                                                    fontSize: 10,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {(playing || pendingVideo) ? 'Pause video' : 'Watch video'}
                                            </Text>
                                        </View>
                                    )}
                                    {
                                        currentProfile &&
                                        <View style={{ alignItems: "center", gap: 13 }}>
                                            <TouchableOpacity
                                                disabled={loading}
                                                onPress={likeAction}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 30,
                                                    backgroundColor: "#6C6C6C",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Image
                                                    source={images.like_icon}
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                        tintColor: "#E8FF58",
                                                    }}
                                                    contentFit="contain"
                                                />
                                            </TouchableOpacity>
                                            <Text
                                                style={{
                                                    color: "#949494",
                                                    fontSize: 10,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                Connect
                                            </Text>
                                        </View>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            paddingHorizontal: 8,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 5,
                                alignItems: "center",
                                justifyContent: "flex-start",
                            }}
                        >
                            <View
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: "#726F70",
                                    backgroundColor: "white",
                                }}
                            >
                                <Image
                                    source={images.birthday_icon}
                                    style={{ width: 18, height: 18 }}
                                    contentFit="contain"
                                />
                            </View>
                            {currentProfile?.birthday && currentProfile?.birthday.includes("/") && (
                                <Text
                                    style={{ fontSize: 14, color: "black" }}
                                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "DD/MM/YYYY"), "years")} yrs`}</Text>
                            )}
                            {currentProfile?.birthday && currentProfile?.birthday.includes("-") && (
                                <Text
                                    style={{ fontSize: 14, color: "black" }}
                                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "MM-DD-YYYY"), "years")} yrs`}</Text>
                            )}
                        </View>

                        {currentProfile?.publicPronouns && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <View
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 5,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderWidth: 1,
                                        borderColor: "#726F70",
                                        backgroundColor: "white",
                                    }}
                                >
                                    <Image
                                        source={images.gender_icon}
                                        style={{ width: 18, height: 18 }}
                                        contentFit="contain"
                                    />
                                </View>
                                <Text
                                    style={{ fontSize: 14, fontWeight: "600", color: "black" }}
                                >{`${(currentProfile?.pronouns ?? "").split("/ ")[0]}`}</Text>
                            </View>
                        )}

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 5,
                                alignItems: "center",
                                justifyContent: "flex-end",
                            }}
                        >
                            <View
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: "#726F70",
                                    backgroundColor: "white",
                                }}
                            >
                                <Image
                                    source={images.location_icon}
                                    style={{ width: 18, height: 18 }}
                                    contentFit="contain"
                                />
                            </View>
                            <Text
                                style={{ fontSize: 14, fontWeight: "600", color: "black" }}
                            >{`${currentProfile?.location ?? ""}`}</Text>
                        </View>
                    </View>

                    {(currentProfile?.purposes ?? []).length > 0 && (
                        <View style={{ width: "100%" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    source={images.interest_icon}
                                    style={{ width: 16, height: 16, tintColor: "black" }}
                                    contentFit="contain"
                                />
                                <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
                                    Journeys & Purposes
                                </Text>
                            </View>
                            {/* <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} /> */}
                            <SectionCard
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: "#E9E5FF",
                                    borderColor: "#F5F5F5",
                                    paddingVertical: 24,
                                    flexWrap: "wrap",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                    paddingHorizontal: 16,
                                }}
                            >
                                {(currentProfile?.purposes ?? []).map((item) => {
                                    return (
                                        <TouchableOpacity
                                            key={item.name}
                                            style={{
                                                flexDirection: "row",
                                                gap: 5,
                                                paddingHorizontal: 16,
                                                height: 32,
                                                borderRadius: 16,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#725ED4",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: "#E8FF58",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </SectionCard>
                        </View>
                    )}
                    {userInterests.length > 0 && (
                        <View style={{ width: "100%" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    source={images.interest_icon}
                                    style={{ width: 16, height: 16, tintColor: "black" }}
                                    contentFit="contain"
                                />
                                <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
                                    Interest and hobbies
                                </Text>
                            </View>
                            {/* <View style={{ width: '100%', backgroundColor: '#9889E1', height: 1 }} /> */}
                            <SectionCard>
                                {userInterests.map((item) => {
                                    return (
                                        <View
                                            key={item.name}
                                            style={{
                                                flexDirection: "row",
                                                gap: 5,
                                                paddingHorizontal: 16,
                                                height: 32,
                                                borderRadius: 16,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#725ED4",
                                            }}
                                        >
                                            {/* <Image style={{ width: 22, height: 22 }} contentFit='contain' source={images.seen_icon} /> */}
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: "#E8FF58",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </SectionCard>
                        </View>
                    )}

                    {userDislikes.length > 0 && (
                        <View style={{ width: "100%", borderRadius: 10 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    source={images.dislike_icon}
                                    style={{ width: 16, height: 16, tintColor: "black" }}
                                    contentFit="contain"
                                />
                                <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>Dislike</Text>
                            </View>
                            <View
                                style={{
                                    backgroundColor: "#E9E5FF",
                                    borderColor: "#F5F5F5",
                                    borderRadius: 20,
                                    paddingHorizontal: 16,
                                    paddingVertical: 24,
                                    flexWrap: "wrap",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                {userDislikes.map((item) => {
                                    return (
                                        <View
                                            key={item.name}
                                            style={{
                                                flexDirection: "row",
                                                gap: 5,
                                                paddingHorizontal: 16,
                                                height: 32,
                                                borderRadius: 16,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#FF8B8B",
                                            }}
                                        >
                                            {/* <Image style={{ width: 22, height: 22 }} contentFit='contain' source={images.seen_icon} /> */}
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: "black",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <View
                        style={{
                            width: "100%",
                            marginVertical: 16,
                            height: 2,
                            backgroundColor: "#D2D2D2",
                            borderRadius: 1,
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default OnboardingSampleProfile;
