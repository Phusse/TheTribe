// Training Content Screen for TheTribe Mobile
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme';
import apiService from '../../services/api';

interface TrainingModule {
    id: string;
    title: string;
    description: string;
    category: string;
    sessionsCount: number;
    createdAt: string;
}

export default function ContentScreen({ navigation }: { navigation: any }) {
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getTrainingModules();
            if (response.success) {
                setModules(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load modules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderModule = ({ item }: { item: TrainingModule }) => (
        <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => navigation.navigate('ModuleDetail', { moduleId: item.id })}>
            <View style={styles.moduleIcon}>
                <Text style={styles.moduleIconText}>📚</Text>
            </View>
            <View style={styles.moduleContent}>
                <Text style={styles.moduleCategory}>{item.category}</Text>
                <Text style={styles.moduleTitle}>{item.title}</Text>
                <Text style={styles.moduleDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <Text style={styles.moduleSessions}>
                    {item.sessionsCount} session{item.sessionsCount !== 1 ? 's' : ''}
                </Text>
            </View>
        </TouchableOpacity>
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
            {modules.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No training modules available</Text>
                    <Text style={styles.emptySubtext}>
                        New content will appear here when published
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={modules}
                    renderItem={renderModule}
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
    moduleCard: {
        flexDirection: 'row',
        backgroundColor: Colors.tribeGray,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    moduleIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    moduleIconText: {
        fontSize: 24,
    },
    moduleContent: {
        flex: 1,
    },
    moduleCategory: {
        fontSize: 10,
        color: Colors.tribeGold,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.tribeLight,
        marginBottom: 4,
    },
    moduleDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
    },
    moduleSessions: {
        fontSize: 11,
        color: Colors.tribeGold,
    },
});
