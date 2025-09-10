import React, { memo, useMemo } from 'react'
import { View } from 'react-native';
import Text from './Text';

const OnlineStatus = memo(({ status = 'offline', isRecentOnline }) => {
    const statusComponent = useMemo(() => {
        if (status?.toLowerCase() === 'offline' || !isRecentOnline) {
            return (
                <View style={{ backgroundColor: '#A7A7A7', height: 14, borderRadius: 7, paddingHorizontal: 8, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: 'black' }}>Offline</Text>
                </View>
            )
        }

        if (status?.toLowerCase() === 'away') {
            return (
                <View style={{ backgroundColor: '#FFD322', height: 14, borderRadius: 7, paddingHorizontal: 8, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: 'black' }}>Away</Text>
                </View>
            )
        } else {
            return (
                <View style={{ backgroundColor: '#2EE62A', height: 14, borderRadius: 7, paddingHorizontal: 8, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: 'black' }}>Active</Text>
                </View>
            )
        }
    }, [status, isRecentOnline]);

    return statusComponent;
});

OnlineStatus.displayName = 'OnlineStatus';

// const OnlineStatus = ({ status = 'offline', isRecentOnline, radius = 12 }) => {

//     if (status?.toLowerCase() === 'offline' || !isRecentOnline) return null

//     if (status?.toLowerCase() === 'away') {
//         return (
//             <View style={{
//                 width: radius, height: radius, borderRadius: radius / 2,
//                 backgroundColor: '#FFD32230',
//                 alignItems: 'center', justifyContent: 'center',
//             }}>
//                 <View style={{
//                     width: radius / 2,
//                     height: radius / 2,
//                     borderRadius: radius / 4,
//                     backgroundColor: '#FFD322',
//                 }} />
//             </View>

//         )
//     } else {
//         return (
//             <View style={{
//                 width: radius, height: radius, borderRadius: radius / 2,
//                 backgroundColor: '#5BFF5830',
//                 alignItems: 'center', justifyContent: 'center',
//             }}>
//                 <View style={{
//                     width: radius / 2,
//                     height: radius / 2,
//                     borderRadius: radius / 4,
//                     backgroundColor: '#2EE62A',
//                 }} />
//             </View>
//         )
//     }
// }

export default OnlineStatus;
