import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar } from 'expo-status-bar'
import dayjs from 'dayjs'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import { capitalize, getAuthenScreen } from '@/utils/utils'
import DoubleSwitch from '@/components/DoubleSwitch'
import SwitchWithText from '@/components/SwitchWithText'
import apiClient from '@/utils/apiClient'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { useAtom } from 'jotai'
import { userAtom } from '@/actions/global'
import analytics from '@react-native-firebase/analytics'
import { FontAwesome6 } from '@expo/vector-icons'
import { DEFAULT_DISLIKES, DEFAULT_LIKES, DEFAULT_PURPOSES } from '../../utils/utils'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 24
    },
    itemContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        height: 45, borderRadius: 15,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        flexDirection: 'row',
        paddingHorizontal: 22,
        width: '100%'
    },
    closeButton: {
        width: 30, height: 30, backgroundColor: '#333333',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 15,
        position: 'absolute', top: 8, right: 8
    }
})

const MatchingInfoUpdateScreen = ({ navigation, route }) => {
    const { canClose } = route && route.params ? route.params : {}
    const insets = useSafeAreaInsets()
    const [purposes, setPurposes] = useState([])
    const [likes, setLikes] = useState([])
    const [dislikes, setDislikes] = useState([])
    const [loading, setLoading] = useState(false)

    const [allPurposes, setAllPurposes] = useState(DEFAULT_PURPOSES);
    const [allLikes, setAllLikes] = useState(DEFAULT_LIKES);
    const [allDislikes, setAllDislikes] = useState(DEFAULT_DISLIKES);

    useEffect(() => {
        analytics().logScreenView({
            screen_name: 'MatchingInfoUpdateScreen',
            screen_class: 'MatchingInfoUpdateScreen'
        })
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
        // try {
        //     setLoading(true)
        //     apiClient.post('users/update', { publicPronouns: isPublic, pronouns })
        //         .then((res) => {
        //             console.log({ res })
        //             setLoading(false)
        //             if (res && res.data && res.data.success) {
        //                 setUser(res.data.data)
        //                 NavigationService.reset('AIMatchingScreen')
        //             } else {
        //                 Toast.show({ text1: res.data.message, type: 'error' })
        //             }
        //         })
        //         .catch((error) => {
        //             console.log({ error })
        //             setLoading(false)
        //             Toast.show({ text1: error, type: 'error' })
        //         })
        // } catch (error) {
        //     setLoading(false)
        // }

        setLoading(true)
        const updatePurposeRequest = await apiClient.post('interests/update-purposes', { purposes: purposes })
        const updateLikesRequest = await apiClient.post('interests/update-likes', { likes: likes })
        const updateDislikesRequest = await apiClient.post('interests/update-dislikes', { dislikes: dislikes })

        setLoading(false)
        if (updatePurposeRequest && updatePurposeRequest.data && updatePurposeRequest.data.success &&
            updateLikesRequest && updateLikesRequest.data && updateLikesRequest.data.success &&
            updateDislikesRequest && updateDislikesRequest.data && updateDislikesRequest.data.success
        ) {
            NavigationService.reset('AIMatchingScreen')
        } else {
            Toast.show({ text1: 'Your request failed. Please try again!', type: 'error' })
        }
    }

    const onSelectPurpose = async () => {
        const options = allPurposes.map((item) => {
            return {
                id: item,
                text: item,
            };
        });

        purposes.forEach(purpose => {
            if (!allPurposes.includes(purpose)) {
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
            if (!allLikes.includes(like)) {
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
            if (!allDislikes.includes(dislike)) {
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
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 }]}>
            <StatusBar translucent style='dark' />
            <View style={{ flex: 1, gap: 16, width: Platform.isPad ? 600 : '100%', alignSelf: 'center' }}>
                <Image source={images.logo_icon} style={{ width: 40, height: 40, marginBottom: 8 }} contentFit='contain' />
                <Text style={{ fontSize: 24, lineHeight: 40, maxWidth: '80%', fontWeight: 'bold', color: 'black' }}>{`Let’s complete your profile!`}</Text>
                <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false}>
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
                </ScrollView>
            </View>

            <TouchableOpacity style={{
                position: 'absolute', top: insets.top + 5, right: 16,
                width: 25, height: 25, alignItems: 'center', justifyContent: 'center'
            }}
                onPress={() => {
                    if (canClose)
                        navigation.goBack()
                    else
                        NavigationService.push('SkipOnboardingScreen')
                }}>
                <FontAwesome6 name='xmark' size={20} color='#333333' />
            </TouchableOpacity>
            <ButtonWithLoading
                text={'Save & Continue'}
                onPress={onContinue}
                disabled={purposes.length === 0 || likes.length === 0}
                loading={loading}
            />
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}
                    onPress={() => NavigationService.reset('OnboardingVideoTutorialScreen')}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>Record a video instead</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default MatchingInfoUpdateScreen