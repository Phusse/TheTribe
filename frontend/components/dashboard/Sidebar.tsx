"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Home,
    MessageSquare,
    Users,
    PlayCircle,
    Video,
    User,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Training", href: "/dashboard/training", icon: PlayCircle },
    { name: "Live Sessions", href: "/dashboard/live", icon: Video },
    { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, hasRole, logout } = useAuth();

    return (
        <aside className="hidden md:flex flex-col w-56 h-screen bg-tribe-black border-r border-white/5 fixed left-0 top-0 z-40">
            {/* Logo Area */}
            <div className="p-4 flex items-center justify-center border-b border-white/5">
                <div className="relative w-10 h-10">
                    <Image
                        src="/logo.jpg"
                        alt="TheTribe"
                        fill
                        className="object-contain mix-blend-screen [mask-image:radial-gradient(circle,black_60%,transparent_100%)]"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-2.5 px-3 py-2 rounded transition-colors
                ${isActive
                                    ? "bg-tribe-gold/10 text-tribe-gold"
                                    : "text-tribe-light/60 hover:text-tribe-light hover:bg-white/5"
                                }
              `}
                        >
                            <item.icon size={16} />
                            <span className="font-medium text-xs">{item.name}</span>
                        </Link>
                    );
                })}

                {/* Admin Link */}
                {hasRole(["admin", "superadmin"]) && (
                    <Link
                        href="/dashboard/admin"
                        className={`
                            flex items-center gap-2.5 px-3 py-2 rounded transition-colors mt-4
                            ${pathname === "/dashboard/admin"
                                ? "bg-red-500/10 text-red-400"
                                : "text-tribe-light/60 hover:text-red-400 hover:bg-white/5"
                            }
                        `}
                    >
                        <ShieldAlert size={16} />
                        <span className="font-medium text-xs">Admin</span>
                    </Link>
                )}
            </nav>

            {/* User / Footer */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded bg-white/5">
                    <div className="w-7 h-7 rounded bg-tribe-gold/20 flex items-center justify-center text-tribe-gold text-[10px] font-bold">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{user?.name || "User"}</p>
                        <p className="text-[10px] text-tribe-light/40 truncate capitalize">{user?.role || "Member"}</p>
                    </div>
                    <button onClick={logout} className="text-tribe-light/40 hover:text-red-400 transition-colors">
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
