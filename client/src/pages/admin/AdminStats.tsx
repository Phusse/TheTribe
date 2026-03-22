import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const AdminStats = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const res = await api.get("/admin/reports");
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading || !reports) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Active Members", value: reports.overview.activeMembers, change: `${reports.overview.memberActiveRate}% rate` },
    { label: "New Members (30d)", value: reports.overview.newMembersLast30, change: `+${reports.overview.newMembersLast7} this week` },
    { label: "Total Connections", value: reports.engagement.totalConnections, change: `+${reports.engagement.connectionsLast7} this week` },
    { label: "Content Completion", value: reports.content.completedProgress, change: `${reports.content.trainingCompletionRate}% passing` },
    { label: "Total Messages", value: reports.engagement.totalMessages, change: `+${reports.engagement.messagesLast7} this week` },
    { label: "Invite Conversion", value: `${reports.invites.inviteConversionRate}%`, change: `${reports.invites.usedInvites} used` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">Real-time platform performance metrics and engagement data.</p>
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
              <span className="text-xs font-body font-medium mb-1 text-primary">
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
