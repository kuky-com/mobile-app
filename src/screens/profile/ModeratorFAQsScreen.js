import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import apiClient from '../../utils/apiClient';
import Text from '../../components/Text';
import { Header } from '../../components/Header';
import images from '../../utils/images';
import { FontAwesome6 } from '@expo/vector-icons';

const ModeratorFAQsScreen = ({ navigation }) => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState(new Set());

    useEffect(() => {
        onRefresh();
    }, []);

    const onRefresh = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('users/moderator-faqs')
            console.log({ data: response.data.data.data })
            if (response && response.data && response.data.data && response.data.data.data)
                setFaqs(response.data.data.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (id) => {
        const newExpandedItems = new Set(expandedItems);
        if (expandedItems.has(id)) {
            newExpandedItems.delete(id);
        } else {
            newExpandedItems.add(id);
        }
        setExpandedItems(newExpandedItems);
    };

    const renderFAQItem = ({ item }) => {
        const isExpanded = expandedItems.has(item.id);

        // Helper to detect URLs and split text into parts (plain or url)
        const parseTextWithLinks = (text) => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            let parts = [];
            let lastIndex = 0;
            let match;

            while ((match = urlRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ text: text.substring(lastIndex, match.index), isLink: false });
                }
                parts.push({ text: match[0], isLink: true });
                lastIndex = urlRegex.lastIndex;
            }
            if (lastIndex < text.length) {
                parts.push({ text: text.substring(lastIndex), isLink: false });
            }
            return parts;
        };

        const renderTextWithLinks = (text) => {
            const parts = parseTextWithLinks(text);
            return parts.map((part, idx) =>
                part.isLink ? (
                    <Text
                        key={idx}
                        style={[styles.answerText, { color: '#007AFF', textDecorationLine: 'underline' }]}
                        onPress={() => {
                            Linking.openURL(part.text)
                        }}
                    >
                        {part.text}
                    </Text>
                ) : (
                    <Text key={idx} style={styles.answerText}>
                        {part.text}
                    </Text>
                )
            );
        };

        return (
            <View style={styles.faqItem}>
                <TouchableOpacity
                    style={styles.questionContainer}
                    onPress={() => toggleExpanded(item.id)}
                >
                    <Text style={styles.questionText}>{item.question}</Text>
                    <FontAwesome6 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={13} color='#333333' />
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>
                            {renderTextWithLinks(item.answer)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    console.log({ faqs })

    return (
        <View style={styles.container}>
            <Header
                title="Moderator FAQs"
                leftIcon={images.back_icon}
                leftAction={() => navigation.goBack()}
                showLogo={false}
            />
            <FlatList
                refreshing={loading}
                onRefresh={onRefresh}
                data={faqs}
                renderItem={renderFAQItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 12,
    },
    expandIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    answerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    answerText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
});

export default ModeratorFAQsScreen;