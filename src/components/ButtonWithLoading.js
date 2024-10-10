import React from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import Text from './Text'

const ButtonWithLoading = ({ text, onPress, loading = false, disabled = false, style = {} }) => {

    return (
        <TouchableOpacity
            onPress={() => onPress && onPress()}
            disabled={disabled || loading}
            style={[{
                width: '100%',
                height: 60, borderRadius: 30,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: disabled ? '#9A9A9A' : '#333333',
                gap: 8,
                flexDirection: 'row'
            }, style]}
        >
            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{text}</Text>
            {loading && <ActivityIndicator color='white' size='small' />}
        </TouchableOpacity>
    )
}

export default ButtonWithLoading