import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, DeviceEventEmitter, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DynamicLikeItem from '@/components/DynamicLikeItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/utils/apiClient';
import images from '@/utils/images';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import constants from '@/utils/constants';
import { useAtom } from 'jotai';
import { notiCounterAtom } from '@/actions/global';
import colors from '@/utils/colors';
import analytics from '@react-native-firebase/analytics'

const ITEM_WIDTH = Platform.isPad ? Dimensions.get('window').width / 4 - 20 : Dimensions.get('window').width / 2 - 24;
const PAGE_SIZE = 8

const ExploreScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [suggestions, setSuggestions] = useState([])
    const [notSuggestions, setNotSuggestions] = useState([])
    const [isFetching, setFetching] = useState(false)
    const [notiCounter, setNotiCounter] = useAtom(notiCounterAtom)
    const [page, setPage] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)
    const [canLoadMore, setCanLoadMore] = useState(true)

    const [itemWidth, setItemWidth] = useState(ITEM_WIDTH)

    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
        setItemWidth(Platform.isPad ? width / 4 - 20 : width / 2 - 24)
    });

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'ExploreScreen',
            screen_class: 'ExploreScreen'
        })
    }, [])

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

    useEffect(() => {
        if (page === 1) {
            if (!isFetching) {
                setFetching(true)
                apiClient.post('matches/best-matches', { page: 1, limit: PAGE_SIZE })
                    .then((res) => {
                        setFetching(false)
                        console.log({ res: res.data })
                        if (res && res.data && res.data.success) {
                            setSuggestions(res.data.data)

                            if (res.data.data.length < PAGE_SIZE) {
                                onLoadNotSuggestion()
                                setCanLoadMore(false)
                            }
                        } else {
                            setSuggestions([])
                            setCanLoadMore(false)
                        }
                    })
                    .catch((error) => {
                        setFetching(false)
                        console.log({ error })
                        setSuggestions([])
                        setCanLoadMore(false)
                    })
            }
        } else if (page > 1) {
            if (!isFetching && !loadingMore && canLoadMore) {
                setLoadingMore(true)
                apiClient.post('matches/best-matches', { page: page, limit: PAGE_SIZE })
                    .then((res) => {
                        setLoadingMore(false)
                        console.log({ res: res.data })
                        if (res && res.data && res.data.success) {
                            setSuggestions((old) => [...old, ...res.data.data])

                            if (res.data.data.length < PAGE_SIZE) {
                                onLoadNotSuggestion()
                                setCanLoadMore(false)
                            }
                        } else {
                            setCanLoadMore(false)
                        }
                    })
                    .catch((error) => {
                        setLoadingMore(false)
                        console.log({ error })
                        setCanLoadMore(false)
                    })
            }

        }
    }, [page])

    const onRefresh = () => {
        setPage(0)
        setTimeout(() => {
            setPage(1)
            setCanLoadMore(true)
            setLoadingMore(false)
        }, 500);
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

    const onLoadMore = () => {
        if (!loadingMore && canLoadMore) {
            setPage(old => old + 1)
        }
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
                            width={itemWidth} height={itemWidth + 40}
                            backgroundColor='blue'
                            style={{
                                backgroundColor: 'blue', borderRadius: 20, paddingVertical: 16
                            }}>
                            <SkeletonPlaceholder.Item right={8} width={itemWidth / 2} height={20} borderRadius={10} />
                            <SkeletonPlaceholder.Item right={20} width={itemWidth - 40} height={20} borderRadius={10} />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>
                </View>

            )
        }
        return (
            <DynamicLikeItem key={`profile-${item.id}`} onPress={() => openProfile(item)} item={item} itemWidth={itemWidth} />
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
        if (loadingMore) {
            return (
                <View style={{ marginBottom: insets.bottom + 80, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <ActivityIndicator size='small' color={colors.mainColor} />
                </View>
            )
        }
        if (notSuggestions.length > 0) {
            return (
                <View style={{ marginBottom: insets.bottom + 80 }}>
                    <Text style={{ padding: 16, fontSize: 12, color: '#aaaaaa', fontWeight: 'bold', textAlign: "center" }}>It looks like we’ve shown you all the best matches for now. But don’t worry, here are some other interesting users you might want to check out!</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {notSuggestions.map((item) => {
                            return (
                                <DynamicLikeItem key={`notsuggestion-${item.id}`} onPress={() => openProfile(item)} item={item} itemWidth={itemWidth} />
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
                onEndReached={onLoadMore}
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
