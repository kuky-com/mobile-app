import { userAtom } from '@/actions/global'
import Text from '@/components/Text'
import images from '@/utils/images'
import NavigationService from '@/utils/NavigationService'
import dayjs from 'dayjs'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useAtomValue } from 'jotai'
import React, { useState } from 'react'
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        elevation: 1,
        shadowColor: '#000000',
        flexDirection: 'row',
        paddingVertical: 20, paddingHorizontal: 16, gap: 10, backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center'
    }
})

const ProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const [mode, setMode] = useState('view') //view, edit
    const currentUser = useAtomValue(userAtom)

    return (
        <View style={styles.container}>
            <StatusBar translucent style='dark' />
            <View style={{ gap: 8, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#725ED4', paddingHorizontal: 16, paddingBottom: 24, paddingTop: insets.top, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ height: 30, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>

                </View>
                <View style={{ paddingVertical: 12, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{`${currentUser?.full_name}`}</Text>
                </View>
                <View style={{ height: 30, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setMode('edit')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'edit' ? '#E8FF58' : 'transparent', height: 30, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: mode === 'edit' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setMode('view')} style={{ borderBottomWidth: 1, borderBottomColor: mode === 'view' ? '#E8FF58' : 'transparent', height: 30, alignItems: 'center', width: 50, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: mode === 'view' ? '#E8FF58' : 'rgba(232, 255, 88, 0.5)' }}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 24 }}>
                    <View style={{ flex: 1, gap: 16, marginBottom: insets.bottom + 120 }}>
                        
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default ProfileScreen