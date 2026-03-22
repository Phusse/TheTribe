import { motion } from "framer-motion";
import { Video, ExternalLink, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, differenceInDays } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  meetingUrl?: string;
  thumbnailUrl?: string;
  upcoming: boolean;
}

const LiveSessions = () => {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api.get("/sessions");
      return res.data as Session[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4">Failed to load sessions.</div>;
  }

  const upcomingSessions = sessions?.filter((s) => s.upcoming) || [];
  const pastSessions = sessions?.filter((s) => !s.upcoming) || [];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl lg:text-3xl">Live Sessions</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Mentor-led sessions for real-time growth.</p>
      </motion.div>

      {/* Upcoming */}
      <div>
        <p className="section-label mb-4">Upcoming</p>
        {upcomingSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body italic">No upcoming sessions scheduled.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {upcomingSessions.map((s, i) => {
              const daysUntil = differenceInDays(new Date(s.date), new Date());
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...vaultTransition, delay: 0.05 * i }}
                  className="surface-card p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between hover:shadow-vault-hover transition-all duration-200"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {s.thumbnailUrl ? (
                        <img src={s.thumbnailUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Video className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-foreground text-base lg:text-lg">{s.title}</h3>
                      <p className="text-muted-foreground text-xs font-body mt-0.5">{s.description}</p>
                      <span className="text-xs font-body text-muted-foreground tabular-nums mt-1 block">
                        {format(new Date(s.date), "MMMM d, yyyy")} · {s.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-14 sm:ml-0">
                    <span className="text-primary text-sm font-body font-medium tabular-nums">
                      {daysUntil === 0 ? "Today" : `${daysUntil} days`}
                    </span>
                    <a
                      href={s.meetingUrl || "#"}
                      target={s.meetingUrl ? "_blank" : "_self"}
                      rel="noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-medium transition-colors ${s.meetingUrl
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past */}
      {pastSessions.length > 0 && (
        <div>
          <p className="section-label mb-4">Past Sessions</p>
          <div className="flex flex-col gap-3">
            {pastSessions.map((s) => (
              <div key={s.id} className="surface-card p-4 lg:p-5 flex items-center gap-4 opacity-60">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-body font-medium">{s.title}</p>
                  <p className="text-muted-foreground text-xs font-body tabular-nums">
                    {format(new Date(s.date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessions;
