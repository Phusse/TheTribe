"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function InvitePage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await api.auth.validateInvite(code);
            if (response.success) {
                // Redirect to registration or login (mocking success for now)
                // In a real flow, this might carry the code to a register page
                router.push("/auth/login?invited=true");
            } else {
                setError(response.error || "Invalid invite code.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8">
            <div className="relative w-24 h-24">
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
                    Enter Invite Code
                </h1>
                <p className="text-sm text-tribe-light/60">
                    Access to TheTribe is by invitation only.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
                <Input
                    placeholder="INVITE-CODE"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="text-center tracking-widest uppercase"
                    error={error}
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    fullWidth
                    disabled={!code || isLoading}
                    className="bg-tribe-gold text-black hover:bg-[#bfa030]"
                >
                    {isLoading ? "Verifying..." : "Enter"}
                </Button>
            </form>
        </div>
    );
}
