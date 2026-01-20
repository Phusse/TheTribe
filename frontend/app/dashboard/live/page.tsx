"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SessionCard } from "@/components/live/SessionCard";
import { api } from "@/lib/api";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function AdminActions() {
    const { hasRole } = useAuth();
    if (!hasRole("admin") && !hasRole("superadmin")) return null;

    return (
        <Link
            href="/dashboard/live/create"
            className="flex items-center gap-2 px-4 py-2 bg-tribe-gold text-black rounded-lg font-bold text-sm hover:bg-[#bfa030] transition-colors"
        >
            <Plus size={16} />
            Create Session
        </Link>
    );
}

export default function LiveSessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.live.getSessions();
                console.log("[LiveSessions] API response:", response);

                if (response.success && response.data) {
                    // Map backend fields to expected format
                    const mappedSessions = response.data.map((s: any) => {
                        const scheduledDate = new Date(s.scheduledAt);
                        const now = new Date();
                        const isUpcoming = scheduledDate > now;

                        return {
                            id: s.id,
                            title: s.title,
                            description: s.description,
                            date: scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                            time: scheduledDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                            speaker: s.hostName || s.createdBy || "Host",
                            status: isUpcoming ? "upcoming" : "past",
                            link: s.meetingUrl || "",
                        };
                    });
                    setSessions(mappedSessions);
                }
            } catch (error) {
                console.error("[LiveSessions] Failed to fetch:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const upcomingSessions = sessions.filter(s => s.status === "upcoming");
    const pastSessions = sessions.filter(s => s.status === "past");

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
                    <p className="text-tribe-light/60 text-sm">
                        Exclusive events with industry leaders.
                    </p>
                </div>
                {/* Admin Action */}
                {/* We can check role here if we had useAuth, let's add it */}
                <AdminActions />
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-tribe-gold" size={32} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 text-tribe-light/40">
                    No sessions available yet.
                </div>
            ) : (
                <>
                    {/* Upcoming Sessions */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-semibold text-tribe-gold uppercase tracking-wider">
                            Upcoming Events
                        </h2>
                        {upcomingSessions.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingSessions.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-tribe-light/40 text-sm italic">No upcoming sessions scheduled.</p>
                        )}
                    </section>

                    {/* Past Sessions */}
                    {pastSessions.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xs font-semibold text-tribe-light/40 uppercase tracking-wider">
                                Past Archives
                            </h2>
                            <div className="grid gap-4">
                                {pastSessions.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
