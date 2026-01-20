"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function CreateGroupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Note: api.ts doesn't have createChatRoom yet? Let's check.
            // If not, we need to add it or call fetchWithAuth directly.
            // Assuming api.messaging.createRoom exists or we add it.
            // Let's check api.ts content again. It has getChatRooms but not create.
            // I will add it to api.ts first or use a direct call here if I can't edit api.ts easily (I can).
            // But for now, let's assume I'll add it.

            // Actually, I'll just use the fetchWithAuth helper if I can export it, or just use api.messaging.createRoom if I add it.
            // Let's add it to api.ts in the next step.

            const response = await api.messaging.createRoom(formData.name, formData.description);

            if (response.success) {
                router.push("/dashboard/messages");
            } else {
                alert("Failed to create group: " + response.error);
            }
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-tribe-light/60 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Messages</span>
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Create New Group</h1>
                <p className="text-tribe-light/60 text-sm">
                    Start a community discussion.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tribe-light/80">Group Name</label>
                    <Input
                        required
                        placeholder="e.g. Crypto Enthusiasts"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-tribe-gold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-tribe-light/80">Description</label>
                    <textarea
                        required
                        rows={3}
                        placeholder="What is this group about?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-tribe-gold transition-colors resize-none"
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    className="bg-tribe-gold text-black hover:bg-[#bfa030] font-bold"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} /> Creating...
                        </span>
                    ) : (
                        "Create Group"
                    )}
                </Button>
            </form>
        </div>
    );
}
