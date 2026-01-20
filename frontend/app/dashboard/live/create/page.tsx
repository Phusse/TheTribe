"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function CreateLiveSessionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        meetingUrl: "",
        date: "",
        time: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Combine date and time
            const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

            const response = await api.live.createSession({
                title: formData.title,
                description: formData.description,
                meetingUrl: formData.meetingUrl,
                scheduledAt,
            });

            if (response.success) {
                router.push("/dashboard/live");
            } else {
                alert("Failed to create session: " + response.error);
            }
        } catch (error) {
            console.error("Failed to create session:", error);
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
                <span>Back to Sessions</span>
            </button>

            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Create Live Session</h1>
                <p className="text-tribe-light/60 text-sm">
                    Schedule a new live event for the community.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tribe-light/80">Title</label>
                    <Input
                        required
                        placeholder="e.g. Weekly Q&A with Mentors"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-tribe-gold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-tribe-light/80">Description</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="What will be discussed?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-tribe-gold transition-colors resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tribe-light/80 flex items-center gap-2">
                            <Calendar size={14} /> Date
                        </label>
                        <Input
                            required
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="bg-white/5 border-white/10 focus:border-tribe-gold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tribe-light/80 flex items-center gap-2">
                            <Calendar size={14} /> Time
                        </label>
                        <Input
                            required
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="bg-white/5 border-white/10 focus:border-tribe-gold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-tribe-light/80 flex items-center gap-2">
                        <LinkIcon size={14} /> Meeting URL
                    </label>
                    <Input
                        required
                        type="url"
                        placeholder="https://zoom.us/..."
                        value={formData.meetingUrl}
                        onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-tribe-gold"
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
                        "Schedule Session"
                    )}
                </Button>
            </form>
        </div>
    );
}
