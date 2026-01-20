"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { VideoCard } from "@/components/training/VideoCard";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function AdminActions() {
    const { hasRole } = useAuth();
    if (!hasRole("admin") && !hasRole("superadmin")) return null;

    return (
        <Link
            href="/dashboard/training/create"
            className="flex items-center gap-2 px-4 py-2 bg-tribe-gold text-black rounded-lg font-bold text-sm hover:bg-[#bfa030] transition-colors"
        >
            <Plus size={16} />
            Post Training
        </Link>
    );
}

const categories = ["All", "Leadership", "Wealth", "Health", "Social"];

export default function TrainingPage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.training.getVideos();
                if (response.success && response.data) {
                    setVideos(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch videos", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const filteredVideos = selectedCategory === "All"
        ? videos
        : videos.filter(v => v.category === selectedCategory);

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-white">Training Library</h1>
                        <p className="text-tribe-light/60 text-sm">
                            Curated knowledge for the modern man.
                        </p>
                    </div>
                    <AdminActions />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedCategory === cat
                                    ? "bg-tribe-gold text-black"
                                    : "bg-white/5 text-tribe-light/60 hover:bg-white/10 hover:text-white"
                                }
              `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Video Grid */}
            {isLoading ? (
                <div className="text-center py-20 text-tribe-light/40">Loading library...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}
