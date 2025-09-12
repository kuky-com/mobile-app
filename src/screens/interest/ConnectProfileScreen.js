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
import React, { useEffect, useRef, useState, useCallback } from "react";
import { SectionCard } from "@/components/SectionCard";
import {
  AppState,
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
import ShareModal from "../../components/ShareModal";
import { FontAwesome6 } from "@expo/vector-icons";
import { isStringInteger } from "../../utils/utils";
import analytics from '@react-native-firebase/analytics'
import OnlineStatus from "../../components/OnlineStatus";
import SwipeCard from "../../components/SwipeCard";
import VideoManager from "../../components/VideoManager";
import SimilarByPathItem from "../../components/SimilarByPathItem";
import DeviceInfo from 'react-native-device-info';
import { deviceIdAtom } from "../../actions/global";

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
  onlineStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#47F644',
  },
  onlineStatusBg: {
  },
  shadow: {
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    elevation: 1,
    shadowColor: '#000000',
  }
});

const ConnectProfileScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { profile, showAcceptReject = true, journey_id } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [matchInfo, setMatchInfo] = useState(null);
  const currentUser = useAtomValue(userAtom);
  const showAlert = useAlert();
  // const [commonPurposes, setCommonPurposes] = useState(null);
  // const [commonInterests, setCommonInterests] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [showShare, setShowShare] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(false);
  const [nextProfile, setNextProfile] = useState(null)

  const [similarUsers, setSimilarUser] = useState([])

  const [isMute, setIsMute] = useState(false)

  const videoRef = useRef(null);
  const currentSessionRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const deviceId = useAtomValue(deviceIdAtom)

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'ConnectProfileScreen',
      screen_class: 'ConnectProfileScreen'
    })
  }, [])

  useEffect(() => {
    if(profile && profile.id === 1) {
      NavigationService.replace('SupportProfileScreen')
    }
  }, [profile])

  const onRefresh = () => {
    try {
      setLoading(true);
      apiClient
        .post("users/friend-info", { friend_id: profile.id })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.success) {
            if (res.data.data.blocked) {
              setCurrentProfile({ full_name: profile?.full_name });

              showAlert("Not found", "User profile is not available!", [
                {
                  text: "Ok",
                  onPress: () => {
                    NavigationService.goBack();
                  },
                },
              ]);
            } else {
              console.log({ friendProfile: res.data.data.user });
              setCurrentProfile(res.data.data.user);
              setMatchInfo(res.data.data.match);
            }
          }
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });

      apiClient.get(`matches/similar-by-path?profile_id=${profile.id}`)
        .then((res) => {
          if (res && res.data && res.data.success) {
            setSimilarUser(res.data.data ?? [])
          }
        })
        .catch((error) => {
          console.log({ error });
        });

      if (isStringInteger(currentProfile?.id) && currentProfile?.id !== currentUser.id) {
        // apiClient
        //   .get(`users/${profile.id}/journey`)
        //   .then((res) => {
        //     if (res && res.data && res.data.success) {
        //       setCommonPurposes(res.data.data);
        //     }
        //   })
        //   .catch((error) => {
        //     console.log({ error });
        //   });

        // apiClient
        //   .get(`users/${profile.id}/common-interests`)
        //   .then((res) => {
        //     if (res && res.data && res.data.success) {
        //       setCommonInterests(res.data.data);
        //     }
        //   })
        //   .catch((error) => {
        //     console.log({ error });
        //   });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      apiClient
        .get(journey_id ? `matches/next-match?journey_id=${journey_id}&current_profile_id=${currentProfile?.id}` :
          `matches/next-match?current_profile_id=${currentProfile?.id}`
        )
        .then((res) => {
          console.log({ nextProfile: res.data.data })
          setNextProfile(res.data.data)
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });
    }
  }, [currentProfile])

  // useEffect(() => {
  //   if (isStringInteger(currentProfile?.id) && currentProfile?.id !== currentUser.id) {
  //     // apiClient
  //     //   .get(`users/${profile.id}/journey`)
  //     //   .then((res) => {
  //     //     if (res && res.data && res.data.success) {
  //     //       setCommonPurposes(res.data.data);
  //     //     }
  //     //   })
  //     //   .catch((error) => {
  //     //     console.log({ error });
  //     //   });

  //     apiClient
  //       .get(`users/${profile.id}/common-interests`)
  //       .then((res) => {
  //         if (res && res.data && res.data.success) {
  //           setCommonInterests(res.data.data);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log({ error });
  //       });
  //   }
  // }, [currentProfile])

  useEffect(() => {
    onRefresh();

    try {
      AppEventsLogger.logEvent("open_profile", {
        user_id: currentUser?.id,
        profile_id: profile.id,
      });
      AEMReporterIOS.logAEMEvent("open_profile", 2, "", {
        user_id: currentUser?.id,
        profile_id: profile.id,
      });

      const properties = new Properties();
      properties.putString("user_id", currentUser?.id.toString());
      properties.putString("profile_id", profile.id.toString());
      Smartlook.instance.analytics.trackEvent("open_profile", properties);
    } catch (error) { }
  }, []);

  const likeAction = () => {
    analytics().logEvent('send_connect_request')

    // NavigationService.push('GetMatchScreen', { match: matchInfo })
    // return
    try {
      setLoading(true);
      apiClient
        .post("matches/accept", { friend_id: profile.id })
        .then((res) => {
          console.log({ resData: res.data });
          setLoading(false);
          DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);

          if (
            res &&
            res.data &&
            res.data.success &&
            res.data.data &&
            res.data.data.status === "accepted"
          ) {
            NavigationService.replace("GetMatchScreen", {
              match: res.data.data,
            });

            Toast.show({
              type: "sent",
              position: "top",
              text1: "Connection Sent!",
              text2: `Your invitation to connect has been sent to ${currentProfile?.full_name}.`,
              visibilityTime: 2000,
              autoHide: true,
              topOffset: 0,
            });
          } else if (res && res.data && !res.data.success) {
            showAlert(
              "Your account is almost ready!",
              "While we complete the approval, feel free to browse and get familiar with other profiles. You'll be connecting soon!",
              [
                {
                  text: "Keep Exploring",
                  onPress: () => { },
                },
              ],
            );
          } else {
            navigation.goBack();
            navigation.navigate("MatchesScreen");
          }
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
          // Toast.show({text1: 'Fail to send your interaction.', type: 'error'})
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const rejectAction = () => {
    analytics().logEvent('reject_suggestion')

    try {
      setLoading(true);
      apiClient
        .post("matches/reject", { friend_id: profile?.id })
        .then((res) => {
          console.log({ res });
          setLoading(false);
          DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });
      Toast.show({
        type: "deny",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 0,
      });

      if (nextProfile && nextProfile.user) {

        setCurrentProfile(nextProfile.user);
        setMatchInfo(nextProfile.match);
        setNextProfile(null)
      } else {
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }

    } catch (error) {
      setLoading(false);
    }
  };

  const onBlock = async () => {
    analytics().logEvent('block_button_clicked')

    await SheetManager.show("confirm-action-sheets", {
      payload: {
        onCancel: () => {
          setLoading(true);
          apiClient
            .post("users/block-user", { friend_id: profile.id })
            .then((res) => {
              setLoading(false);
              if (res && res.data && res.data.success) {
                DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
                Toast.show({ text1: res.data.message, type: "success" });
                setTimeout(() => {
                  navigation.goBack();
                }, 200);
              } else {
                Toast.show({
                  text1: res?.data?.message ?? "Block action failed!",
                  type: "error",
                });
              }
            })
            .catch((error) => {
              setLoading(false);
              Toast.show({ text1: error, type: "error" });
            });
        },
        onConfirm: () => { },
        cancelText: "Block",
        confirmText: "Cancel",
        header: "Do you want to block this user?",
        title: `Block user then both users will no longer be shown to each other.`,
      },
    });
  };

  const moreAction = async () => {
    try {
      const options = currentProfile?.id === currentUser.id ? [
        { text: "Share Profile", image: images.share_profile }
      ] : [
        { text: "Share Profile", image: images.share_profile },
        { text: "Block User", image: images.delete_icon },
        { text: "Report User", image: images.report_flag },
      ]

      await SheetManager.show("action-sheets", {
        payload: {
          actions: options,
          onPress(index) {
            setTimeout(() => {
              if (index === 0) {
                onGetSharedLink()
              } else if (index === 1) {
                onBlock();
              } else if (index === 2) {
                onReport();
              }
            }, 500);
          },
        },
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const createSession = async () => {
    const res = await apiClient.post(`users/sessions`, {
      device_id: deviceId,
      platform: Platform.OS,
      start_time: dayjs().format(),
      screen_name: 'profile'
    })

    if (res && res.data) {
      currentSessionRef.current = res.data.data.session_id
    } else {
      currentSessionRef.current = null
    }
  };

  const stopSessionUpdater = async () => {
    if (currentSessionRef.current) {
      await apiClient.put(`users/sessions/${currentSessionRef.current}`, {
        end_time: dayjs().format()
      })
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      appState.current = nextAppState;

      if (currentUser) {
        console.log({ nextAppState })
        if (nextAppState === 'active') {
          await createSession()
        } else if (nextAppState.match(/inactive|background/)) {
          await stopSessionUpdater()

          currentSessionRef.current = null
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      createSession()
    }

    return () => {
      stopSessionUpdater()
    }
  }, [currentUser])

  const onReport = async () => {
    analytics().logEvent('report_button_clicked')

    const options = [
      { text: "Inappropriate", color: "#333333" },
      { text: "Nudity or sexual activity", color: "#333333" },
      { text: "Violence or threat of violence", color: "#333333" },
      { text: "Hate speech or symbols", color: "#333333" },
      { text: "Bullying or harassment", color: "#333333" },
      { text: "Spam", color: "#333333" },
    ];

    await SheetManager.show("cmd-action-sheets", {
      payload: {
        actions: [...options, { text: "Cancel", style: "cancel-text" }],
        title: "Why do you want to report this match?",
        onPress(index) {
          if (index < options.length) {
            apiClient
              .post("users/report-user", {
                reported_id: currentProfile?.id,
                reason: options[index].text,
              })
              .then(async (res) => {
                if (res && res.data && res.data.success) {
                  await SheetManager.show("confirm-action-sheets", {
                    payload: {
                      header: "Thanks for reporting",
                      message:
                        "Your report is private.\nYour report is being investigated and we will take action ASAP",
                      cancelText: "Okay",
                    },
                  });
                } else {
                  Toast.show({
                    text1: res?.data?.message ?? "Report action failed!",
                    type: "error",
                  });
                }
              })
              .catch((error) => {
                Toast.show({ text1: error, type: "error" });
              });
          }
        },
      },
    });
  };

  const onGetSharedLink = async () => {
    analytics().logEvent('share_button_clicked')

    apiClient
      .get(`users/${profile.id}/share-link`)
      .then((res) => {
        console.log({ res: res.data.data });

        setShowShare(res.data.data);
      })
      .catch((error) => {
        console.log({ error });
      });
  };

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
      setPendingVideo(true);
      try {
        await VideoManager.stopCurrent();
        videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 })
        VideoManager.setCurrent(videoRef.current);
      } catch (error) {
        console.log({ error });
        setPendingVideo(false);
      }
    }
  };

  const pauseVideo = async () => {
    setPendingVideo(false);
    if (videoRef && videoRef.current) {
      try {
        await videoRef.current.setStatusAsync({ shouldPlay: false });
      } catch (error) { }
    }
  };

  const onChangeMuteOption = () => {
    setIsMute(!isMute)
  }
  const goToMessage = async () => {
    console.log('go to message=====================')
    NavigationService.push("MessageScreen", {
      conversation: matchInfo,
    });
  };
  const isRecentOnline = currentProfile && currentProfile?.last_active_time ? dayjs().diff(dayjs(currentProfile?.last_active_time), 'minute') < 60 : false

  return (
    <View style={[styles.container]}>
      <Header
        showLogo
        leftIcon={images.back_icon}
        leftAction={() => navigation.goBack()}
        rightIcon={images.more_icon}
        rightAction={moreAction}
        rightIconColor="black"
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
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 5, width: '100%', flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: "black", fontWeight: "bold" }}>
                {currentProfile?.full_name}
              </Text>
              <View style={styles.onlineStatusBg}>
                <OnlineStatus isRecentOnline={isRecentOnline} status={currentProfile?.online_status} radius={12} />
              </View>
            </View>

            {/* <View style={styles.tagContainer}>
              {
                currentProfile?.journey ?
                  <Text
                    style={[
                      styles.tagText,
                      {
                        fontSize: (currentProfile?.journey?.name ?? "").length > 20 ? 13 : 15,
                      },
                    ]}
                  >
                    {currentProfile?.journey?.name}
                  </Text>
                  :
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
              }
            </View> */}
          </View>
          {/* {
            commonPurposes && commonPurposes.message &&
            <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E9E5FF' }}>
              <Image source={images.match_icon} style={{ width: 40, height: 40 }} contentFit='contain' />
              <Text style={{
                fontSize: 13, fontWeight: 'bold', flex: 1
              }}>{commonPurposes.message}</Text>
            </View>
          } */}
          <SwipeCard
            style={{
              width: "100%",
              height: Math.min(
                700,
                Dimensions.get("screen").height - insets.top - insets.bottom - 150,
                // Dimensions.get("screen").height - insets.top - insets.bottom - 150 - (commonPurposes && commonPurposes.message ? 60 : 0),
              ),
              borderWidth: 8,
              borderColor: "white",
              borderRadius: 15,
            }}
            onSwipeLeft={rejectAction}
            onSwipeRight={likeAction}
          >
            {/* <Image source={{ uri: currentProfile?.avatar }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }} contentFit='cover' /> */}
            {currentProfile?.video_intro && (
              <CustomVideo
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 10,
                }}
                posterSource={{ uri: currentProfile?.avatar }}
                ref={videoRef}
                sources={[
                  currentProfile?.video_intro,
                  currentProfile?.video_purpose,
                  currentProfile?.video_interests,
                ]}
                subtitles={[
                  currentProfile?.subtitle_intro,
                  currentProfile?.subtitle_purpose,
                  currentProfile?.subtitle_interests,
                ]}
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={(status) => {
                  // console.log({ status });
                  setPlaying(status.isPlaying || status.isBuffering || status.shouldPlay);
                  if (status.didJustFinish || status.isPlaying) {
                    setPendingVideo(false);
                  }
                }}
                onError={() => {
                  setPendingVideo(false);
                  setPlaying(false);
                }}
                isMuted={isMute}
              />
            )}
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
            {!(playing || pendingVideo) &&
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.79)"]}
                style={styles.nameBackground}
              />
            }
            <View style={{ position: 'absolute', zIndex: 30, left: 16, right: 16, top: 20, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' }}>
              {(playing || pendingVideo) && (
                <TouchableOpacity
                  onPress={pauseVideo}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={images.pause_icon}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                    }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              )}
              {
                (playing || pendingVideo) &&
                <TouchableOpacity onPress={onChangeMuteOption} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mainColor }}>
                  <FontAwesome6 name={isMute ? 'volume-xmark' : 'volume-high'} size={20} color='white' />
                </TouchableOpacity>
              }
            </View>

            <View
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: (playing || pendingVideo) ? -1 : 1
              }}
            >
              <View style={{ flexDirection: 'row', width: "100%", alignItems: "center", justifyContent: 'space-between', padding: 16 }}>
                {!(playing || pendingVideo) && currentProfile?.user_note &&
                  <View style={{ position: 'absolute', top: 5, left: 5, right: 10, }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#7B65E8ee' }} />
                    <View style={{ marginLeft: 12, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#7B65E8ee' }} />
                    <View style={{
                      backgroundColor: '#7B65E8ee', marginLeft: 10, marginTop: 2,
                      paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
                    }}>
                      <Text style={{ color: '#E8FF58', width: '100%', textAlign: 'left', fontSize: 13, lineHeight: 18, fontWeight: '600' }}>{currentProfile?.user_note}</Text>
                    </View>
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
                  !playing && !pendingVideo &&
                  <View
                    style={{
                      marginTop: 32,
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "flex-end",
                      paddingHorizontal: 9,
                      position: "relative",
                    }}
                  >
                    {/* Left side - Pass button */}
                    <View style={{ flex: 1, alignItems: "flex-start", zIndex: 2 }}>
                      {showAcceptReject && currentUser.id !== currentProfile?.id && !matchInfo && (
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
                      )}
                    </View>

                    {/* Center - Video button */}
                    {currentProfile?.video_intro && (
                      <View style={{ 
                        alignItems: "center", 
                        gap: 13, 
                        position: "absolute", 
                        left: "50%", 
                        marginLeft: -40, 
                        zIndex: 3,
                        width: 80 
                      }}>
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
                          {playing || pendingVideo ? "Pause video" : "Watch video"}
                        </Text>
                      </View>
                    )}

                    {/* Right side - Connect/Message button */}
                    <View style={{ flex: 1, alignItems: "flex-end", zIndex: 2 }}>
                      {showAcceptReject && currentUser.id !== currentProfile?.id && !matchInfo && (
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
                      )}
                      {showAcceptReject && currentUser.id !== currentProfile?.id && matchInfo && (
                        <View style={{ alignItems: "center", gap: 13 }}>
                          <TouchableOpacity
                            disabled={loading}
                            onPress={goToMessage}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 30,
                              backgroundColor: "#725ED4",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Image
                              source={images.conversation_icon}
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
                            Message
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                }
              </View>
            </View>
          </SwipeCard>
          {
            profile?.summary && profile?.summary.length > 0 &&
            <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E9E5FF' }}>
              <Text style={{
                fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 18
              }}>{profile?.summary}</Text>
            </View>
          }
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
                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "DD/MM/YYYY"), "year")} yrs`}</Text>
              )}
              {currentProfile?.birthday && currentProfile?.birthday.includes("-") && (
                <Text
                  style={{ fontSize: 14, color: "black" }}
                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "MM-DD-YYYY"), "year")} yrs`}</Text>
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
          {/** Ratings card */}
          <TouchableOpacity
            disabled={currentProfile?.reviewsCount === 0}
            onPress={() =>
              navigation.navigate("ReviewsScreen", {
                profileId: currentProfile?.id,
                avatar: currentProfile?.avatar,
                matchInfo,
                full_name: currentProfile?.full_name,
              })
            }
          >
            <SectionCard className="bg-purple2/50">
              <View className="flex flex-row justify-between grow items-center">
                {currentProfile?.reviewsCount > 0 && (
                  <Rating
                    disabled={true}
                    rating={Number.parseFloat(currentProfile?.avgRating || 0) || 0}
                  />
                )}
                <View className="flex flex-row items-center">
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 15,
                      textVerticalAlign: "auto",
                      marginBottom: 4,
                    }}
                  >
                    {currentProfile?.reviewsCount && currentProfile?.reviewsCount !== 0
                      ? `${currentProfile?.reviewsCount} Review${currentProfile?.reviewsCount !== 1 ? "s" : ""
                      }`
                      : "No reviews yet"}
                  </Text>
                  {currentProfile?.reviewsCount !== 0 && (
                    <Feather name="chevron-right" size={28} color={colors.primary} />
                  )}
                </View>
              </View>
            </SectionCard>
          </TouchableOpacity>

          {!!matchInfo && currentProfile?.reviewsCount === 0 && (
            <TouchableOpacity
              onPress={() => {
                navigation.push("ReviewMatchScreen", {
                  profile: { id: currentProfile?.id, avatar: currentProfile?.avatar },
                });
              }}
            >
              <SectionCard className="flex flex-row justify-between bg-purple text-lg mt-2">
                <Text className="text-white1">Share Your Feedback!</Text>
                <Feather name="chevron-right" size={28} color={colors.white1} />
              </SectionCard>
            </TouchableOpacity>
          )}

          {/* {commonInterests.length > 0 &&
            (
              <View
                style={{
                  backgroundColor: "#725ED4",
                  width: "100%",
                  borderRadius: 10,
                  padding: 16,
                  gap: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={images.same_target_icon}
                  style={{ width: 30, height: 30 }}
                  contentFit="contain"
                />
                {
                  commonInterests.filter((item) => item.type === 'like').length > 0 && (
                    <>
                      <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}>
                        See What You Both Like!
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          flexWrap: "wrap",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {commonInterests.filter((item) => item.type === 'like').map((item, index) => {
                          return (
                            <View
                              key={`${item.tag}-${index}`}
                              style={{
                                flexDirection: "row",
                                gap: 5,
                                paddingHorizontal: 16,
                                height: 32,
                                borderRadius: 16,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#E9E5FF",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#000000",
                                  fontWeight: "700",
                                }}
                              >
                                {item.tag}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )
                } */}
          {/* {
                  commonInterests.filter((item) => item.type === 'dislike').length > 0 && (
                    <>
                      <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}>
                        See What You Both Dislike!
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          flexWrap: "wrap",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {commonInterests.filter((item) => item.type === 'dislike').map((item, index) => {
                          return (
                            <View
                              key={`${item.tag}-${index}`}
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
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "black",
                                  fontWeight: "700",
                                }}
                              >
                                {item.tag}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )
                } */}


          {/* <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#FFFFFF",
                    opacity: 0.4,
                  }}
                />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
                  Discuss your shared love for these common
                </Text>
                {showAcceptReject && currentUser.id !== currentProfile?.id && !matchInfo && (
                  <ButtonWithLoading style={{ width: Platform.isPad ? 500 : '100%' }} text="Connect" onPress={likeAction} loading={loading} />
                )}
              </View>
            )} */}


          {
            currentProfile?.journey_category &&
            <View style={{ width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
                  Journey
                </Text>
              </View>

              <View style={[styles.shadow, { backgroundColor: '#E9E5FF', borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12, gap: 10 }]}
              >
                <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{currentProfile?.journey_category?.name}</Text>
                {
                  currentProfile?.journey &&
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#725ED4' }} />
                    <Text style={{ flex: 1, color: '#333333', fontSize: 14, fontWeight: '400' }}>{currentProfile?.journey?.name}</Text>
                  </View>
                }
              </View>
            </View>
          }
          {/* {(currentProfile?.purposes ?? []).length > 0 && (
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
          )} */}
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
              height: 1,
              backgroundColor: "#D2D2D2",
            }}
          />

          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 15, color: "#595959", lineHeight: 25, textAlign: "center" }}>
              Think this profile might be a good fit for someone you know?
            </Text>
            <Text
              onPress={onGetSharedLink}
              style={{ lineHeight: 25, color: "#333333", fontSize: 14, fontWeight: "bold" }}
            >
              Share it!
            </Text>

            {
              currentProfile?.id !== currentUser.id &&
              <Text
                onPress={onBlock}
                style={{
                  marginTop: 40,
                  lineHeight: 25,
                  color: "#CB3729",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Block
              </Text>
            }
          </View>


          <View style={{ width: '100%', marginTop: 16, borderRadius: 3, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9E5FF' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>More People in this Community</Text>
          </View>

          {(similarUsers ?? []).length > 0 &&
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, columnGap: 16 }}>
              {
                (similarUsers ?? []).map((item) => {
                  return (
                    <SimilarByPathItem
                      key={item.email}
                      item={item}
                      itemWidth={Dimensions.get('screen').width * 0.5 - 24}
                      onPress={() => navigation.replace('ConnectProfileScreen', {profile: item})}
                    />
                  )
                })
              }
            </View>
          }
        </View>
      </ScrollView>

      <ShareModal
        visible={showShare !== null}
        onClose={() => setShowShare(null)}
        full_name={currentProfile?.full_name}
        shareLink={showShare ?? ""}
        shareCode={currentProfile?.referral_id ?? ''}
      />
    </View>
  );
};

export default ConnectProfileScreen;
