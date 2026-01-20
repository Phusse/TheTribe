"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Pin, MessageSquare, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function MessagesPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.messaging.getConversations();
                console.log("[Messages] API response:", response);

                if (response.success && response.data) {
                    // Map backend response to UI format
                    const mapped = response.data.map((c: any) => ({
                        id: c.conversationId || c.id,
                        name: c.name || c.otherUserName || `User ${c.conversationId}`,
                        type: c.isGroup ? "group" : "direct",
                        lastMessage: c.lastMessage || c.lastMessageContent || "No messages yet",
                        time: c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                            : "",
                        unread: c.unreadCount || 0,
                    }));
                    setConversations(mapped);
                }
            } catch (error) {
                console.error("[Messages] Failed to fetch:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();

        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredConversations = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = filteredConversations.filter((c) => c.type === "group");
    const dms = filteredConversations.filter((c) => c.type === "direct");

    return (
        <div className="space-y-6">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Messages</h1>
                    <Link
                        href="/dashboard/groups/create"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-tribe-light/60 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Plus size={14} /> New Group
                    </Link>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-tribe-light/40" size={20} />
                    <Input
                        placeholder="Search connections..."
                        className="pl-10 bg-white/5 border-white/10 focus:border-tribe-gold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-tribe-gold" size={32} />
                </div>
            ) : conversations.length === 0 ? (
                <div className="text-center py-20 text-tribe-light/40">
                    No conversations yet. Connect with other members to start chatting.
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Pinned Groups */}
                    {groups.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold text-tribe-light/40 uppercase tracking-wider flex items-center gap-2">
                                <Pin size={12} /> Groups
                            </h2>
                            <div className="grid gap-2">
                                {groups.map((group) => (
                                    <Link
                                        key={group.id}
                                        href={`/dashboard/messages/${group.id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-tribe-gold/10 flex items-center justify-center text-tribe-gold">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-white group-hover:text-tribe-gold transition-colors">
                                                    {group.name}
                                                </h3>
                                                <span className="text-xs text-tribe-light/40">{group.time}</span>
                                            </div>
                                            <p className="text-sm text-tribe-light/60 truncate pr-4">
                                                {group.lastMessage}
                                            </p>
                                        </div>
                                        {group.unread > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-tribe-gold text-black text-[10px] font-bold flex items-center justify-center">
                                                {group.unread}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Direct Messages */}
                    {dms.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold text-tribe-light/40 uppercase tracking-wider">
                                Direct Messages
                            </h2>
                            <div className="grid gap-2">
                                {dms.map((dm) => (
                                    <Link
                                        key={dm.id}
                                        href={`/dashboard/messages/${dm.id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-tribe-light/60 font-medium">
                                            {dm.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-white group-hover:text-tribe-gold transition-colors">
                                                    {dm.name}
                                                </h3>
                                                <span className="text-xs text-tribe-light/40">{dm.time}</span>
                                            </div>
                                            <p className="text-sm text-tribe-light/60 truncate pr-4">
                                                {dm.lastMessage}
                                            </p>
                                        </div>
                                        {dm.unread > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-tribe-gold text-black text-[10px] font-bold flex items-center justify-center">
                                                {dm.unread}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
