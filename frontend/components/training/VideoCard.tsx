import React from "react";
import { PlayCircle, Clock } from "lucide-react";

interface VideoCardProps {
    video: {
        id: number;
        title: string;
        description: string;
        duration: string;
        category: string;
        thumbnail?: string;
    };
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    return (
        <div className="group relative bg-white/5 border border-white/5 rounded overflow-hidden hover:border-tribe-gold/30 transition-colors cursor-pointer">
            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-white/10 relative flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <PlayCircle size={36} className="text-white/20 group-hover:text-tribe-gold transition-colors" />
                <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                    <Clock size={10} /> {video.duration}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-1">
                <span className="text-[10px] font-semibold text-tribe-gold uppercase tracking-wider">
                    {video.category}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-tribe-gold transition-colors line-clamp-1">
                    {video.title}
                </h3>
                <p className="text-xs text-tribe-light/60 line-clamp-2">
                    {video.description}
                </p>
            </div>
        </div>
    );
};
