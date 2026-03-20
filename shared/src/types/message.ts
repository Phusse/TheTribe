export interface Message {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string | null;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    online?: boolean;
}
