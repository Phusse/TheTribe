"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChatBubble } from "@/components/messaging/ChatBubble";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [conversationName, setConversationName] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isGroup, setIsGroup] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberIdToAdd, setMemberIdToAdd] = useState("");

    const handleAddMember = async () => {
        try {
            await api.messaging.addMember(id, memberIdToAdd);
            setShowAddMember(false);
            setMemberIdToAdd("");
            alert("Member added successfully!");
        } catch (e) {
            console.error("Failed to add member", e);
            alert("Failed to add member.");
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                // Get all chat history without chatRoomId filter
                const response = await api.messaging.getMessages();
                console.log("[Chat] Messages response:", response);

                if (response.success && response.data) {
                    // Backend returns ChatHistoryResponse with .messages
                    const historyData = response.data as any;
                    const allMessages = Array.isArray(historyData)
                        ? historyData
                        : historyData.messages || [];

                    // Filter to only messages for this conversation
                    const filtered = allMessages.filter((msg: any) => {
                        // DM: sender or receiver matches the conversation ID
                        const isDM = !msg.chatRoomId && (msg.senderId === id || msg.receiverId === id);
                        // Room: chatRoomId matches
                        const isRoom = msg.chatRoomId === id;
                        return isDM || isRoom;
                    });

                    // Map to expected format
                    const mapped = filtered.map((msg: any) => ({
                        id: msg.id,
                        sender: msg.senderId === user?.id ? "me" : "other",
                        senderName: msg.senderName || "Unknown",
                        text: msg.content || "",
                        time: msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "",
                    }));

                    setMessages(mapped);

                    // Get name from first other message
                    const otherMsg = filtered.find((m: any) => m.senderId !== user?.id);
                    if (otherMsg?.senderName) {
                        setConversationName(otherMsg.senderName);
                    }
                }
            } catch (error) {
                console.error("[Chat] Failed to fetch messages:", error);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchConversationInfo = async () => {
            try {
                const res = await api.user.getUserById(id);
                if (res.success && res.data) {
                    const name = res.data.firstName
                        ? `${res.data.firstName} ${res.data.lastName || ""}`.trim()
                        : res.data.email || "User";
                    setConversationName(name);
                }
            } catch (e) {
                // Maybe a room, not a user. Try fetching as room.
                try {
                    const roomRes = await api.messaging.getChatRoom(id);
                    if (roomRes.success && roomRes.data) {
                        setConversationName(roomRes.data.name);
                        setIsGroup(true);
                    }
                } catch (roomError) {
                    console.error("Failed to fetch room info:", roomError);
                }
            }
        };

        fetchMessages();
        fetchConversationInfo();

        // Mark as read
        const markRead = async () => {
            try {
                // We don't know if it's a group or DM easily from URL, but we can try both or infer.
                // Actually, the API needs `conversationId` and `isGroup`.
                // For now, let's assume if it fails it fails, or we can check the message type after fetching.
                // Better approach: wait for messages to load, check if it's a room or DM, then mark read.
                // But we want to mark read immediately.

                // Let's try to mark as read as DM first, if it's a UUID.
                // If it's a room, we might need to know that.
                // The `getMessages` response helps us know if it is a room.

                // For now, let's just trigger it.
                // Note: The backend `mark-read` endpoint might expect specific flags.
                // Let's look at api.ts again. 
                // markAsRead: async (conversationId: string, isGroup: boolean)

                // We can't know for sure without fetching.
                // So we will do it inside fetchMessages or after it.
            } catch (e) {
                console.error("Failed to mark read", e);
            }
        };
    }, [id, user?.id]);

    // Effect to mark read once we know what it is
    useEffect(() => {
        if (messages.length > 0) {
            const firstMsg = messages[0];
            // If we have a chatRoomId in the message, it's a group.
            // But wait, our mapped messages don't have chatRoomId.
            // We need to keep the raw data or infer.

            // Let's just try to mark it as read. 
            // If `id` is a user ID, it's a DM. If it's a Room ID, it's a group.
            // We can try to fetch user by ID. If it succeeds, it's a DM.

            const mark = async () => {
                try {
                    // Try to fetch user to see if it's a DM
                    const userRes = await api.user.getUserById(id);
                    const isGroup = !userRes.success;

                    await api.messaging.markAsRead(id, isGroup);

                    // Also refresh the global unread count (if we had a context for it)
                    // For now, just marking it read on backend is enough.
                } catch (e) {
                    console.error("Error marking read:", e);
                }
            };
            mark();
        }
    }, [id, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const tempMessage = {
            id: Date.now(),
            sender: "me",
            senderName: user?.name || "Me",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, tempMessage]);
        const msgText = newMessage;
        setNewMessage("");
        setIsSending(true);

        try {
            // sendMessage(content, receiverId, chatRoomId)
            await api.messaging.sendMessage(msgText, id, undefined);
        } catch (error) {
            console.error("[Chat] Failed to send:", error);
        } finally {
            setIsSending(false);
        }
    };

    const displayName = conversationName || "Chat";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
            {/* Header */}
            <header className="flex items-center justify-between py-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="md:hidden text-tribe-light/60 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                        {initial}
                    </div>
                    <div>
                        <h1 className="font-bold text-white">{displayName}</h1>
                        <p className="text-xs text-tribe-gold">Online</p>
                    </div>
                </div>
                <button className="text-tribe-light/40 hover:text-white">
                    <MoreVertical size={20} />
                </button>
            </header>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-tribe-black border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-xl font-bold text-white">Add Member</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-tribe-light/60">User ID</label>
                            <Input
                                placeholder="Enter User ID to add..."
                                value={memberIdToAdd}
                                onChange={(e) => setMemberIdToAdd(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                            {/* Ideally this would be a search or list of connections */}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setShowAddMember(false)}>Cancel</Button>
                            <Button onClick={handleAddMember} disabled={!memberIdToAdd}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between py-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="md:hidden text-tribe-light/60 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                        {initial}
                    </div>
                    <div>
                        <h1 className="font-bold text-white">{displayName}</h1>
                        <p className="text-xs text-tribe-gold">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Show Add Member if it's a group (we assume it's a group if we couldn't fetch user profile or if we have a flag) */}
                    {/* For now, let's just show it if we have a way to know it's a group. 
                        We can infer it's a group if fetching user failed (as per fetchConversationInfo).
                    */}
                    {isGroup && (
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="p-2 text-tribe-light/40 hover:text-white hover:bg-white/5 rounded-full"
                            title="Add Member"
                        >
                            <UserPlus size={20} />
                        </button>
                    )}
                    <button className="text-tribe-light/40 hover:text-white">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-tribe-gold" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-tribe-light/40">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-tribe-gold"
                    disabled={isSending}
                />
                <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-tribe-gold text-black hover:bg-[#bfa030] px-4"
                >
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </Button>
            </form>
        </div>
    );
}
