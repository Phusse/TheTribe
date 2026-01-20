import React from "react";
import { Calendar, Clock, User, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SessionCardProps {
    session: {
        id: number;
        title: string;
        description: string;
        date: string;
        time: string;
        speaker: string;
        status: "upcoming" | "past";
        link: string;
    };
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
    const isUpcoming = session.status === "upcoming";

    return (
        <div
            className={`
        p-4 rounded border transition-colors
        ${isUpcoming
                    ? "bg-white/5 border-tribe-gold/30 hover:border-tribe-gold"
                    : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                }
      `}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Date / Time Badge */}
                <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-0.5 min-w-[100px]">
                    <div className="flex items-center gap-1.5 text-tribe-gold font-bold text-sm">
                        <Calendar size={14} />
                        {session.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-tribe-light/60 text-xs">
                        <Clock size={12} />
                        {session.time}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <h3 className="text-base font-bold text-white">{session.title}</h3>
                    <p className="text-xs text-tribe-light/60">{session.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-tribe-light/40">
                        <User size={10} />
                        <span className="text-white">{session.speaker}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="flex items-center">
                    {isUpcoming ? (
                        <Button size="sm" className="gap-1.5">
                            <Video size={14} />
                            Join
                        </Button>
                    ) : (
                        <span className="px-2 py-1 rounded bg-white/5 text-tribe-light/40 text-xs font-medium border border-white/5">
                            Archived
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
