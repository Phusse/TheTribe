// Live Sessions Screen for TheTribe Mobile
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Colors } from '../../theme';
import apiService from '../../services/api';

interface LiveSession {
    id: string;
    title: string;
    description: string;
    scheduledAt: string;
    duration: number;
    meetingLink: string;
    hostName: string;
}

export default function LiveSessionsScreen() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getLiveSessions();
            if (response.success) {
                setSessions(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = (session: LiveSession) => {
        if (session.meetingLink) {
            Linking.openURL(session.meetingLink);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isUpcoming = (dateStr: string) => {
        return new Date(dateStr) > new Date();
    };

    const renderSession = ({ item }: { item: LiveSession }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                {isUpcoming(item.scheduledAt) && (
                    <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingText}>Upcoming</Text>
                    </View>
                )}
            </View>

            <Text style={styles.sessionDescription} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.sessionMeta}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Host</Text>
                    <Text style={styles.metaValue}>{item.hostName}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>When</Text>
                    <Text style={styles.metaValue}>{formatDate(item.scheduledAt)}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>{item.duration} min</Text>
                </View>
            </View>

            {item.meetingLink && isUpcoming(item.scheduledAt) && (
                <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoin(item)}>
                    <Text style={styles.joinButtonText}>Join Session</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.tribeGold} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {sessions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No live sessions scheduled</Text>
                    <Text style={styles.emptySubtext}>Check back later for upcoming sessions</Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderSession}
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
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
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
    list: {
        padding: 16,
    },
    sessionCard: {
        backgroundColor: Colors.tribeGray,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    sessionTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.tribeLight,
        marginRight: 8,
    },
    upcomingBadge: {
        backgroundColor: Colors.tribeGold,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    upcomingText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.tribeBlack,
    },
    sessionDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 16,
    },
    sessionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: 10,
        color: Colors.tribeGold,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 12,
        color: Colors.tribeLight,
    },
    joinButton: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    joinButtonText: {
        color: Colors.tribeBlack,
        fontWeight: '600',
        fontSize: 14,
    },
});
