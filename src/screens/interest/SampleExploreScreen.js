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
import { sampleProfileViewAtom } from '../../actions/global';
import NavigationService from '@/utils/NavigationService'

const ITEM_WIDTH = Platform.isPad ? Dimensions.get('screen').width / 4 - 20 : Dimensions.get('screen').width / 2 - 24;

const SampleExploreScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [suggestions, setSuggestions] = useState([])
    const [isFetching, setFetching] = useState(false)
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        onRefresh()
    }, [])

    const onRefresh = () => {
        apiClient.get('matches/sample-explore')
            .then((res) => {
                setFetching(false)
                console.log({ res: res.data })
                if (res && res.data && res.data.success) {
                    setSuggestions(res.data.data)
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

    const openProfile = (item) => {
        if(counter >= 4) {
            NavigationService.reset('RegisterSuggestionScreen')
        } else {
            navigation.push('SampleProfileScreen', { profile: item })
        }
        setCounter((old) => old + 1)
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
            <DynamicLikeItem key={`profile-${item.id}`} onPress={() => openProfile(item)} item={item} itemWidth={ITEM_WIDTH} />
        );
    };

    const renderHeader = () => {
        return (
            <View style={{ paddingVertical: 10, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>Explore</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header
                showLogo
            />
            <FlatList
                data={isFetching ? [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }] : suggestions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={Platform.isPad ? 4 : 2}
                style={{ flex: 1, paddingHorizontal: 8 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                onRefresh={onRefresh}
                refreshing={false}
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

export default SampleExploreScreen;
