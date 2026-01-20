"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Shield, Calendar, Activity, Users, LogOut, Settings, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [connections, setConnections] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileRes, connectionsRes] = await Promise.all([
                    api.user.getProfile(),
                    api.connections.getConnections(),
                ]);

                console.log("[Profile] API response:", profileRes);

                if (profileRes.success && profileRes.data) {
                    setProfile(profileRes.data);
                }
                if (connectionsRes.success && connectionsRes.data) {
                    setConnections(connectionsRes.data.length);
                }
            } catch (error) {
                console.error("[Profile] Failed to fetch:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-tribe-gold" size={32} />
            </div>
        );
    }

    // Use profile data from API or fallback to auth context
    const displayName = profile?.firstName
        ? `${profile.firstName} ${profile.lastName || ""}`.trim()
        : user?.name || "Member";
    const displayEmail = profile?.email || user?.email || "";
    const displayRole = profile?.role !== undefined
        ? (["Member", "Admin", "SuperAdmin"][profile.role] || "Member")
        : (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member");
    const joinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        : "2024";

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-24 h-24 rounded-full bg-tribe-gold/20 flex items-center justify-center text-tribe-gold text-3xl font-bold border-2 border-tribe-gold/30">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                    <p className="text-tribe-light/60">{displayEmail}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                        <span className="px-3 py-1 rounded-full bg-tribe-gold/10 text-tribe-gold text-xs font-bold border border-tribe-gold/20 flex items-center gap-1">
                            <Shield size={12} />
                            {displayRole}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-tribe-light/60 text-xs font-medium border border-white/10 flex items-center gap-1">
                            <Calendar size={12} />
                            Since {joinDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <Activity size={20} className="mx-auto text-blue-400 mb-2" />
                    <div className="text-xl font-bold text-white">-</div>
                    <div className="text-xs text-tribe-light/40 uppercase tracking-wider">Days Active</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                    <Video size={20} className="mx-auto text-purple-400 mb-2" />
                    <div className="text-xl font-bold text-white">-</div>
                    <div className="text-xs text-tribe-light/40 uppercase tracking-wider">Sessions</div>
                </div>
                <Link href="/dashboard/connections" className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-1 hover:border-tribe-gold/30 transition-colors block">
                    <Users size={20} className="mx-auto text-green-400 mb-2" />
                    <div className="text-xl font-bold text-white">{connections}</div>
                    <div className="text-xs text-tribe-light/40 uppercase tracking-wider">Connections</div>
                </Link>
            </div>

            {/* Bio Section */}
            {profile?.bio && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <h2 className="text-sm font-bold text-white">Bio</h2>
                    <p className="text-sm text-tribe-light/60">{profile.bio}</p>
                </div>
            )}

            {/* Settings / Actions */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings size={20} /> Account Settings
                </h2>
                <div className="space-y-2">
                    <Button variant="outline" fullWidth className="justify-start text-tribe-light/60 hover:text-white">
                        Change Password
                    </Button>
                    <Button variant="outline" fullWidth className="justify-start text-tribe-light/60 hover:text-white">
                        Notification Preferences
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        className="justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} className="mr-2" />
                        Log Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
