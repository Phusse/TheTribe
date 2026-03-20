import { motion } from "framer-motion";
import { Shield, Users, Ticket, BookOpen, Video, BarChart3, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const AdminOverview = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const quickStats = [
    { label: "Total Members", value: stats?.totalUsers || 0, icon: Users },
    { label: "Groups", value: stats?.totalGroups || 0, icon: Users },
    { label: "Training Modules", value: stats?.totalModules || 0, icon: BookOpen },
    { label: "Invites Generated", value: stats?.totalInvites || 0, icon: Ticket },
  ];

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
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
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
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Manage Users", path: "/admin/users", icon: Users },
          { label: "Invite Codes", path: "/admin/invites", icon: Ticket },
          { label: "Training", path: "/admin/training", icon: BookOpen },
          { label: "Sessions", path: "/admin/sessions", icon: Video },
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

      {/* SuperAdmin Warning */}
      {isSuperAdmin && (
        <div className="surface-card p-4 flex items-start gap-3 border border-destructive/20 mt-4">
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
