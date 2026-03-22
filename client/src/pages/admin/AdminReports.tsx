import { motion } from "framer-motion";
import { FileText, Loader2, Users, MessageSquare, BookOpen, Key } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const AdminReports = () => {
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

  const reportsList = [
    {
      icon: Users,
      title: "Growth & Demographics",
      date: format(new Date(), "MMM yyyy"),
      description: `The platform currently hosts ${reports.overview.totalMembers} members, with ${reports.overview.activeMembers} marked as fully active. ${reports.overview.newMembersLast30} joined in the last 30 days.`,
    },
    {
      icon: MessageSquare,
      title: "Community Health & Engagement",
      date: format(new Date(), "MMM yyyy"),
      description: `A total of ${reports.engagement.totalMessages} direct messages and ${reports.engagement.groupMessageCount} group messages have been exchanged across ${reports.engagement.totalGroups} active groups.`,
    },
    {
      icon: BookOpen,
      title: "Content Performance",
      date: format(new Date(), "MMM yyyy"),
      description: `Out of ${reports.content.totalModules} tracking records, there is a ${reports.content.trainingCompletionRate}% completion rate for published training modules. ${reports.sessions.upcomingSessions} live sessions are upcoming.`,
    },
    {
      icon: Key,
      title: "Access & Security",
      date: format(new Date(), "MMM yyyy"),
      description: `${reports.invites.usedInvites} out of ${reports.invites.totalInvites} generated invite codes have been used (${reports.invites.inviteConversionRate}% conversion).`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Reports</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">Live platform intelligence reports.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {reportsList.map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-5 border-l-4 border-l-primary flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <report.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-body font-bold text-foreground">{report.title}</h3>
                <p className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded">{report.date}</p>
              </div>
              <p className="text-xs font-body leading-relaxed text-muted-foreground">{report.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
