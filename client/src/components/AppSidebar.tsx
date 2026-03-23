import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  MessageSquare,
  Users,
  UserCircle,
  Shield,
  LogOut,
  MessagesSquare,
  Settings,
  Search,
} from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GlobalSearch from "./GlobalSearch";
import { useState } from "react";

const staticNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/training", label: "Training", icon: BookOpen },
  { path: "/dashboard/live", label: "Live Sessions", icon: Video },
  { path: "/dashboard/messages", label: "Messages", icon: MessageSquare, badgeKey: "unreadMessages" as const },
  { path: "/dashboard/groups", label: "Groups", icon: MessagesSquare },
  { path: "/dashboard/connections", label: "Connections", icon: Users, badgeKey: "pendingConnections" as const },
  { path: "/dashboard/profile", label: "Profile", icon: UserCircle },
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const AppSidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  // Live badge counts
  const { data: stats } = useQuery({
    queryKey: ["sidebar-stats"],
    queryFn: async () => {
      const res = await api.get("/users/me/stats");
      return res.data as { connections: number; unreadMessages: number; groups: number; pendingConnections: number };
    },
    refetchInterval: 15000, // refresh every 15s
  });

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img src={tribeLogo} alt="The Tribe" className="w-9 h-9 object-contain" />
        <span className="font-display text-foreground text-base">The Tribe</span>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <p className="section-label px-3 mb-2">Menu</p>

        <button
          onClick={() => setShowSearch(true)}
          className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-200 w-full text-left text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-surface-hover mb-2"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1">Search...</span>
          <span className="text-[10px] text-muted-foreground/30 font-semibold px-1.5 py-0.5 border border-border rounded">⌘K</span>
        </button>
        {staticNavItems.map((item) => {
          const active = isActive(item.path);
          const badge = item.badgeKey && stats ? stats[item.badgeKey] : 0;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-200 w-full text-left ${active
                ? "text-sidebar-accent-foreground bg-sidebar-accent"
                : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-surface-hover"
                }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r"
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-4 h-px bg-border" />
            <p className="section-label px-3 mb-2">Administration</p>
            <button
              onClick={() => handleNavigate("/admin")}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-200 w-full text-left ${isActive("/admin")
                ? "text-sidebar-accent-foreground bg-sidebar-accent"
                : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-surface-hover"
                }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Admin Panel
            </button>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-sidebar-foreground hover:text-destructive hover:bg-surface-hover transition-colors duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
};

const AppSidebar = ({ className }: { className?: string }) => {
  return (
    <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border z-40 ${className}`}>
      <AppSidebarContent />
    </aside>
  );
};

export default AppSidebar;
