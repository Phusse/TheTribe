import { motion } from "framer-motion";
import { Shield, Users, Ticket, BookOpen, Video, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const quickStats = [
  { label: "Total Members", value: "127", icon: Users, change: "+12 this month" },
  { label: "Active Invites", value: "8", icon: Ticket, change: "3 used this week" },
  { label: "Training Modules", value: "6", icon: BookOpen, change: "2 in progress" },
  { label: "Upcoming Sessions", value: "4", icon: Video, change: "Next in 2 days" },
];

const recentActivity = [
  { action: "Nathan Brooks joined via invite code TRIBE-K2L8M", time: "2 hours ago", type: "join" },
  { action: "Training module 'Leadership Foundations' updated", time: "5 hours ago", type: "content" },
  { action: "Invite code TRIBE-A7X2K generated", time: "1 day ago", type: "invite" },
  { action: "Alex Rivera account suspended", time: "2 days ago", type: "moderation" },
  { action: "Live session 'Weekly Roundtable' completed — 34 attendees", time: "3 days ago", type: "session" },
  { action: "David Chen promoted to Admin", time: "5 days ago", type: "role" },
];

const AdminOverview = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          <h1 className="font-display text-foreground text-2xl lg:text-3xl">
            {isSuperAdmin ? "SuperAdmin" : "Admin"} Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {isSuperAdmin
            ? "Full platform oversight and control."
            : "Manage content, invites, and community."}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-4 lg:p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-4 h-4 text-primary" />
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
            </div>
            <p className="font-display text-foreground text-2xl">{stat.value}</p>
            <p className="text-xs font-body text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] font-body text-primary">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Manage Users", path: "/admin/users", icon: Users },
          { label: "Invite Codes", path: "/admin/invites", icon: Ticket },
          { label: "Training", path: "/admin/training", icon: BookOpen },
          { label: "Analytics", path: "/admin/stats", icon: BarChart3 },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="surface-card p-4 flex items-center gap-3 hover:bg-surface-hover transition-colors text-left"
          >
            <action.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-body text-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-3">
        <h2 className="section-label px-1">Recent Activity</h2>
        <div className="surface-card divide-y divide-border">
          {recentActivity.map((item, i) => (
            <div key={i} className="px-4 lg:px-6 py-3 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-foreground">{item.action}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SuperAdmin Warning */}
      {isSuperAdmin && (
        <div className="surface-card p-4 flex items-start gap-3 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-body text-foreground font-medium">SuperAdmin Access</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              You have full platform control including user management, role assignment, and account deletion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
