"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, UserPlus, Check, X, Loader2, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function ConnectionsPage() {
    const { user } = useAuth();
    const [activeConnections, setActiveConnections] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [activeRes, pendingRes] = await Promise.all([
                api.connections.getConnections(),
                api.connections.getPending(),
            ]);

            if (activeRes.success && activeRes.data) {
                setActiveConnections(activeRes.data);
            }
            if (pendingRes.success && pendingRes.data) {
                setPendingRequests(pendingRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRespond = async (connectionId: string, status: number) => {
        try {
            await api.connections.respondToRequest(connectionId, status);
            // Refresh data
            fetchData();
        } catch (error) {
            console.error("Failed to respond:", error);
        }
    };

    return (
        <div className="space-y-8">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Connections</h1>
                <p className="text-tribe-light/60 text-sm">
                    Manage your network and requests.
                </p>
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-tribe-gold" size={32} />
                </div>
            ) : (
                <>
                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xs font-semibold text-tribe-gold uppercase tracking-wider flex items-center gap-2">
                                <UserPlus size={14} /> Pending Requests
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                                                {(req.requesterName || "User").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{req.requesterName || "Unknown User"}</h3>
                                                <p className="text-xs text-tribe-light/60">Wants to connect</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleRespond(req.id, 1)}
                                                className="flex-1 bg-tribe-gold text-black hover:bg-[#bfa030] text-xs h-8"
                                            >
                                                <Check size={14} className="mr-1" /> Accept
                                            </Button>
                                            <Button
                                                onClick={() => handleRespond(req.id, 2)}
                                                variant="outline"
                                                className="flex-1 text-xs h-8 border-white/10 hover:bg-white/5"
                                            >
                                                <X size={14} className="mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Active Connections */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-tribe-light/40 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Your Network ({activeConnections.length})
                        </h2>
                        {activeConnections.length === 0 ? (
                            <div className="text-center py-10 text-tribe-light/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                No connections yet. Start networking!
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeConnections.map((conn) => {
                                    // Determine the "other" user
                                    // If I am requester, other is receiver.
                                    // If I am receiver, other is requester.
                                    // We need current user ID. If not available yet, we might show raw data or wait.
                                    if (!user) return null;

                                    const isRequester = conn.requesterId === user.id;
                                    const otherUserId = isRequester ? conn.receiverId : conn.requesterId;
                                    const otherUserName = isRequester ? conn.receiverName : conn.requesterName;

                                    return (
                                        <div key={conn.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-tribe-gold/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-tribe-gold/10 flex items-center justify-center text-tribe-gold font-medium">
                                                    {(otherUserName || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-tribe-gold transition-colors">
                                                        {otherUserName || "Unknown User"}
                                                    </h3>
                                                    <p className="text-xs text-tribe-light/60">Connected</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/dashboard/messages/${otherUserId}`}
                                                className="p-2 rounded-full hover:bg-white/10 text-tribe-light/40 hover:text-white transition-colors"
                                            >
                                                <MessageSquare size={18} />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
