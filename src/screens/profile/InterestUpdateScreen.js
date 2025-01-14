import { userAtom } from "@/actions/global";
import { useAlert } from "@/components/AlertProvider";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import apiClient from "@/utils/apiClient";
import constants from "@/utils/constants";
import images from "@/utils/images";
import NavigationService from "@/utils/NavigationService";
import { capitalize } from "@/utils/utils";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import analytics from '@react-native-firebase/analytics'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#725ED4",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
});

const InterestUpdateScreen = ({ navigation, route }) => {
  const { likes, onUpdated } = route.params;
  const insets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const [tags, setTags] = useState(likes.map((item) => ({ name: item.name })));
  const inputRef = useRef();
  const [currentUser, setCurrentUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "InterestUpdateScreen",
      screen_class: "InterestUpdateScreen",
    })
  }, [])

  const onAddNewTag = () => {
    Keyboard.dismiss();
    if (keyword.length > 1) {
      if (!tags.includes(keyword)) {
        setTags((old) => [...old, { name: keyword }]);
        setKeyword("");

        setTimeout(() => {
          if (inputRef && inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } else {
      Toast.show({
        text1: "Your interest should be at least 2 characters long. Please try again!",
        type: "error",
      });
    }
  };

  const onRemove = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const onSave = async () => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      const likeNames = tags.map((item) => capitalize(item.name));

      const res = await apiClient.post("interests/update-likes", { likes: likeNames });

      if (res && res.data && res.data.success) {
        if (res.data.data && res.data.data.length < likeNames.length) {
          // Toast.show({text2: `Oops! That doesn't look like an English word. Please try again.`, type: 'error'})
          const newTags = res.data.data.map((item) => ({ name: item.interest.name }));
          setTags(newTags);
          showAlert("", `Oops! That doesn't look like an English word. Please try again.`, [
            { text: "Ok" },
          ]);
          setLoading(false);
          return;
        } else {
          Toast.show({ text1: "Your interest information has been updated!", type: "success" });
        }

        apiClient
          .get("interests/profile-tag")
          .then((res) => {
            console.log({ res });
            setLoading(false);
            if (res && res.data && res.data.success) {
              setCurrentUser(res.data.data);
              DeviceEventEmitter.emit(constants.REFRESH_SUGGESTIONS);
            }

            if (onUpdated) {
              onUpdated(tags);
            }
            navigation.goBack();
          })
          .catch((error) => {
            console.log({ error });
          });
      } else {
        setLoading(false);
        Toast.show({ text1: "Your request failed. Please try again!", type: "error" });
      }
    } catch (error) {
      console.log({ error });
      setLoading(false);
      Toast.show({ text1: "Your request failed. Please try again!", type: "error" });
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}
    >
      <StatusBar translucent style="dark" />
      {/* {false && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: 16,
            top: insets.top + 16,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={images.back_icon_no_border}
            style={{ width: 25, height: 25 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      )} */}
      <KeyboardAwareScrollView style={{ flex: 1, width: "100%" }}>
        <View
          style={{ flex: 1, width: Platform.isPad ? 600 : "100%", alignSelf: "center", gap: 24 }}
        >
          <View style={{ justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Image
              source={images.interest_icon}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
            <Text
              style={{ color: "#E8FF58", fontSize: 18, fontWeight: "600", textAlign: "center" }}
            >
              Interests and hobbies
            </Text>
          </View>
          <Text
            style={{
              color: "#F5F5F5",
              fontSize: 18,
              textAlign: "center",
              lineHeight: 25,
              paddingHorizontal: 20,
            }}
          >
            Add interests to your profile to help you match with people who love them too.
          </Text>
          <View
            style={{
              width: "100%",
              gap: 8,
              flexDirection: "row",
              backgroundColor: "white",
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
            }}
          >
            <Image
              source={images.search_icon}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
            <TextInput
              style={{ fontSize: 18, fontWeight: "600", flex: 1, padding: 8, color: "black" }}
              underlineColorAndroid="#00000000"
              placeholder="What are you into?"
              placeholderTextColor="#9a9a9a"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={onAddNewTag}
              maxLength={50}
              ref={inputRef}
              autoFocus
            />
            <TouchableOpacity
              onPress={onAddNewTag}
              style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
            >
              <Image
                source={images.plus_icon}
                style={{ width: 20, height: 20, tintColor: "#725ED4" }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
              flexDirection: "row",
            }}
          >
            {tags.map((item, index) => {
              return (
                <View
                  key={`tags-${index}`}
                  style={{
                    paddingHorizontal: 12,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    backgroundColor: "#F2F0FF",
                  }}
                >
                  <Image
                    source={images.category_icon}
                    style={{ width: 15, height: 15, tintColor: "black" }}
                    contentFit="contain"
                  />
                  <Text style={{ fontSize: 14, color: "black", fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemove(index)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#E8FF58",
                      borderWidth: 1,
                      borderColor: "#333333",
                    }}
                  >
                    <Image
                      source={images.close_icon}
                      style={{ width: 10, height: 10, tintColor: "#333333" }}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View
        style={{
          flexDirection: "row",
          width: Platform.isPad ? 600 : "100%",
          alignSelf: "center",
          gap: 16,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FF8B8B",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          disabled={tags.length === 0 || loading}
          style={{
            flex: 1,
            gap: 5,
            flexDirection: "row",
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tags.length === 0 ? "#9A9A9A" : "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Save</Text>
          {loading && <ActivityIndicator size="small" color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InterestUpdateScreen;
