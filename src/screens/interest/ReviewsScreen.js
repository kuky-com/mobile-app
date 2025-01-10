import { View, Platform, FlatList, Pressable } from "react-native";
import { Header } from "@/components/Header";
import Text from "@/components/Text";
import images from "@/utils/images";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionCard } from "@/components/SectionCard";
import { useUserReviews } from "@/hooks/useUserReviews";
import { Rating } from "@/components/Rating";
import { Pill } from "@/components/Pill";
import Feather from "@expo/vector-icons/Feather";
import AvatarImage from "@/components/AvatarImage";
import { formatDistance } from "date-fns/formatDistance";
import LoadingView from "@/components/LoadingView";
import NavigationService from "@/utils/NavigationService";
import colors from "@/utils/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import analytics from '@react-native-firebase/analytics'
import { useEffect } from "react";

export const ReviewsScreen = ({ navigation, route }) => {
  const { profileId, avatar, full_name, matchInfo } = route.params;
  const insets = useSafeAreaInsets();
  const { isFetched, data, refetch, isRefetching } = useUserReviews(profileId);

  useEffect(() => {
    analytics().logScreenView({
      screen_name: "ReviewsScreen",
      screen_class: "ReviewsScreen",
    })
  }, [])

  return (
    <View className="flex h-full">
      <Header
        showLogo
        leftIcon={images.back_icon}
        leftAction={() => NavigationService.goBack()}
        // rightIcon={images.more_icon}
        // rightAction={moreAction}
        rightIconColor="black"
      />
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
        <Text style={{ fontWeight: "bold" }} className="text-2xl">
          Reviews
        </Text>

        <>
          <SectionCard>
            <View className="flex-row justify-between grow p-2">
              <View>
                <AvatarImage
                  avatar={avatar}
                  full_name={full_name}
                  style={{
                    borderWidth: 2,
                    borderColor: "white",
                    height: 75,
                    width: 75,
                    borderRadius: 100,
                  }}
                />
              </View>
              <View className="flex items-end gap-2">
                <Pill>
                  <Text
                    style={{ fontWeight: "bold" }}
                    className="text-purple"
                  >{`${Number.parseFloat(data?.avgRating || 5).toFixed(1)} / 5`}</Text>
                </Pill>
                <Rating disabled={true} rating={Number.parseFloat(data?.avgRating || 5) || 5} />
                <Text style={{ fontWeight: "600" }} className="text-purple">
                  {data?.reviewsCount && data?.reviewsCount !== 0
                    ? `${data?.reviewsCount} Review${data.reviewsCount !== 1 ? "s" : ""}`
                    : "No reviews yet"}
                </Text>
              </View>
            </View>
          </SectionCard>
          {!!matchInfo && (
            <TouchableOpacity
              onPress={() => {
                navigation.push("ReviewMatchScreen", { profile: { id: profileId, avatar } });
              }}
            >
              <SectionCard className="flex flex-row justify-between bg-purple text-lg mt-2">
                <Text className="text-white1">Share Your Feedback!</Text>
                <Feather name="chevron-right" size={28} color={colors.white1} />
              </SectionCard>
            </TouchableOpacity>
          )}
          {isFetched && (
            <FlatList
              className="mt-1"
              data={data?.reviews}
              onRefresh={() => refetch()}
              refreshing={isRefetching}
              renderItem={({ item }) => {
                return (
                  <SectionCard className="bg-gray my-1.5">
                    <Pressable
                      className="flex grow"
                      onPress={() => {
                        console.log({
                          profile: { id: item.reviewer.id, full_name: item.reviewer?.full_name },
                        });
                        NavigationService.push("ConnectProfileScreen", {
                          profile: { id: item.reviewer.id, full_name: item.reviewer?.full_name },
                        });
                      }}
                    >
                      <View className="flex flex-row grow justify-between">
                        <View className="flex flex-row items-center gap-1">
                          <AvatarImage
                            avatar={item.reviewer.avatar}
                            full_name={item.reviewer?.full_name}
                            style={{
                              height: 25,
                              width: 25,
                              borderRadius: 100,
                            }}
                          />
                          <Text style={{ fontWeight: "600", width: 80 }}>
                            {item.reviewer?.full_name}
                          </Text>
                          <Rating disabled={true} size={15} rating={item.rating} />
                        </View>
                        <Text className="text-xs text-gray2">
                          {formatDistance(new Date(item.createdAt), new Date(), {
                            addSuffix: true,
                          })}
                        </Text>
                      </View>
                      <Text className="text-black1 leading-relaxed mt-4">{`“${item.note}”`}</Text>
                    </Pressable>
                  </SectionCard>
                );
              }}
            />
          )}
          {!isFetched && <LoadingView />}
        </>
      </View>
    </View>
  );
};
