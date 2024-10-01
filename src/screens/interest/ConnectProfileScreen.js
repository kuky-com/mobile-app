import { Header } from '@/components/Header'
import Text from '@/components/Text'
import images from '@/utils/images'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tagContainer: {
        backgroundColor: '#7B65E8',
        height: 30, borderRadius: 15,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tagText: {
        color: '#E8FF58',
        fontSize: 15,
        fontWeight: 'bold',
    },
    nameBackground: {
        position: 'absolute',
        height: '50%', left: 0, right: 0, bottom: 0,
        borderRadius: 10
    }
})

const ConnectProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { profile } = route.params

    const likeAction = () => {
        Toast.show({
            type: 'sent',
            position: 'top',
            text1: 'Connection Sent!',
            text2: `Your invitation to connect has been sent to ${profile.name}.`,
            visibilityTime: 3000,
            autoHide: true,
          });
    }

    const rejectAction = () => {
        Toast.show({
            type: 'deny',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
          });
    }

    const moreAction = async () => {
        const options = [
            {text: 'Block Users', image: images.delete_icon}
        ]
      
          await SheetManager.show('action-sheets', {
            payload: {
              actions: options,
              onPress(index) {
                if(index === 0) {
                    
                }
              },
            },
          });
    }

    return (
        <View style={[styles.container]}>
            <Header 
                showLogo 
                leftIcon={images.back_icon} 
                leftAction={() => navigation.goBack()}
                rightIcon={images.more_icon}
                rightAction={moreAction}    
                rightIconColor='black'
            />
            <View style={{ flex: 1, margin: 16, marginBottom: insets.bottom + 16, borderWidth: 8, borderColor: 'white', borderRadius: 15 }}>
                <Image source={{ uri: profile.image }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10 }} contentFit='fill' />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.79)']}
                    style={styles.nameBackground}
                />
                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: '100%', alignItems: 'flex-end', padding: 16 }}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>{profile.category}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 25, paddingHorizontal: 16, gap: 16 }}>
                        <Text style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>{profile.name}</Text>
                        <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: 'rgba(123, 101,232,0.5)'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Art & Crafts</Text>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: 'rgba(123, 101,232,0.5)'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Cooking</Text>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: 'rgba(123, 101,232,0.5)'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Yoga</Text>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: 'rgba(123, 101,232,0.5)'}}>
                                <Image source={images.category_icon} style={{width: 16, height: 16}} contentFit='contain'/>
                                <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>Music</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 32, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 9 }}>
                            <View style={{ alignItems: 'center', gap: 13 }}>
                                <TouchableOpacity onPress={rejectAction} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#6C6C6C', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.close_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={{ color: '#949494', fontSize: 12, fontWeight: 'bold' }}>Pass</Text>
                            </View>
                            <View style={{ alignItems: 'center', gap: 13 }}>
                                <TouchableOpacity onPress={likeAction} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#6C6C6C', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={images.like_icon} style={{ width: 15, height: 15, tintColor: '#E8FF58' }} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={{ color: '#949494', fontSize: 12, fontWeight: 'bold' }}>Connect</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ConnectProfileScreen