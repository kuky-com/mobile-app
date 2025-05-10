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
    backgroundColor: "white",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
});

const DislikeUpdateScreen = ({ navigation, route }) => {
  const { dislikes, onUpdated } = route.params;
  const insets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState("");
  const [tags, setTags] = useState(dislikes ?? []);
  const inputRef = useRef();
  const [currentUser, setCurrentUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();
  const [allDislikes, setAllDislikes] = useState()

  const loadAllDislikes = () => {
    apiClient
      .get("interests/all-dislikes")
      .then((res) => {
        if (res && res.data && res.data.success) {
          console.log({ data: res.data })
          setAllDislikes(res.data.data)
        }
      })
      .catch((error) => {
        console.log({ error });
      });
  }

  useEffect(() => {
    loadAllDislikes()
  }, [])

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "DislikeUpdateScreen",
      screen_class: "DislikeUpdateScreen",
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
        text1: "Your dislike should be at least 2 characters long. Please try again!",
        type: "error",
      });
    }
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags((old) => [...old, { name: tag }]);
      setKeyword("");
    }
  }

  const onRemove = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const onSave = async () => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      const dislikeNames = tags.map((item) => capitalize(item.name));

      const res = await apiClient.post("interests/update-dislikes", { dislikes: dislikeNames });

      if (res && res.data && res.data.success) {
        if (res.data.data && res.data.data.length < dislikeNames.length) {
          // Toast.show({text2: `Oops! That doesn't look like an English word. Please try again.`, type: 'error'})
          const newTags = res.data.data.map((item) => ({ name: item.interest.name }));
          setTags(newTags);
          showAlert("", `Oops! That doesn't look like an English word. Please try again.`, [
            { text: "Ok" },
          ]);
          setLoading(false);
          return;
        } else {
          Toast.show({ text1: "Your dislikes information has been updated!", type: "success" });
        }

        apiClient
          .get("interests/profile-tag")
          .then((res) => {
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
            setLoading(false);
          });
      } else {
        Toast.show({ text1: "Your request failed. Please try again!", type: "error" });
        setLoading(false);
      }
    } catch (error) {
      console.log({ error });
      setLoading(false);
      Toast.show({ text1: "Your request failed. Please try again!", type: "error" });
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 3 }]}
    >
      <StatusBar translucent style="dark" />
      <KeyboardAwareScrollView style={{ flex: 1, width: "100%" }}>
        <View
          style={{ flex: 1, width: Platform.isPad ? 600 : "100%", alignSelf: "center", gap: 24 }}
        >
          <View style={{ justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Image
              source={images.dislike_icon}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
            <Text
              style={{ color: "#FF8B8B", fontSize: 18, fontWeight: "600", textAlign: "center" }}
            >
              Dislikes
            </Text>
          </View>
          <Text
            style={{
              color: "#333333",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 22,
              paddingHorizontal: 16,
            }}
          >
            Add dislikes to avoid matching with people who share them, helping us find better matches for you.
          </Text>
          <View
            style={{
              width: "100%",
              gap: 8,
              flexDirection: "row",
              borderColor: '#333333', borderWidth: 1,
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
              placeholder="Search for dislikes"
              placeholderTextColor="#9a9a9a"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={onAddNewTag}
              maxLength={50}
              ref={inputRef}
            />
            {
              keyword.length > 0 &&
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
            }
          </View>
          <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Your dislikes</Text>
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
              flexDirection: "row",
            }}
          >
            {tags.map((item, index) => {
              return (
                <View
                  key={`tags-${index}`}
                  style={{
                    paddingHorizontal: 8,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    backgroundColor: "#FF8B8B",
                  }}
                >
                  {/* <Image
                    source={images.category_icon}
                    style={{ width: 15, height: 15, tintColor: "black" }}
                    contentFit="contain"
                  /> */}
                  <Text style={{ fontSize: 14, color: "black", fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemove(index)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
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

          <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>You might dislike ...</Text>
          <View style={{ flexWrap: 'wrap', gap: 8, flexDirection: 'row' }}>
            {
              (allDislikes ?? []).map((item) => {
                const filter = dislikes.filter((l) => l.name === item)

                if (filter && filter.length > 0) return null

                return (
                  <TouchableOpacity key={item} onPress={() => addTag(item)} style={{ height: 28, borderRadius: 15, paddingHorizontal: 8, backgroundColor: '#CDB8E2', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: 'black', fontWeight: '500' }}>{item}</Text>
                  </TouchableOpacity>
                )
              })
            }
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
          disabled={loading}
          style={{
            gap: 5,
            flexDirection: "row",
            flex: 1,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loading ? "#9A9A9A" : "#333333",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Save</Text>
          {loading && <ActivityIndicator size="small" color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DislikeUpdateScreen;
