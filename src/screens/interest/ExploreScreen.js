import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, DeviceEventEmitter, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DynamicLikeItem from '@/components/DynamicLikeItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/utils/apiClient';
import images from '@/utils/images';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import constants from '@/utils/constants';
import { useAtom } from 'jotai';
import { notiCounterAtom } from '@/actions/global';

const ITEM_WIDTH = Platform.isPad ? Dimensions.get('screen').width / 4 - 20 : Dimensions.get('screen').width / 2 - 24;

const ExploreScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [suggestions, setSuggestions] = useState([])
    const [notSuggestions, setNotSuggestions] = useState([])
    const [isFetching, setFetching] = useState(false)
    const [notiCounter, setNotiCounter] = useAtom(notiCounterAtom)

    useEffect(() => {
        onRefresh()
    }, [])

    useEffect(() => {
        let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, event => {
            onRefresh()
        });

        return () => {
            eventListener.remove();
        };
    }, [])

    const onRefresh = () => {
        setFetching(true)
        apiClient.get('matches/best-matches')
            .then((res) => {
                setFetching(false)
                console.log({ res: res.data })
                if (res && res.data && res.data.success) {
                    setSuggestions(res.data.data)

                    if (res.data.data.length < 20) {
                        onLoadNotSuggestion()
                    }
                } else {
                    setSuggestions([])
                }
            })
            .catch((error) => {
                setFetching(false)
                console.log({ error })
                setSuggestions([])
            })
    }

    const onLoadNotSuggestion = () => {
        apiClient.get('matches/less-matches')
            .then((res) => {
                console.log({ res: res.data })
                if (res && res.data && res.data.success) {
                    setNotSuggestions(res.data.data)
                } else {
                    setNotSuggestions([])
                }
            })
            .catch((error) => {
                console.log({ error })
                setNotSuggestions([])
            })
    }


    const openProfile = (item) => {
        navigation.push('ConnectProfileScreen', { profile: item })
    }

    const renderItem = ({ item }) => {
        if (isFetching) {
            return (
                <View style={{
                    backgroundColor: '#eeeeee', borderRadius: 20, margin: 8,
                    borderWidth: 1, borderColor: 'white'
                }}>
                    <SkeletonPlaceholder borderRadius={20} backgroundColor='white'>
                        <SkeletonPlaceholder.Item
                            alignItems="flex-end" justifyContent='space-between'
                            width={ITEM_WIDTH} height={ITEM_WIDTH + 40}
                            backgroundColor='blue'
                            style={{
                                backgroundColor: 'blue', borderRadius: 20, paddingVertical: 16
                            }}>
                            <SkeletonPlaceholder.Item right={8} width={ITEM_WIDTH / 2} height={20} borderRadius={10} />
                            <SkeletonPlaceholder.Item right={20} width={ITEM_WIDTH - 40} height={20} borderRadius={10} />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>
                </View>

            )
        }
        return (
            <DynamicLikeItem onPress={() => openProfile(item)} item={item} itemWidth={ITEM_WIDTH} />
        );
    };

    const renderHeader = () => {
        return (
            <View style={{ paddingVertical: 10, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>Explore</Text>
            </View>
        )
    }

    const openNotification = () => {
        navigation.push('NotificationListScreen')
    }

    const renderFooter = () => {
        if (notSuggestions.length > 0) {
            return (
                <View style={{marginBottom: insets.bottom + 80 }}>
                    <Text style={{padding: 16, fontSize: 12, color: '#aaaaaa', fontWeight: 'bold', textAlign: "center"}}>It looks like we’ve shown you all the best matches for now. But don’t worry, here are some other interesting users you might want to check out!</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {notSuggestions.map((item) => {
                            return(
                                <DynamicLikeItem key={`notsuggestion-${item.id}`} onPress={() => openProfile(item)} item={item} itemWidth={ITEM_WIDTH} />
                            )
                        })}
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ height: insets.bottom + 80 }}></View>
            )
        }
    }

    return (
        <View style={styles.container}>
            <Header
                showLogo
                rightIcon={images.notification_icon}
                rightAction={openNotification}
                rightCounter={notiCounter}
            />
            <FlatList
                data={isFetching ? [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }] : suggestions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={Platform.isPad ? 4 : 2}
                style={{ flex: 1, paddingHorizontal: 8 }}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                onRefresh={onRefresh}
                refreshing={false}
                ListEmptyComponent={() => {
                    return (
                        <View style={{ width: '100%', minHeight: 250, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: '#777777', fontWeight: '600', textAlign: 'center' }}>{'There is no suggestion now\n\nPlease try to change your interest to see more suggestions!'}</Text>
                        </View>
                    )
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
});

export default ExploreScreen;
