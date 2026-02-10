// Create Group Screen for TheTribe Mobile
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Colors } from '../../theme';
import apiService from '../../services/api';

export default function CreateGroupScreen({ navigation }: { navigation: any }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.createChatRoom(name.trim(), description.trim());
            if (response.success) {
                Alert.alert('Success', 'Group created successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to create group');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create group');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create New Group</Text>
                <Text style={styles.subtitle}>Start a community discussion</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Crypto Enthusiasts"
                        placeholderTextColor={Colors.tribeGray}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What is this group about?"
                        placeholderTextColor={Colors.tribeGray}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleCreate}
                        disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color={Colors.tribeBlack} />
                        ) : (
                            <Text style={styles.buttonText}>Create Group</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.tribeBlack,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.tribeLight,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.tribeGold,
        marginBottom: 32,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.tribeLight,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.tribeGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.tribeLight,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.tribeBlack,
        fontSize: 16,
        fontWeight: '600',
    },
});
