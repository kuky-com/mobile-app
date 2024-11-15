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
import NavigationService, { navigationRef } from "@/utils/NavigationService";

export const ReviewsScreen = ({ navigation, route }) => {
  const { profileId, matchInfo, avatar, full_name } = route.params;
  const insets = useSafeAreaInsets();
  const { isFetched, data, error, refetch, isRefetching } = useUserReviews(profileId);
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
            <SectionCard className="flex flex-row justify-between">
              <Text>Share Your Feedback!</Text>
              <Feather name="chevron-right" size={28} color={"white"} />
            </SectionCard>
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
                          profile: { id: item.reviewer.id, full_name: item.reviewer.full_name },
                        });
                        NavigationService.push("ConnectProfileScreen", {
                          profile: { id: item.reviewer.id, full_name: item.reviewer.full_name },
                        });
                      }}
                    >
                      <View className="flex flex-row grow justify-between">
                        <View className="flex flex-row items-center gap-1">
                          <AvatarImage
                            avatar={item.reviewer.avatar}
                            full_name={item.reviewer.full_name}
                            style={{
                              height: 25,
                              width: 25,
                              borderRadius: 100,
                            }}
                          />
                          <Text style={{ fontWeight: "600", width: 80 }}>
                            {item.reviewer.full_name}
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
