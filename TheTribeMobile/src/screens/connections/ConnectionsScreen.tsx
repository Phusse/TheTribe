// Connections Screen for TheTribe Mobile
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Colors } from '../../theme';
import apiService from '../../services/api';

interface Connection {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    status: string;
    connectedAt: string;
}

interface PendingRequest {
    id: string;
    senderId: string;
    senderName: string;
    createdAt: string;
}

export default function ConnectionsScreen({ navigation }: { navigation: any }) {
    const [activeTab, setActiveTab] = useState<'connections' | 'pending'>('connections');
    const [connections, setConnections] = useState<Connection[]>([]);
    const [pending, setPending] = useState<PendingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [connectionsRes, pendingRes] = await Promise.all([
                apiService.getConnections(),
                apiService.getPendingConnections(),
            ]);
            if (connectionsRes.success) setConnections(connectionsRes.data || []);
            if (pendingRes.success) setPending(pendingRes.data || []);
        } catch (error) {
            console.error('Failed to load connections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespond = async (id: string, accept: boolean) => {
        try {
            const response = await apiService.respondToConnection(id, accept ? 1 : 2);
            if (response.success) {
                Alert.alert('Success', accept ? 'Connection accepted!' : 'Request declined');
                loadData();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to respond to request');
        }
    };

    const renderConnection = ({ item }: { item: Connection }) => (
        <TouchableOpacity
            style={styles.connectionItem}
            onPress={() =>
                navigation.navigate('Chat', {
                    conversationId: item.userId,
                    conversationName: `${item.firstName} ${item.lastName}`,
                    receiverId: item.userId,
                })
            }>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName[0]}</Text>
            </View>
            <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.connectionStatus}>Connected</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPending = ({ item }: { item: PendingRequest }) => (
        <View style={styles.pendingItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.senderName[0]}</Text>
            </View>
            <View style={styles.pendingInfo}>
                <Text style={styles.connectionName}>{item.senderName}</Text>
                <View style={styles.pendingActions}>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleRespond(item.id, true)}>
                        <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleRespond(item.id, false)}>
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
                    onPress={() => setActiveTab('connections')}>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'connections' && styles.activeTabText,
                        ]}>
                        Connections ({connections.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'pending' && styles.activeTabText,
                        ]}>
                        Pending ({pending.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.tribeGold} />
                </View>
            ) : activeTab === 'connections' ? (
                connections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No connections yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={connections}
                        renderItem={renderConnection}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                )
            ) : pending.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No pending requests</Text>
                </View>
            ) : (
                <FlatList
                    data={pending}
                    renderItem={renderPending}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.tribeGold,
    },
    tabText: {
        fontSize: 14,
        color: Colors.tribeGray,
    },
    activeTabText: {
        color: Colors.tribeGold,
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
    },
    emptyText: {
        fontSize: 16,
        color: Colors.tribeGray,
    },
    list: {
        padding: 16,
    },
    connectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.tribeGray,
        borderRadius: 12,
        marginBottom: 8,
    },
    pendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.tribeGray,
        borderRadius: 12,
        marginBottom: 8,
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
    connectionInfo: {
        flex: 1,
    },
    pendingInfo: {
        flex: 1,
    },
    connectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.tribeLight,
    },
    connectionStatus: {
        fontSize: 12,
        color: Colors.tribeGold,
        marginTop: 2,
    },
    pendingActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    acceptButton: {
        backgroundColor: Colors.tribeGold,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
    },
    acceptButtonText: {
        color: Colors.tribeBlack,
        fontWeight: '600',
        fontSize: 12,
    },
    declineButton: {
        borderWidth: 1,
        borderColor: Colors.tribeGray,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
    },
    declineButtonText: {
        color: Colors.tribeLight,
        fontSize: 12,
    },
});
