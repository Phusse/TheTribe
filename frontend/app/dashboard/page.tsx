"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Users, PlayCircle, Video, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface DashboardStats {
    connections: number;
    unread: number;
    groups: number;
    nextSession: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        connections: 0,
        unread: 0,
        groups: 0,
        nextSession: "-",
    });
    const [latestSession, setLatestSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);
            try {
                // Fetch data in parallel
                const [connectionsRes, conversationsRes, roomsRes, sessionsRes] = await Promise.all([
                    api.connections.getConnections(),
                    api.messaging.getConversations("unread"),
                    api.messaging.getChatRooms(),
                    api.live.getSessions(),
                ]);

                // Calculate stats
                const connections = connectionsRes.success && connectionsRes.data ? connectionsRes.data.length : 0;
                const unread = conversationsRes.success && conversationsRes.data ? conversationsRes.data.length : 0;
                const groups = roomsRes.success && roomsRes.data ? roomsRes.data.length : 0;

                // Find next upcoming session
                let nextSession = "-";
                if (sessionsRes.success && sessionsRes.data && sessionsRes.data.length > 0) {
                    const upcomingSessions = sessionsRes.data
                        .filter((s: any) => new Date(s.scheduledAt) > new Date())
                        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

                    if (upcomingSessions.length > 0) {
                        const nextDate = new Date(upcomingSessions[0].scheduledAt);
                        const now = new Date();
                        const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        nextSession = diffDays <= 0 ? "Today" : `${diffDays}d`;
                        setLatestSession(upcomingSessions[0]);
                    }
                }

                setStats({ connections, unread, groups, nextSession });
            } catch (error) {
                console.error("[Dashboard] Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    // Format date
    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-tribe-gold" size={32} />
            </div>
        );
    }

    return (
        <>
            {/* Header / Greeting */}
            <header className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Welcome back, {user?.firstName || user?.name || "Member"}.
                </h1>
                <p className="text-tribe-light/60 text-sm">{dateString}</p>
            </header>

            {/* Quick Stats (Real Data) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Connections", value: String(stats.connections), href: "/dashboard/connections" },
                    { label: "Unread", value: String(stats.unread), href: "/dashboard/messages" },
                    { label: "Groups", value: String(stats.groups), href: "/dashboard/messages" }, // Assuming groups are in messages
                    { label: "Next Session", value: stats.nextSession, href: "/dashboard/live" },
                ].map((stat) => (
                    <Link key={stat.label} href={stat.href} className="block">
                        <div className="p-3 rounded bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-colors h-full">
                            <p className="text-[10px] text-tribe-light/40 uppercase tracking-wider font-medium">
                                {stat.label}
                            </p>
                            <p className="text-lg font-semibold text-white">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Messages Card */}
                <Link href="/dashboard/messages">
                    <div className="group p-4 rounded bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageSquare size={48} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="w-8 h-8 rounded bg-tribe-gold/10 flex items-center justify-center text-tribe-gold">
                                <MessageSquare size={16} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Messages</h3>
                                <p className="text-xs text-tribe-light/60 mt-0.5">
                                    {stats.unread > 0
                                        ? `${stats.unread} unread conversation${stats.unread > 1 ? "s" : ""}`
                                        : "No unread messages"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-tribe-gold font-medium">
                                Open <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Groups Card */}
                <Link href="/dashboard/groups">
                    <div className="group p-4 rounded bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={48} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Users size={16} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Groups</h3>
                                <p className="text-xs text-tribe-light/60 mt-0.5">
                                    {stats.groups > 0
                                        ? `${stats.groups} group${stats.groups > 1 ? "s" : ""} you're in`
                                        : "No groups yet"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                                View <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Training Card */}
                <Link href="/dashboard/training">
                    <div className="group p-4 rounded bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PlayCircle size={48} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <PlayCircle size={16} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Training</h3>
                                <p className="text-xs text-tribe-light/60 mt-0.5">
                                    Browse training modules
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                                Browse <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Live Session Card */}
                <Link href="/dashboard/live">
                    <div className="group p-4 rounded bg-white/5 border border-white/5 hover:border-tribe-gold/30 transition-colors cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Video size={48} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-400">
                                <Video size={16} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Live Sessions</h3>
                                <p className="text-xs text-tribe-light/60 mt-0.5">
                                    {latestSession
                                        ? `Next: "${latestSession.title}"`
                                        : "No upcoming sessions"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                                View <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </>
    );
}
