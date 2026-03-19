import { motion } from "framer-motion";
import { Users, MessageSquare, MessagesSquare, Video, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const quickLinks = [
  { label: "Messages", desc: "View conversations", icon: MessageSquare, path: "/dashboard/messages" },
  { label: "Groups", desc: "Chat rooms", icon: MessagesSquare, path: "/dashboard/groups" },
  { label: "Training", desc: "Browse modules", icon: BookOpen, path: "/dashboard/training" },
  { label: "Live Sessions", desc: "Upcoming events", icon: Video, path: "/dashboard/live" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl sm:text-3xl lg:text-4xl leading-[1.1] text-balance">
          {greeting}, <span className="text-primary">{user?.firstName || "Brother"}</span>.
        </h1>
        <p className="text-muted-foreground text-sm font-body mt-2">{dateStr} — The work begins now.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard label="Connections" value={12} icon={Users} />
        <StatCard label="Unread Messages" value={3} icon={MessageSquare} />
        <StatCard label="Groups" value={4} icon={MessagesSquare} />
        <StatCard label="Next Session" value="2 days" icon={Video} accent />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.1 }}
        className="surface-card p-4 lg:p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-body text-sm font-medium">Mastering Emotional Intelligence</p>
            <p className="text-muted-foreground text-xs font-body tabular-nums mt-0.5">Fri, Mar 21 · 7:00 PM EST</p>
          </div>
        </div>
        <span className="text-primary font-body text-sm font-medium tabular-nums shrink-0">2 days</span>
      </motion.div>

      <div>
        <p className="section-label mb-3 lg:mb-4">Quick Access</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {quickLinks.map((link, i) => (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: 0.05 * i }}
              onClick={() => navigate(link.path)}
              className="surface-card p-4 lg:p-5 flex items-center gap-3 lg:gap-4 hover:shadow-vault-hover hover:scale-[1.01] transition-all duration-200 text-left group"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <link.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-body text-sm font-medium">{link.label}</p>
                <p className="text-muted-foreground text-xs font-body hidden sm:block">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
