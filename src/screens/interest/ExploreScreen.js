import { Header } from '@/components/Header';
import Text from '@/components/Text';
import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, DeviceEventEmitter, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DynamicLikeItem from '@/components/DynamicLikeItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/utils/apiClient';
import images from '@/utils/images';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import constants from '@/utils/constants';
import { useAtom, useAtomValue } from 'jotai';
import { notiCounterAtom } from '@/actions/global';
import colors from '@/utils/colors';
import analytics from '@react-native-firebase/analytics'
import { FontAwesome6 } from '@expo/vector-icons';
import { userAtom } from '../../actions/global';
import { SheetManager } from 'react-native-actions-sheet';
import { naturalJoin } from '../../utils/utils';

const ITEM_WIDTH = Dimensions.get('window').width > 600 ? Dimensions.get('window').width / 2 - 60 : Dimensions.get('window').width - 50;
const PAGE_SIZE = 8

const ExploreScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [suggestions, setSuggestions] = useState([])
    // const [notSuggestions, setNotSuggestions] = useState([])
    const [isFetching, setFetching] = useState(false)
    const [notiCounter, setNotiCounter] = useAtom(notiCounterAtom)
    const currentUser = useAtomValue(userAtom)
    const [page, setPage] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)
    const [canLoadMore, setCanLoadMore] = useState(true)

    const [journeys, setJourneys] = useState([])
    // const [selectedJourney, setSelectedJourney] = useState(currentUser?.journey ? currentUser?.journey : null)
    const [selectedJourney, setSelectedJourney] = useState()

    const [itemWidth, setItemWidth] = useState(ITEM_WIDTH)

    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
        setItemWidth(width > 600 ? width / 2 - 60 : width - 50)
    });

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'ExploreScreen',
            screen_class: 'ExploreScreen'
        })
    }, [])

    const loadJourneys = () => {
        apiClient.get(`journeys/active-journeys`)
            .then((res) => {
                console.log({ res: res.data })
                if (res && res.data && res.data.success) {
                    setJourneys(res.data.data)
                    // let isActiveJourney = false
                    // res.data.data.forEach(element => {
                    //     if(currentUser?.journey && element.id === currentUser?.journey?.id) {
                    //         isActiveJourney = true
                    //     }
                    // });

                    // if(!isActiveJourney && selectedJourney && currentUser?.journey && selectedJourney.id === currentUser?.journey?.id) {
                    //     setSelectedJourney(null)
                    // }
                }
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const changeJourney = async () => {

        const options = journeys.map((item) => ({ text: item.name, value: item }))
        options.unshift({ text: 'All journeys', value: null })

        await SheetManager.show('action-sheets', {
            payload: {
                actions: options,
                onPress(index) {
                    setSelectedJourney(options[index].value)
                },
            },
        });
    }

    console.log({selectedJourney})

    useEffect(() => {
        let eventListener = DeviceEventEmitter.addListener(constants.REFRESH_SUGGESTIONS, event => {
            onRefresh()
        });

        return () => {
            eventListener.remove();
        };
    }, [])

    useEffect(() => {
        const query = selectedJourney ? `journey_id=${selectedJourney?.id}&` : ''
        if (page === 1) {
            if (!isFetching) {
                setFetching(true)
                apiClient.get(`matches/match-by-journey?${query}offset=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`)
                    .then((res) => {
                        setFetching(false)
                        console.log({ res: res.data })
                        if (res && res.data && res.data.success) {
                            setSuggestions(res.data.data)

                            if (res.data.data.length < PAGE_SIZE) {
                                // onLoadNotSuggestion()
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
                apiClient.get(`matches/match-by-journey?${query}offset=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`)
                    .then((res) => {
                        setLoadingMore(false)
                        console.log({ res: res.data })
                        if (res && res.data && res.data.success) {
                            setSuggestions((old) => [...old, ...res.data.data])

                            if (res.data.data.length < PAGE_SIZE) {
                                // onLoadNotSuggestion()
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

    const loadMatches = () => {
        setPage(0)
        setTimeout(() => {
            setPage(1)
            setCanLoadMore(true)
            setLoadingMore(false)
        }, 500);
    }

    const onRefresh = () => {
        loadMatches()
        loadJourneys()
    }

    useEffect(() => {
        loadJourneys()
    }, [])

    useEffect(() => {
        loadMatches()
    }, [selectedJourney])

    // const onLoadNotSuggestion = () => {
    //     apiClient.get('matches/less-matches')
    //         .then((res) => {
    //             console.log({ res: res.data })
    //             if (res && res.data && res.data.success) {
    //                 setNotSuggestions(res.data.data)
    //             } else {
    //                 setNotSuggestions([])
    //             }
    //         })
    //         .catch((error) => {
    //             console.log({ error })
    //             setNotSuggestions([])
    //         })
    // }

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

    const openNotification = () => {
        navigation.push('NotificationListScreen')
    }

    const completeProfile = () => {
        navigation.push('AskUpdateInfoScreen')
    }

    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={{ marginBottom: insets.bottom + 80, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <ActivityIndicator size='small' color={colors.mainColor} />
                </View>
            )
        } else {
            return (
                <View style={{ height: insets.bottom + 80 }}></View>
            )
        }
        // if (notSuggestions.length > 0) {
        //     return (
        //         <View style={{ marginBottom: insets.bottom + 80 }}>
        //             <Text style={{ padding: 16, fontSize: 12, color: '#aaaaaa', fontWeight: 'bold', textAlign: "center" }}>It looks like we’ve shown you all the best matches for now. But don’t worry, here are some other interesting users you might want to check out!</Text>
        //             <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        //                 {notSuggestions.map((item) => {
        //                     return (
        //                         <DynamicLikeItem key={`notsuggestion-${item.id}`} onPress={() => openProfile(item)} item={item} itemWidth={itemWidth} />
        //                     )
        //                 })}
        //             </View>
        //         </View>
        //     )
        // } else {
        //     return (
        //         <View style={{ height: insets.bottom + 80 }}></View>
        //     )
        // }
    }

    let missingInfos = []

    if ((currentUser?.likeCount ?? 0) === 0) {
        missingInfos.push('interest')
    }

    if (!currentUser?.birthday) {
        missingInfos.push('birthday')
    }

    if (!currentUser?.gender) {
        missingInfos.push('gender')
    }

    if (!currentUser?.pronouns) {
        missingInfos.push('pronouns')
    }

    if (!currentUser?.location) {
        missingInfos.push('location')
    }

    return (
        <View style={styles.container}>
            <Header
                showLogo
                rightIcon={images.notification_icon}
                rightAction={openNotification}
                rightCounter={notiCounter}
            />
            {
                (!currentUser?.birthday || !currentUser?.gender || !currentUser?.pronouns || !currentUser?.location || ((currentUser?.likeCount ?? 0) === 0)) &&
                <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 8 }}>
                    <TouchableOpacity onPress={completeProfile} style={{ borderRadius: 15, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", }}>
                        <View style={{ flex: 1, gap: 5 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>Complete your profile!</Text>
                            <Text style={{ lineHeight: 18, color: '#F1F1F3', fontSize: 12, fontWeight: '500' }}>{`Add ${naturalJoin(missingInfos)} to personalise your experience.`}</Text>
                        </View>
                        <View style={{ width: 38, height: 26, borderRadius: 13, backgroundColor: '#E8FF58', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome6 name='arrow-right' size={16} color={'#725ED4'} />
                        </View>
                    </TouchableOpacity>
                </View>
            }
            <View style={{
                paddingVertical: 10, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>Explore</Text>

                <TouchableOpacity onPress={changeJourney} style={{
                    paddingHorizontal: 16, height: 30, width: '50%', borderRadius: 15,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CDB8E2'
                }}>
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, color: 'black', fontWeight: 'bold' }}>{selectedJourney ? selectedJourney.name : 'All Journeys'}</Text>
                    <FontAwesome6 name='chevron-down' size={15} color='black' />
                </TouchableOpacity>
            </View>
            <FlatList
                data={isFetching ? [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }] : suggestions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={Dimensions.get('screen').width > 600 ? 2 : 1}
                style={{ flex: 1, paddingHorizontal: 16 }}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                onEndReached={onLoadMore}
                onRefresh={onRefresh}
                refreshing={false}
                ListEmptyComponent={() => {
                    return (
                        <View style={{ width: '100%', minHeight: 250, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <Text style={{ fontSize: 14, color: '#777777', fontWeight: '600', textAlign: 'center' }}>{'Would you like to see people on other journeys?'}</Text>
                            <TouchableOpacity onPress={changeJourney} style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                                borderRadius: 5, paddingHorizontal: 16, height: 30, alignItems: 'center', backgroundColor: colors.mainColor,
                                justifyContent: 'center'
                            }}>
                                <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>Explore Now</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
});

export default ExploreScreen;
