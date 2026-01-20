"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
    const { user, hasRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [invites, setInvites] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !hasRole(["admin", "superadmin"])) {
                router.push("/dashboard");
                return;
            }

            const fetchData = async () => {
                try {
                    const [invitesRes, usersRes] = await Promise.all([
                        api.admin.getInvites(),
                        api.admin.getUsers(),
                    ]);

                    if (invitesRes.success && invitesRes.data) setInvites(invitesRes.data);
                    if (usersRes.success && usersRes.data) setUsers(usersRes.data);
                } catch (error) {
                    console.error("Failed to fetch admin data", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }
    }, [user, authLoading, hasRole, router]);

    if (authLoading || isLoading) {
        return <div className="text-center py-20 text-tribe-light/40">Loading admin panel...</div>;
    }

    return (
        <div className="space-y-10">
            <header className="space-y-1 border-b border-white/5 pb-4">
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-tribe-light/60 text-xs">
                    Manage access, users, and content.
                </p>
            </header>

            {/* Invite Management */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Invite Codes</h2>
                    <Button size="sm">Generate New</Button>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-tribe-light/60 uppercase text-xs">
                            <tr>
                                <th className="p-4 font-medium">Code</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Uses</th>
                                <th className="p-4 font-medium">Created By</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invites.map((invite) => (
                                <tr key={invite.code} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-tribe-gold">{invite.code}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${invite.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {invite.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white">{invite.uses}</td>
                                    <td className="p-4 text-tribe-light/60">{invite.createdBy}</td>
                                    <td className="p-3 text-right">
                                        <button className="text-tribe-light/40 hover:text-red-400 text-xs transition-colors">
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Member Management */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Member Directory</h2>
                </div>

                <div className="bg-white/5 border border-white/5 rounded overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-tribe-light/60 uppercase text-xs">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">{u.name}</td>
                                    <td className="p-4 text-tribe-light/60">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${u.role === 'superadmin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            u.role === 'admin' ? 'bg-tribe-gold/10 text-tribe-gold border-tribe-gold/20' :
                                                'bg-white/5 text-tribe-light/60 border-white/10'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {hasRole(["superadmin"]) && u.role !== "superadmin" && (
                                            <Button variant="ghost" size="sm" className="text-xs h-7">
                                                Edit
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
