import React from 'react'
import {
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native'

const LoadingView = () => {
    return(
        <View style={styles.container}>
            <ActivityIndicator size='large' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000055',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default LoadingView