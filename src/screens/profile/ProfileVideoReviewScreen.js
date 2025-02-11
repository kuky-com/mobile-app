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
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'
import * as Location from 'expo-location';
import { FontAwesome6 } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { SheetManager } from "react-native-actions-sheet";
import { DEFAULT_DISLIKES, DEFAULT_LIKES, DEFAULT_PURPOSES } from "../../utils/utils";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeButton: {
    marginTop: 50,
    marginLeft: 20,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
});

const ProfileVideoReviewScreen = ({ navigation, route }) => {
  const userInfo = route.params;
  const insets = useSafeAreaInsets();
  const currentUser = useAtomValue(userAtom);
  const [purposes, setPurposes] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [allPurposes, setAllPurposes] = useState(DEFAULT_PURPOSES);
  const [allLikes, setAllLikes] = useState(DEFAULT_LIKES);
  const [allDislikes, setAllDislikes] = useState(DEFAULT_DISLIKES);
  // const [referral, setReferral] = useState("");
  const showAlert = useAlert();

  useEffect(() => {
    analytics().logScreenView({
      screen_name: 'ProfileVideoReviewScreen',
      screen_class: 'ProfileVideoReviewScreen',
    });
  }, [])

  useEffect(() => {
    apiClient
      .get("interests/all-likes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          setAllLikes(res.data.data)
        }
      })
      .catch((error) => {
        console.log({ error });
      });

    apiClient
      .get("interests/all-dislikes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          setAllDislikes(res.data.data)
        }
      })
      .catch((error) => {
        console.log({ error });
      });

    apiClient
      .get("interests/all-purposes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          setAllPurposes(res.data.data)
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  }, []);

  useEffect(() => {
    apiClient
      .get("interests/likes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          const options = res.data.data.map((item) => item.name)
          setLikes(options);
        }
      })
      .catch((error) => {
        console.log({ error });
      });

    apiClient
      .get("interests/dislikes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          const options = res.data.data.map((item) => item.name)
          setDislikes(options);
        }
      })
      .catch((error) => {
        console.log({ error });
      });

    apiClient
      .get("interests/purposes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          const options = res.data.data.map((item) => item.name)
          setPurposes(options);
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  }, []);

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
      setLoading(true)
      const updatePurposeRequest = await apiClient.post('interests/update-purposes', { purposes: purposes })
      const updateLikesRequest = await apiClient.post('interests/update-likes', { likes: likes })
      const updateDislikesRequest = await apiClient.post('interests/update-dislikes', { dislikes: dislikes })

      setLoading(false)
      if (updatePurposeRequest && updatePurposeRequest.data && updatePurposeRequest.data.success &&
        updateLikesRequest && updateLikesRequest.data && updateLikesRequest.data.success &&
        updateDislikesRequest && updateDislikesRequest.data && updateDislikesRequest.data.success
      ) {
        setLoading(true);

        let videoUrl = null;
        if (userInfo && userInfo.videoIntro && userInfo.videoIntro.https) {
          videoUrl = userInfo.videoIntro.https;
        }

        apiClient
          .post("users/update", { video_intro: videoUrl })
          .then(async (res) => {
            setLoading(false);
            if (res && res.data && res.data.success) {
              NavigationService.reset("AIMatchingScreen");
            } else {
              Toast.show({ text1: res.data.message, type: "error" });
            }
          })
          .catch((error) => {
            setLoading(false);
            console.log({ error });
            Toast.show({ text1: error, type: "error" });
          });
      } else {
        Toast.show({ text1: 'Your request failed. Please try again!', type: 'error' })
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const updateAvatar = () => {
    navigation.push("AvatarUpdateScreen");
  };

  const onSelectPurpose = async () => {
    const options = allPurposes.map((item) => {
      return {
        id: item,
        text: item,
      };
    });

    purposes.forEach(purpose => {
      if(!allPurposes.includes(purpose)) {
        options.unshift({ id: purpose, text: purpose });
      }
    });

    await SheetManager.show('selection-sheets', {
      payload: {
        actions: options,
        selectedList: purposes ?? [],
        onSelected: (list) => setPurposes(list),
      },
    });
  }

  const onSelectLike = async () => {
    const options = allLikes.map((item) => {
      return {
        id: item,
        text: item,
      };
    });

    likes.forEach(like => {
      if(!allLikes.includes(like)) {
        options.unshift({ id: like, text: like });
      }
    });

    await SheetManager.show('selection-sheets', {
      payload: {
        actions: options,
        selectedList: likes ?? [],
        onSelected: (list) => setLikes(list),
      },
    });
  }

  const onSelectDislike = async () => {
    const options = allDislikes.map((item) => {
      return {
        id: item,
        text: item,
      };
    });

    dislikes.forEach(dislike => {
      if(!allDislikes.includes(dislike)) {
        options.unshift({ id: dislike, text: dislike });
      }
    });

    await SheetManager.show('selection-sheets', {
      payload: {
        actions: options,
        selectedList: dislikes ?? [],
        onSelected: (list) => setDislikes(list),
      },
    });
  }

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
          <View style={{ flex: 1, width: '100%', paddingVertical: 16, gap: 32, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <View style={{ gap: 8, width: "100%" }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>{'What’s your goal here?'}<Text style={{ color: 'red' }}>{' *'}</Text></Text>
              <TouchableOpacity onPress={onSelectPurpose} style={{
                borderRadius: 15, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center',
                flexDirection: 'row', borderWidth: 1, borderColor: '#726E70', gap: 5
              }}>
                <Text style={{
                  flex: 1, lineHeight: 18, fontSize: 13, color: purposes.length > 0 ? '#000000' : '#aaaaaa',
                  fontWeight: purposes.length > 0 ? 'bold' : '400'
                }}
                >{purposes.length > 0 ? purposes.join(', ') : 'Find support for anxiety'}</Text>
                <FontAwesome6 name='chevron-down' size={16} color='#333333' />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8, width: "100%" }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>{'What are your hobbies and interests?'}<Text style={{ color: 'red' }}>{' *'}</Text></Text>
              <TouchableOpacity onPress={onSelectLike} style={{
                borderRadius: 15, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center',
                flexDirection: 'row', borderWidth: 1, borderColor: '#726E70', gap: 5
              }}>
                <Text style={{
                  flex: 1, lineHeight: 18, fontSize: 13, color: likes.length > 0 ? '#000000' : '#aaaaaa',
                  likes: purposes.length > 0 ? 'bold' : '400'
                }}
                >{likes.length > 0 ? likes.join(', ') : 'Reading, hiking, painting'}</Text>
                <FontAwesome6 name='chevron-down' size={16} color='#333333' />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8, width: "100%" }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black' }}>{'What don’t you like?'}</Text>
              <TouchableOpacity onPress={onSelectDislike} style={{
                borderRadius: 15, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center',
                flexDirection: 'row', borderWidth: 1, borderColor: '#726E70', gap: 5
              }}>
                <Text style={{
                  flex: 1, lineHeight: 18, fontSize: 13, color: dislikes.length > 0 ? '#000000' : '#aaaaaa',
                  dislikes: purposes.length > 0 ? 'bold' : '400'
                }}
                >{dislikes.length > 0 ? dislikes.join(', ') : 'Crowded places, loud noises'}</Text>
                <FontAwesome6 name='chevron-down' size={16} color='#333333' />
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
