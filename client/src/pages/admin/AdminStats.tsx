import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const stats = [
  { label: "Weekly Active Users", value: "67%", change: "+5%" },
  { label: "Content Completion", value: "42%", change: "+8%" },
  { label: "Avg Session Attendance", value: "34%", change: "+2%" },
  { label: "Message Response Rate", value: "78%", change: "+12%" },
  { label: "Day-30 Retention", value: "61%", change: "+3%" },
  { label: "Invite Conversion", value: "72%", change: "-1%" },
];

const AdminStats = () => {
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">Platform performance metrics and engagement data.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-5 flex flex-col gap-2"
          >
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="font-display text-foreground text-2xl">{stat.value}</p>
              <span className={`text-xs font-body font-medium mb-1 ${stat.change.startsWith("+") ? "text-primary" : "text-destructive"}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
