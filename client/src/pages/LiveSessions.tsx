import { motion } from "framer-motion";
import { Video, ExternalLink, Clock } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const sessions = [
  { id: 1, title: "Mastering Emotional Intelligence", desc: "Deep dive into self-awareness and empathy as tools for leadership.", date: "March 21, 2026", time: "7:00 PM EST", upcoming: true, daysUntil: 2 },
  { id: 2, title: "The Discipline of Daily Habits", desc: "Building systems that compound over time.", date: "March 28, 2026", time: "7:00 PM EST", upcoming: true, daysUntil: 9 },
  { id: 3, title: "Financial Freedom Masterclass", desc: "Investment principles for long-term wealth.", date: "March 14, 2026", time: "7:00 PM EST", upcoming: false },
  { id: 4, title: "Brotherhood & Accountability", desc: "The power of community in personal growth.", date: "March 7, 2026", time: "7:00 PM EST", upcoming: false },
];

const LiveSessions = () => (
  <div className="flex flex-col gap-6 lg:gap-8">
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
      <h1 className="font-display text-foreground text-2xl lg:text-3xl">Live Sessions</h1>
      <p className="text-muted-foreground text-sm font-body mt-1">Mentor-led sessions for real-time growth.</p>
    </motion.div>

    {/* Upcoming */}
    <div>
      <p className="section-label mb-4">Upcoming</p>
      <div className="flex flex-col gap-4">
        {sessions.filter(s => s.upcoming).map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: 0.05 * i }}
            className="surface-card p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between hover:shadow-vault-hover transition-all duration-200"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-foreground text-base lg:text-lg">{s.title}</h3>
                <p className="text-muted-foreground text-xs font-body mt-0.5">{s.desc}</p>
                <span className="text-xs font-body text-muted-foreground tabular-nums mt-1 block">{s.date} · {s.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-14 sm:ml-0">
              <span className="text-primary text-sm font-body font-medium tabular-nums">{s.daysUntil} days</span>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Join
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Past */}
    <div>
      <p className="section-label mb-4">Past Sessions</p>
      <div className="flex flex-col gap-3">
        {sessions.filter(s => !s.upcoming).map((s) => (
          <div key={s.id} className="surface-card p-4 lg:p-5 flex items-center gap-4 opacity-60">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-foreground text-sm font-body font-medium">{s.title}</p>
              <p className="text-muted-foreground text-xs font-body tabular-nums">{s.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LiveSessions;
