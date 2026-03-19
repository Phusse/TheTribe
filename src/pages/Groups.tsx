import { motion } from "framer-motion";
import { MessagesSquare, Users, ArrowRight } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const groups = [
  { id: 1, name: "General", desc: "Open discussion for all tribe members", members: 128, lastActivity: "2 min ago" },
  { id: 2, name: "Leadership Circle", desc: "Advanced leadership discussions", members: 24, lastActivity: "15 min ago" },
  { id: 3, name: "Finance & Wealth", desc: "Building financial freedom together", members: 42, lastActivity: "1h ago" },
  { id: 4, name: "Accountability Partners", desc: "Weekly check-ins and goal tracking", members: 18, lastActivity: "3h ago" },
];

const Groups = () => (
  <div className="flex flex-col gap-6 lg:gap-8">
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
      <h1 className="font-display text-foreground text-2xl lg:text-3xl">Groups</h1>
      <p className="text-muted-foreground text-sm font-body mt-1">Admin-created rooms for focused discussion.</p>
    </motion.div>

    <div className="flex flex-col gap-3 lg:gap-4">
      {groups.map((g, i) => (
        <motion.div
          key={g.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...vaultTransition, delay: 0.05 * i }}
          className="surface-card p-4 lg:p-5 flex items-center gap-4 hover:shadow-vault-hover hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <MessagesSquare className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground text-sm font-body font-medium">{g.name}</h3>
            <p className="text-muted-foreground text-xs font-body mt-0.5 hidden sm:block">{g.desc}</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-body tabular-nums">{g.members}</span>
            </div>
            <span className="text-xs font-body text-muted-foreground tabular-nums hidden sm:block">{g.lastActivity}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Groups;
