import React, { useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './Text'
import { getUnit } from '@/utils/utils'
import { Image } from 'expo-image'
import images from '../utils/images'
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message'
import Share from 'react-native-share'

const ShareModal = ({ visible = false, onClose, full_name = '', shareLink = '' }) => {
    const [copied, setCopied] = useState(false)
    const [success, setSuccess] = useState(false)

    const onShare = async () => {
        try {
            const result = await Share.open({
                url: shareLink
            })

            setSuccess(result.success)
        } catch (error) {

        }
    }

    const onCopy = async () => {
        await Clipboard.setStringAsync(shareLink);
        // Toast.show({text1: 'Link copied', type: 'success'})
        setCopied(true)
    }

    const singleShare = async (type) => {
        try {
            const shareOptions = {
                url: shareLink,
                social: type,
            };

            const result = await Share.shareSingle(shareOptions);
            setSuccess(result.success)
        } catch (error) {

        }
    }

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => onClose && onClose()}>
            <View style={styles.overlay}>
                {!success &&
                    <View style={styles.alertContainer}>
                        <Text style={styles.title}>{`${full_name}'s profile`}</Text>
                        <Text style={styles.message}>Share this profile with someone who might find it helpful or benefit from being connected</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity onPress={() => singleShare(Share.Social.INSTAGRAM)}>
                                    <Image source={images.share_instagram} style={styles.socialIcon} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={styles.socialText}>Instagram</Text>
                            </View>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity onPress={() => singleShare(Share.Social.TWITTER)}>
                                    <Image source={images.share_twitter} style={styles.socialIcon} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={styles.socialText}>X</Text>
                            </View>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity onPress={() => singleShare(Share.Social.FACEBOOK)}>
                                    <Image source={images.share_facebook} style={styles.socialIcon} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={styles.socialText}>Facebook</Text>
                            </View>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity onPress={() => singleShare(Share.Social.WHATSAPP)}>
                                    <Image source={images.share_whatsapp} style={styles.socialIcon} contentFit='contain' />
                                </TouchableOpacity>
                                <Text style={styles.socialText}>Whatsapp</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={onCopy} style={{ paddingHorizontal: 16, width: '100%', maxWidth: 300, borderRadius: 10, backgroundColor: '#B5ABE2', height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#333333', fontSize: 16, fontWeight: 'bold', flex: 1 }}>{copied ? 'Link copied' : 'Copy link'}</Text>
                            <Image source={images.link_icon} style={{ width: 22, height: 22 }} contentFit='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => onShare()} style={styles.button}>
                            <Text style={styles.buttonText}>{'Share Profile'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onClose && onClose()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={images.close_icon} style={styles.closeIcon} contentFit='contain' />
                        </TouchableOpacity>
                    </View>
                }
                {success &&
                    <View style={[styles.alertContainer, { gap: 16 }]}>
                        <Image source={images.shared_icon} style={{ width: 50, height: 50 }} contentFit='contain' />
                        <Text style={styles.title}>{`Profile successfully shared!`}</Text>
                        <Text style={{ fontSize: 16, textAlign: 'center', color: '#f5f5f5', fontWeight: 'bold', lineHeight: 22 }}>{`You've shared the profile. \nWhy not pass it along to a few more friends who might find it useful?`}</Text>

                        <TouchableOpacity onPress={() => setSuccess(false)} style={styles.button}>
                            <Text style={styles.buttonText}>{'Share with More Friends'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onClose && onClose()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Image source={images.close_icon} style={styles.closeIcon} contentFit='contain' />
                        </TouchableOpacity>
                    </View>
                }
            </View>

        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: 320,
        paddingHorizontal: 24,
        paddingVertical: 32,
        backgroundColor: '#725ED4',
        borderRadius: 10,
        alignItems: 'center',
        gap: 10
    },
    title: {
        fontSize: 20, fontWeight: 'bold',
        color: '#E8FF58', textAlign: 'center'
    },
    message: {
        fontSize: 14, color: '#f5f5f5',
        lineHeight: 20,
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        padding: 10,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#E8FF58',
        height: 50, borderRadius: 25,
        justifyContent: 'center',
        marginTop: 32
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    closeButton: {
        position: 'absolute',
        top: 0, right: 0,
        width: 25, height: 25, alignItems: 'center',
        justifyContent: 'center'
    },
    closeIcon: {
        width: 15, height: 15
    },
    cancelButton: {
        padding: 8,
    },
    cancelText: {
        fontSize: 14, color: 'white',
        fontWeight: 'bold'
    },
    socialContainer: {
        gap: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8
    },
    socialIcon: { width: 60, height: 60 },
    socialText: {
        fontSize: 10, color: '#f5f5f5'
    }
})

export default ShareModal