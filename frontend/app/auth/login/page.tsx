"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const { login, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
            // AuthContext handles redirect to /dashboard
        } catch (err: any) {
            setError(err.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8">
            <div className="relative w-20 h-20">
                <Image
                    src="/logo.jpg"
                    alt="TheTribe Logo"
                    fill
                    className="object-contain mix-blend-screen [mask-image:radial-gradient(circle,black_60%,transparent_100%)]"
                    priority
                />
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-sm text-tribe-light/60">
                    Sign in to your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || authLoading}
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading || authLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-tribe-light/40 hover:text-tribe-light transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button
                    type="submit"
                    fullWidth
                    disabled={!email || !password || isLoading || authLoading}
                    className="bg-tribe-gold text-black hover:bg-[#bfa030] mt-2"
                >
                    {isLoading || authLoading ? "Signing in..." : "Login"}
                </Button>

                <div className="text-center pt-2">
                    <Link href="#" className="text-xs text-tribe-light/40 hover:text-tribe-gold transition-colors">
                        Forgot your password?
                    </Link>
                </div>
            </form>
        </div>
    );
}
