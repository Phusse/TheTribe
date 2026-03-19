import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const reports = [
  { title: "Monthly Engagement Report", date: "Mar 2026", description: "User activity, content completion, and session attendance overview." },
  { title: "Growth Metrics", date: "Mar 2026", description: "New member acquisition, invite conversion rates, and retention." },
  { title: "Content Performance", date: "Feb 2026", description: "Training module completion rates and lesson-level analytics." },
  { title: "Community Health", date: "Feb 2026", description: "Message volume, response rates, and group participation." },
];

const AdminReports = () => {
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Reports</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">Generated platform reports and insights.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {reports.map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-5 flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <h3 className="text-sm font-body font-medium text-foreground">{report.title}</h3>
              <p className="text-xs font-body text-muted-foreground mt-1">{report.description}</p>
              <p className="text-[10px] font-body text-muted-foreground mt-2">{report.date}</p>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors shrink-0">
              View
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
