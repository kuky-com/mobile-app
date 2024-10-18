import React from 'react'
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native'
import Text from './Text'
import { getUnit } from '@/utils/utils'

const ButtonWithLoading = ({ text = {}, textStyle = {}, onPress, loading = false, disabled = false, style = {} }) => {

    return (
        <TouchableOpacity
            onPress={() => onPress && onPress()}
            disabled={!!disabled || !!loading}
            style={[{
                width: Platform.isPad ? 600 : '100%', alignSelf: 'center',
                height: getUnit(60), borderRadius: getUnit(30),
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: disabled ? '#9A9A9A' : '#333333',
                gap: getUnit(8),
                flexDirection: 'row'
            }, style]}
        >
            <Text style={[{ fontSize: getUnit(18), fontWeight: '700', color: 'white' }, textStyle]}>{text}</Text>
            {loading && <ActivityIndicator color='white' size='small' />}
        </TouchableOpacity>
    )
}

export default ButtonWithLoading