// Chat Screen for TheTribe Mobile
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    isOwn: boolean;
}

interface ChatScreenProps {
    route: {
        params: {
            conversationId: string;
            conversationName?: string;
            isGroup?: boolean;
            receiverId?: string;
        };
    };
    navigation: any;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
    const { conversationId, conversationName, isGroup, receiverId } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: conversationName || 'Chat',
            headerStyle: { backgroundColor: Colors.tribeBlack },
            headerTintColor: Colors.tribeLight,
        });
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getChatHistory(conversationId);
            if (response.success) {
                const formattedMessages = (response.data?.messages || []).map((msg: any) => ({
                    ...msg,
                    isOwn: msg.senderId === user?.id,
                }));
                setMessages(formattedMessages.reverse());
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const payload: any = { content: newMessage.trim() };
            if (isGroup) {
                payload.chatRoomId = conversationId;
            } else {
                payload.receiverId = receiverId || conversationId;
            }

            const response = await apiService.sendMessage(payload);
            if (response.success) {
                const sentMessage: Message = {
                    id: response.data?.id || Date.now().toString(),
                    content: newMessage.trim(),
                    senderId: user?.id || '',
                    senderName: `${user?.firstName} ${user?.lastName}`,
                    createdAt: new Date().toISOString(),
                    isOwn: true,
                };
                setMessages(prev => [...prev, sentMessage]);
                setNewMessage('');
                flatListRef.current?.scrollToEnd();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.isOwn ? styles.ownMessage : styles.otherMessage,
            ]}>
            {!item.isOwn && <Text style={styles.senderName}>{item.senderName}</Text>}
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.messageTime}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </Text>
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={90}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor={Colors.tribeGray}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!newMessage.trim() || isSending}>
                    {isSending ? (
                        <ActivityIndicator size="small" color={Colors.tribeBlack} />
                    ) : (
                        <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.tribeGold,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.tribeGray,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.tribeGold,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        color: Colors.tribeBlack,
    },
    messageTime: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'flex-end',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.tribeGray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: Colors.tribeLight,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: Colors.tribeGold,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        color: Colors.tribeBlack,
        fontWeight: '600',
        fontSize: 15,
    },
});
