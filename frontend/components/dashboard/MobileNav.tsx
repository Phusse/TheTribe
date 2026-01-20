"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    MessageSquare,
    PlayCircle,
    Menu,
    X,
    Video,
    User,
    ShieldAlert,
    LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const mobileNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Training", href: "/dashboard/training", icon: PlayCircle },
];

const moreMenuItems = [
    { name: "Live Sessions", href: "/dashboard/live", icon: Video },
    { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function MobileNav() {
    const pathname = usePathname();
    const { hasRole, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isAdmin = hasRole("admin") || hasRole("superadmin");

    return (
        <>
            {/* Slide-up Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    
                    {/* Menu Panel */}
                    <div className="absolute bottom-16 left-0 right-0 bg-tribe-black border-t border-white/10 rounded-t-2xl p-4 space-y-2 animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-tribe-light/40 uppercase tracking-wider font-medium">More</span>
                            <button onClick={() => setIsMenuOpen(false)} className="text-tribe-light/40">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {moreMenuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isActive 
                                            ? "bg-tribe-gold/10 text-tribe-gold" 
                                            : "text-tribe-light/60 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* Admin Link - only shown to admins */}
                        {isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    pathname.startsWith("/dashboard/admin")
                                        ? "bg-tribe-gold/10 text-tribe-gold" 
                                        : "text-tribe-light/60 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <ShieldAlert size={20} />
                                <span className="font-medium">Admin</span>
                            </Link>
                        )}

                        {/* Logout */}
                        <button
                            onClick={() => { logout(); setIsMenuOpen(false); }}
                            className="flex items-center gap-3 p-3 rounded-lg w-full text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-tribe-black border-t border-white/5 z-50 px-6 py-4">
                <div className="flex items-center justify-between">
                    {mobileNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-colors ${
                                    isActive ? "text-tribe-gold" : "text-tribe-light/40"
                                }`}
                            >
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                            isMenuOpen ? "text-tribe-gold" : "text-tribe-light/40"
                        }`}
                    >
                        <Menu size={24} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
