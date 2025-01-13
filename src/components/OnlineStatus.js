import React from 'react'
import { View } from 'react-native';

const OnlineStatus = ({ status = 'offline', isRecentOnline, radius = 12 }) => {

    if (status?.toLowerCase() === 'offline' || !isRecentOnline) return null

    if (status?.toLowerCase() === 'away') {
        return (
            <View style={{
                width: radius, height: radius, borderRadius: radius / 2,
                backgroundColor: '#FFD32230',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <View style={{
                    width: radius / 2,
                    height: radius / 2,
                    borderRadius: radius / 4,
                    backgroundColor: '#FFD322',
                }} />
            </View>
            
        )
    } else {
        return (
            <View style={{
                width: radius, height: radius, borderRadius: radius / 2,
                backgroundColor: '#5BFF5830',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <View style={{
                    width: radius / 2,
                    height: radius / 2,
                    borderRadius: radius / 4,
                    backgroundColor: '#2EE62A',
                }} />
            </View>
        )
    }
}

export default OnlineStatus;