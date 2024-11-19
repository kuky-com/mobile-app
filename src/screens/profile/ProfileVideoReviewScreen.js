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
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});

const ProfileVideoReviewScreen = ({ navigation, route }) => {
  const userInfo = route.params;
  const insets = useSafeAreaInsets();
  const currentUser = useAtomValue(userAtom);
  const [purposes, setPurposes] = useState(userInfo?.purposes ?? []);
  const [likes, setLikes] = useState(userInfo?.likes ?? []);
  const [dislikes, setDislikes] = useState(userInfo?.dislikes ?? []);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();


  useEffect(() => {
    apiClient
      .get("interests/likes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          setLikes(res.data.data);
        }
      })
      .catch((error) => {
        console.log({ error });
      });

    apiClient
      .get("interests/dislikes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          setDislikes(res.data.data);
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  }, []);

  const onAddDislikes = () => {
    navigation.push("DislikeSelectScreen", {
      dislikes: dislikes,
      onUpdated: (newList) => setDislikes(newList),
    });
  };

  const onAddLikes = () => {
    navigation.push("InterestSelectScreen", {
      likes: likes,
      onUpdated: (newList) => setLikes(newList),
    });
  };

  const onAddPurpose = () => {
    navigation.push("PurposeUpdateScreen", {
      purposes: purposes,
      onUpdated: (newList) => setPurposes(newList),
    });
  };

  const onContinue = async () => {
    if (purposes.length === 0) {
      Toast.show({ text1: "Please enter at least one journey/purpose", type: "error" });
      return;
    }
    if (likes.length === 0) {
      Toast.show({ text1: "Please enter at least one interests/hobbies", type: "error" });
      return;
    }

    if (!currentUser?.avatar) {
      showAlert("No profile picture", "Are you want to continue without add your profile image?", [
        { text: "Continue", onPress: continueProfile },
        { text: "Add profile picture", onPress: updateAvatar },
      ]);
    } else {
      continueProfile();
    }
  };

  const continueProfile = async () => {
    try {
      setLoading(true);

      let videoUrl = null;
      if (userInfo && userInfo.videoIntro && userInfo.videoIntro.https) {
        videoUrl = userInfo.videoIntro.https;
      }

      apiClient
        .post("users/update", { video_intro: videoUrl })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.success) {
            NavigationService.resetRaw([
              {
                name: "Dashboard",
                state: {
                  index: 2,
                  routes: [{ name: "ExploreScreen" }, { name: "MatchesScreen" }, { name: "ProfileScreen" }],
                },
              },
            ]);
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

  const updateAvatar = () => {
    navigation.push("AvatarUpdateScreen");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={{ width: "100%", alignItems: "flex-end", paddingHorizontal: 16 }}>
        <Image
          source={images.logo_with_text}
          style={{ width: 80, height: 30 }}
          contentFit="contain"
        />
      </View>
      <View
        style={{
          width: "100%",
          paddingHorizontal: 16,
          alignItems: "center",
          gap: 8,
          marginTop: -16,
        }}
      >
        {/* <Image source={{ uri: currentUser?.avatar }} contentFit='cover' style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.mainColor }} /> */}
        <View
          style={{
            width: 94,
            height: 94,
            borderRadius: 47,
            backgroundColor: colors.mainColor,
            borderWidth: 2,
            borderColor: "#E74C3C",
          }}
        >
          <AvatarImage
            avatar={currentUser?.avatar}
            full_name={currentUser?.full_name}
            contentFit="cover"
            style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.mainColor }}
          />
          <TouchableOpacity
            onPress={updateAvatar}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 30,
              height: 30,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: "black",
              backgroundColor: "#E74C3C",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={images.edit_icon}
              style={{ width: 15, height: 15, tintColor: "black" }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: "black",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 30,
          }}
        >
          Here’s what Kuky found based on your videos.
        </Text>
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingHorizontal: 16,
          width: Platform.isPad ? 600 : "100%",
          alignSelf: "center",
        }}
      >
        <View style={{ flex: 1, gap: 16, width: "100%" }}>
          <View
            style={{
              backgroundColor: "#725ED4",
              width: "100%",
              borderRadius: 10,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 8, paddingVertical: 12, alignItems: "center" }}
            >
              <Image
                source={images.interest_icon}
                style={{ width: 18, height: 18, tintColor: "white" }}
                contentFit="contain"
              />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Your Journey/Purpose
              </Text>
            </View>
            <View style={{ width: "100%", backgroundColor: "#9889E1", height: 1 }} />
            <View
              style={{
                paddingVertical: 16,
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingBottom: 16,
              }}
            >
              {purposes.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={`purpose-${item.name}-${index}`}
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      paddingLeft: 8,
                      paddingRight: 16,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F2F0FF",
                    }}
                  >
                    <Image
                      style={{ width: 18, height: 18 }}
                      contentFit="contain"
                      source={images.seen_icon}
                    />
                    <Text style={{ fontSize: 14, color: "black", fontWeight: "700" }}>
                      {item.name}
                    </Text>
                    {/* <TouchableOpacity onPress={() => removePurpose(index)} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                            </TouchableOpacity> */}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={onAddPurpose}
                style={{
                  width: 68,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#E8FF58",
                }}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  source={images.edit_icon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#725ED4",
              width: "100%",
              borderRadius: 10,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 8, paddingVertical: 12, alignItems: "center" }}
            >
              <Image
                source={images.interest_icon}
                style={{ width: 18, height: 18, tintColor: "white" }}
                contentFit="contain"
              />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Interests and hobbies
              </Text>
            </View>
            <View style={{ width: "100%", backgroundColor: "#9889E1", height: 1 }} />
            <View
              style={{
                paddingVertical: 16,
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingBottom: 16,
              }}
            >
              {likes.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={`like-${item.name}-${index}`}
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      paddingLeft: 8,
                      paddingRight: 16,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F2F0FF",
                    }}
                  >
                    <Image
                      style={{ width: 18, height: 18 }}
                      contentFit="contain"
                      source={images.seen_icon}
                    />
                    <Text style={{ fontSize: 14, color: "black", fontWeight: "700" }}>
                      {item.name}
                    </Text>
                    {/* <TouchableOpacity onPress={() => removeLike(index)} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                            </TouchableOpacity> */}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={onAddLikes}
                style={{
                  width: 68,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#E8FF58",
                }}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  source={images.edit_icon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#725ED4",
              width: "100%",
              borderRadius: 10,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 8, paddingVertical: 12, alignItems: "center" }}
            >
              <Image
                source={images.dislike_icon}
                style={{ width: 18, height: 18, tintColor: "white" }}
                contentFit="contain"
              />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Dislike</Text>
            </View>
            <View style={{ width: "100%", backgroundColor: "#9889E1", height: 1 }} />
            <View
              style={{
                paddingVertical: 16,
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingBottom: 16,
              }}
            >
              {dislikes.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={`dislike-${item.name}-${index}`}
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      paddingLeft: 8,
                      paddingRight: 16,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#FF8B8B",
                    }}
                  >
                    <Image
                      style={{ width: 18, height: 18 }}
                      contentFit="contain"
                      source={images.seen_icon}
                    />
                    <Text style={{ fontSize: 14, color: "black", fontWeight: "700" }}>
                      {item.name}
                    </Text>
                    {/* <TouchableOpacity onPress={() => removeDislike(index)} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333', width: 16, height: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={images.close_icon} style={{ width: 10, height: 10, tintColor: '#333333' }} contentFit='contain' />
                                            </TouchableOpacity> */}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={onAddDislikes}
                style={{
                  width: 68,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#E8FF58",
                }}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  source={images.edit_icon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          <ButtonWithLoading text="Confirm & Continue" onPress={onContinue} loading={loading} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ProfileVideoReviewScreen;
