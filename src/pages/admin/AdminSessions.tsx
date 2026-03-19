import { motion } from "framer-motion";
import { Video, Plus, Calendar, Clock, Users } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const sessions = [
  { id: "1", title: "Weekly Roundtable", date: "Mar 22, 2026", time: "7:00 PM EST", host: "Marcus Johnson", attendees: 34, status: "Upcoming" },
  { id: "2", title: "Leadership Deep Dive", date: "Mar 25, 2026", time: "8:00 PM EST", host: "David Chen", attendees: 0, status: "Upcoming" },
  { id: "3", title: "Financial Freedom Workshop", date: "Mar 18, 2026", time: "7:30 PM EST", host: "Marcus Johnson", attendees: 28, status: "Completed" },
  { id: "4", title: "Fitness Accountability", date: "Mar 15, 2026", time: "6:00 PM EST", host: "James Wright", attendees: 19, status: "Completed" },
];

const AdminSessions = () => {
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Live Sessions</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {sessions.filter((s) => s.status === "Upcoming").length} upcoming · {sessions.filter((s) => s.status === "Completed").length} completed
        </p>
      </motion.div>

      <button className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Schedule Session
      </button>

      <div className="flex flex-col gap-3">
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-body font-medium text-foreground">{session.title}</h3>
              <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded ${
                session.status === "Upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {session.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-body text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{session.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.attendees} attendees</span>
            </div>
            <p className="text-xs font-body text-muted-foreground">Hosted by {session.host}</p>
            {session.status === "Upcoming" && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors">Edit</button>
                <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-destructive hover:bg-muted transition-colors">Cancel</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminSessions;
