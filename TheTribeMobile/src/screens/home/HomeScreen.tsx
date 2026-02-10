// Home Screen for TheTribe Mobile (Dashboard)
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isGroup: boolean;
}

export default function HomeScreen({ navigation }: { navigation: any }) {
    const { user, logout } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getConversations();
            if (response.success) {
                setConversations(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id })}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{item.name}</Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Welcome back, {user?.firstName || 'Member'}
                    </Text>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Conversations List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.tribeGold} />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No conversations yet</Text>
                    <Text style={styles.emptySubtext}>
                        Start a conversation to get connected
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    greeting: {
        fontSize: 12,
        color: Colors.tribeGold,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.tribeLight,
    },
    logoutButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.tribeGold,
    },
    logoutText: {
        color: Colors.tribeGold,
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.tribeLight,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.tribeGray,
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.tribeGold,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.tribeBlack,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.tribeLight,
    },
    unreadBadge: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.tribeBlack,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.tribeGray,
    },
});
