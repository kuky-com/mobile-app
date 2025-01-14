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
import ShareModal from "../../components/ShareModal";
import { FontAwesome6 } from "@expo/vector-icons";
import { isStringInteger } from "../../utils/utils";
import analytics from '@react-native-firebase/analytics'
import OnlineStatus from "../../components/OnlineStatus";

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
    marginTop: 13
  },
});

const ConnectProfileScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { profile, showAcceptReject = true } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [matchInfo, setMatchInfo] = useState(null);
  const currentUser = useAtomValue(userAtom);
  const showAlert = useAlert();
  const [commonPurposes, setCommonPurposes] = useState(null);
  const [commonInterests, setCommonInterests] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [showShare, setShowShare] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(false);

  const [isMute, setIsMute] = useState(false)

  const videoRef = useRef(null);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'ConnectProfileScreen',
      screen_class: 'ConnectProfileScreen'
    })
  }, [])

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

      if (isStringInteger(currentProfile.id) && currentProfile.id !== currentUser.id) {
        apiClient
          .get(`users/${profile.id}/journey`)
          .then((res) => {
            if (res && res.data && res.data.success) {
              setCommonPurposes(res.data.data);
            }
          })
          .catch((error) => {
            console.log({ error });
          });

        apiClient
          .get(`users/${profile.id}/common-interests`)
          .then((res) => {
            if (res && res.data && res.data.success) {
              setCommonInterests(res.data.data);
            }
          })
          .catch((error) => {
            console.log({ error });
          });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  console.log({ currentProfile: currentProfile.id, currentUser: currentUser.id })

  useEffect(() => {
    if (isStringInteger(currentProfile.id) && currentProfile.id !== currentUser.id) {
      apiClient
        .get(`users/${profile.id}/journey`)
        .then((res) => {
          if (res && res.data && res.data.success) {
            setCommonPurposes(res.data.data);
          }
        })
        .catch((error) => {
          console.log({ error });
        });

      apiClient
        .get(`users/${profile.id}/common-interests`)
        .then((res) => {
          if (res && res.data && res.data.success) {
            setCommonInterests(res.data.data);
          }
        })
        .catch((error) => {
          console.log({ error });
        });
    }
  }, [currentProfile])

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
          console.log({ res });
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
              "While we complete the approval, feel free to browse and get familiar with other profiles. You’ll be connecting soon!",
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
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
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
      const options = currentProfile.id === currentUser.id ? [
        { text: "Share Profile", image: images.share_profile }
      ] : [
        { text: "Share Profile", image: images.share_profile },
        { text: "Block Users", image: images.delete_icon },
      ]

      await SheetManager.show("action-sheets", {
        payload: {
          actions: options,
          onPress(index) {
            if (index === 0) {
              onGetSharedLink()
            } else if (index === 1) {
              onBlock();
            }
          },
        },
      });
    } catch (error) {
      setLoading(false);
    }
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
        await videoRef.current.setStatusAsync({ shouldPlay: true, positionMillis: 50 });
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
          {
            commonPurposes && commonPurposes.message &&
            <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E9E5FF' }}>
              <Image source={images.match_icon} style={{ width: 40, height: 40 }} contentFit='contain' />
              <Text style={{
                fontSize: 13, fontWeight: 'bold', flex: 1
              }}>{commonPurposes.message}</Text>
            </View>
          }
          <View
            style={{
              width: "100%",
              height: Math.min(
                700,
                Dimensions.get("screen").height - insets.top - insets.bottom - 80 - (commonPurposes && commonPurposes.message ? 60 : 0),
              ),
              borderWidth: 8,
              borderColor: "white",
              borderRadius: 15,
            }}
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
                ref={videoRef}
                source={{ uri: currentProfile?.video_intro }}
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
                {!playing && (
                  <View style={{flexDirection: 'row', gap: 5, width: '100%'}}>
                    <Text style={{ fontSize: 32, color: "white", fontWeight: "bold", maxWidth: Dimensions.get('screen').width - 86 }}>
                      {currentProfile?.full_name}
                    </Text>
                    {isRecentOnline &&
                      <View style={styles.onlineStatusBg}>
                        <OnlineStatus isRecentOnline={isRecentOnline} status={currentProfile?.online_status} radius={12} />
                      </View>
                    }
                  </View>
                )}
                {/* <View style={{ width: '100%', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {
                                        currentProfile?.interests.map((interest) => (
                                            <View key={`interest-${interest.id}`} style={{ flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: interest?.user_interests?.interest_type !== 'dislike' ? 'rgba(123, 101,232,0.75)' : 'rgba(250, 139, 139,0.75)' }}>
                                                <Image source={images.category_icon} style={{ width: 16, height: 16 }} contentFit='contain' />
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{interest.name}</Text>
                                            </View>
                                        ))
                                    }
                                </View> */}

                <View
                  style={{
                    marginTop: 32,
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: showAcceptReject && !matchInfo ? "space-between" : "center",
                    paddingHorizontal: 9,
                  }}
                >
                  {showAcceptReject && currentUser.id !== currentProfile.id && !matchInfo && (
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
                        {playing || pendingVideo ? "Pause video" : "Watch video"}
                      </Text>
                    </View>
                  )}
                  {showAcceptReject && currentUser.id !== currentProfile.id && !matchInfo && (
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
                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "DD/MM/YYYY"), "year")} yrs`}</Text>
              )}
              {currentProfile?.birthday && currentProfile?.birthday.includes("-") && (
                <Text
                  style={{ fontSize: 14, color: "black" }}
                >{`${dayjs().diff(dayjs(currentProfile?.birthday, "MM-DD-YYYY"), "year")} yrs`}</Text>
              )}
            </View>

            {currentProfile.publicPronouns && (
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
              >{`${currentProfile.location ?? ""}`}</Text>
            </View>
          </View>
          {/** Ratings card */}
          <TouchableOpacity
            disabled={currentProfile.reviewsCount === 0}
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
                      ? `${currentProfile?.reviewsCount} Review${currentProfile.reviewsCount !== 1 ? "s" : ""
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

          {commonInterests.length > 0 &&
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
                }
                {
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
                }

                <View
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
                {showAcceptReject && currentUser.id !== currentProfile.id && !matchInfo && (
                  <ButtonWithLoading style={{ width: Platform.isPad ? 500 : '100%' }} text="Connect" onPress={likeAction} loading={loading} />
                )}
              </View>
            )}

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
              currentProfile.id !== currentUser.id &&
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
        </View>
      </ScrollView>

      <ShareModal
        visible={showShare !== null}
        onClose={() => setShowShare(null)}
        full_name={currentProfile?.full_name}
        shareLink={showShare ?? ""}
      />
    </View>
  );
};

export default ConnectProfileScreen;
