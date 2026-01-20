"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type UserRole = "member" | "admin" | "superadmin";

interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    hasRole: (role: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem("tribe_user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                console.log("[Auth] Restored session:", parsed.email);
                setUser(parsed);
            } catch (e) {
                console.error("[Auth] Failed to parse stored user");
                localStorage.removeItem("tribe_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.auth.login(email, password);
            console.log("[Auth] Login response:", response);

            if (response.success && response.data) {
                const userData: User = {
                    id: response.data.id,
                    email,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    name: response.data.firstName || email.split("@")[0],
                    role: response.data.role as UserRole,
                    token: response.data.token,
                };

                console.log("[Auth] Storing user:", { ...userData, token: "[HIDDEN]" });
                setUser(userData);
                localStorage.setItem("tribe_user", JSON.stringify(userData));
                router.push("/dashboard");
            } else {
                throw new Error(response.error || "Login failed");
            }
        } catch (error) {
            console.error("[Auth] Login error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        console.log("[Auth] Logging out");
        setUser(null);
        localStorage.removeItem("tribe_user");
        router.push("/auth/login");
    };

    const hasRole = (allowedRoles: UserRole[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
