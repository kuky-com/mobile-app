import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import { Image } from 'expo-image'
import React from 'react'
import { Linking, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F3'
    },
    inputContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center'
    }
})

const UpdateProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()

    const moreAction = async () => {
        const options = [
            {text: 'Update Password'}
        ]
      
          await SheetManager.show('action-sheets', {
            payload: {
              actions: options,
              onPress(index) {
                if(index === 0) {
                    navigation.push('UpdatePasswordScreen')
                }
              },
            },
          });
    }

    return (
        <View style={styles.container}>
            <View style={{ zIndex: 2, gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top + 16, width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.back_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={moreAction} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.more_icon} style={{ width: 25, height: 25 }} contentFit='contain' />
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Account Information</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', marginTop: -40, paddingTop: 40 }}>
                <KeyboardAwareScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                    <View style={{ flex: 1, gap: 16 }}>
                        <Text style={{ fontSize: 14, color: '#646464' }}>Edit your name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={{ fontSize: 16, fontWeight: '500', color: 'black', fontWeight: 'bold', padding: 16, width: '100%', fontFamily: 'Comfortaa-Bold' }}
                                underlineColorAndroid='#000000'
                                placeholder='Your first & last name'
                            />
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: insets.bottom + 20, }}>
                    <TouchableOpacity style={{ width: '100%', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#333333' }}>
                        <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default UpdateProfileScreen