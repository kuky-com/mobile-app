import React, { useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Image,
    Keyboard
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import apiClient from '@/utils/apiClient';
import Toast from 'react-native-toast-message';
import colors from '@/utils/colors';
import ButtonWithLoading from '../../components/ButtonWithLoading';
import { Header } from '../../components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../utils/images';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';

const InviteFriendScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [inviteList, setInviteList] = useState([]);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const emailRef = useRef(null);

    const validateEmail = (email) => {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const addToInviteList = () => {
        Keyboard.dismiss()
        if (!name.trim() || !email.trim()) {
            Toast.show({
                text1: 'Please enter both name and email',
                type: 'error'
            });
            return;
        }

        if (!validateEmail(email)) {
            Toast.show({
                text1: 'Please enter a valid email address',
                type: 'error'
            });
            return;
        }

        if (inviteList.find(item => item.email === email)) {
            Toast.show({
                text1: 'This email has already been added',
                type: 'error'
            });
            return;
        }

        setInviteList([...inviteList, { name: name.trim(), email: email.trim() }]);
        setName('');
        setEmail('');
    };

    const removeFromList = (email) => {
        setInviteList(inviteList.filter(item => item.email !== email));
    };

    const sendInvitations = async () => {
        if (inviteList.length === 0) {
            Toast.show({
                text1: 'Please add at least one friend to invite',
                type: 'error'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('users/send-user-invitation', {
                recipients: inviteList
            });

            if (response.data.success) {
                Toast.show({
                    text1: 'Invitations sent successfully!',
                    type: 'success'
                });
                setInviteList([]);
            } else {
                Toast.show({
                    text1: response.data.message || 'Failed to send invitations',
                    type: 'error'
                });
            }
        } catch (error) {
            console.log({ error });
            Toast.show({
                text1: 'Failed to send invitations',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderBottomWidth: 0.2,
                borderBottomColor: '#787879',
                paddingTop: insets.top
            }}>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        left: 0,
                        padding: 16,
                        paddingTop: insets.top
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={images.back_icon}
                        style={{ width: 24, height: 24 }}
                        contentFit="contain"
                    />
                </TouchableOpacity>

                <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#333333'
                }}>
                    Invite Your Friends
                </Text>
            </View>
            <View style={{ paddingHorizontal: 16, flex: 1, paddingTop: 16 }}>
                <View style={{ marginBottom: 8, borderBottomWidth: 0.2, borderBottomColor: '#787879', paddingBottom: 8, width: '100%' }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#333333', lineHeight: 20, }}>{`Share your journey with someone who matters.\nInvite a friend to join you on Kuky and support each other along the way.`}</Text>
                </View>

                <View style={styles.inputsContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Friend's Name"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#8C8C8C"
                            onSubmitEditing={() => emailRef.current?.focus()}
                        />
                    </View>
                    <View style={[styles.inputContainer, {paddingRight: 5}]}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Friend's Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#8C8C8C"
                            ref={emailRef}
                            onSubmitEditing={() => addToInviteList()}
                        />
                        <TouchableOpacity
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                backgroundColor: colors.mainColor,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={addToInviteList}
                        >
                            <FontAwesome6 name="plus" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.listContainer}>
                    {inviteList.map((item, index) => (
                        <View key={index} style={styles.inviteItem}>
                            <View>
                                <Text style={styles.nameText}>{item.name}</Text>
                                <Text style={styles.emailText}>{item.email}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => removeFromList(item.email)}
                                style={styles.removeButton}
                            >
                                <FontAwesome6 name="trash" size={16} color="#FF8B8B" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <ButtonWithLoading
                    text="Send Invitations"
                    onPress={sendInvitations}
                    disabled={inviteList.length === 0}
                    loading={loading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    inputsContainer: {
        gap: 10,
        marginBottom: 8
    },
    inputContainer: {
        borderRadius: 8,
        backgroundColor: '#E1E1E1',
        height: 48,
        paddingHorizontal: 16,
        flexDirection: 'row', gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    input: {
        fontSize: 15,
        color: '#333333'
    },
    addButton: {
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.mainColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    listContainer: {
        flex: 1,
        marginBottom: 16,
        marginTop: 8
    },
    inviteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#E9E5FF',
        borderRadius: 8,
        marginBottom: 8
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333'
    },
    emailText: {
        fontSize: 14,
        color: '#595959',
        marginTop: 4
    },
    removeButton: {
        padding: 8
    },
    sendButton: {
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.mainColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default InviteFriendScreen;
