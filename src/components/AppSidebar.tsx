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
} from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
  { path: "/dashboard/training", label: "Training", icon: BookOpen, badge: 0 },
  { path: "/dashboard/live", label: "Live Sessions", icon: Video, badge: 0 },
  { path: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { path: "/dashboard/groups", label: "Groups", icon: MessagesSquare, badge: 0 },
  { path: "/dashboard/connections", label: "Connections", icon: Users, badge: 2 },
  { path: "/dashboard/profile", label: "Profile", icon: UserCircle, badge: 0 },
  { path: "/dashboard/settings", label: "Settings", icon: Settings, badge: 0 },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img src={tribeLogo} alt="The Tribe" className="w-9 h-9 object-contain" />
        <span className="font-display text-foreground text-base">The Tribe</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <p className="section-label px-3 mb-2">Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-200 w-full text-left ${
                active
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
              {item.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold flex items-center justify-center">
                  {item.badge}
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
              onClick={() => navigate("/dashboard/admin")}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-200 w-full text-left ${
                isActive("/dashboard/admin")
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
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-sidebar-foreground hover:text-destructive hover:bg-surface-hover transition-colors duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
