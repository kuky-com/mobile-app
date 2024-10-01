import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#725ED4',
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24
    }
})

const InterestSelectScreen = ({ navigation, route }) => {
    const { onboarding } = route.params
    const insets = useSafeAreaInsets()
    const [keyword, setKeyword] = useState('')
    const [tags, setTags] = useState([])

    const onAddNewTag = () => {
        if (keyword.length > 3) {
            if (!tags.includes(keyword)) {
                setTags((old) => [...old, keyword])
                setKeyword('')
            }
        }
    }

    const onRemove = (index) => {
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    const onSave = () => {
        NavigationService.reset('Dashboard')
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}>
            <StatusBar translucent style='dark' />
            {
                !onboarding &&
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 16, top: insets.top + 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back_icon_no_border} style={{ width: 25, height: 25 }} contentFit='contain' />
                </TouchableOpacity>
            }
            <View style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Image source={images.interest_icon} style={{ width: 20, height: 20 }} contentFit='contain' />
                <Text style={{ color: '#E8FF58', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Interests and hobbies</Text>
            </View>
            <Text style={{ color: '#F5F5F5', fontSize: 18, textAlign: 'center', lineHeight: 25, paddingHorizontal: 20 }}>Add interests to your profile to help you match with people who love them too.</Text>
            <View style={{ width: '100%', gap: 8, flexDirection: 'row', backgroundColor: 'white', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                <Image source={images.search_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                <TextInput
                    style={{ fontSize: 18, fontWeight: '600', flex: 1, padding: 8, color: 'black' }}
                    underlineColorAndroid='#00000000'
                    placeholder='What are you into?'
                    placeholderTextColor='#9a9a9a'
                    value={keyword}
                    onChangeText={setKeyword}
                    onSubmitEditing={onAddNewTag}
                    maxLength={50}
                />
                {
                    keyword.length > 3 &&
                        <TouchableOpacity onPress={onAddNewTag} style={{width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={images.plus_icon} style={{width: 20, height: 20, tintColor: '#725ED4'}} contentFit='contain'/>
                        </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 1, width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, flexDirection: 'row' }}>
                {
                    tags.map((item, index) => {
                        return (
                            <View key={`tags-${index}`} style={{ paddingHorizontal: 12, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: '#F2F0FF' }}>
                                <Image source={images.category_icon} style={{ width: 15, height: 15, tintColor: 'black' }} contentFit='contain' />
                                <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{item}</Text>
                                <TouchableOpacity onPress={() => onRemove(index)} style={{width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FF58', borderWidth: 1, borderColor: '#333333'}}>
                                    <Image source={images.close_icon} style={{width: 10, height: 10, tintColor: '#333333'}} contentFit='contain' />
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }
            </View>
            <TouchableOpacity onPress={onSave} disabled={tags.length === 0} style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: tags.length === 0 ? '#9A9A9A' : '#333333', }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Save</Text>
            </TouchableOpacity>
        </View>
    )
}

export default InterestSelectScreen