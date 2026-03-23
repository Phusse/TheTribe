import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Ticket,
  BookOpen,
  Video,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  FileText,
  MessagesSquare,
} from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const adminNavItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/users", label: "User Management", icon: Users },
  { path: "/admin/invites", label: "Invite Codes", icon: Ticket },
  { path: "/admin/groups", label: "Group Management", icon: MessagesSquare },
  { path: "/admin/training", label: "Training Content", icon: BookOpen },
  { path: "/admin/sessions", label: "Live Sessions", icon: Video },
  { path: "/admin/stats", label: "Analytics", icon: BarChart3 },
  { path: "/admin/reports", label: "Reports", icon: FileText },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export const AdminSidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperAdmin, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img src={tribeLogo} alt="The Tribe" className="w-9 h-9 object-contain" />
        <div className="flex flex-col">
          <span className="font-display text-foreground text-base">The Tribe</span>
          <span className="text-[10px] font-body text-primary font-semibold uppercase tracking-widest">
            {isSuperAdmin ? "SuperAdmin" : "Admin"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <p className="section-label px-3 mb-2">Management</p>
        {adminNavItems.map((item) => {
          const active = isActive(item.path);
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
                  layoutId="admin-sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r"
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}

        {/* Quick access to member view */}
        <div className="my-4 h-px bg-border" />
        <p className="section-label px-3 mb-2">Quick Links</p>
        <button
          onClick={() => handleNavigate("/dashboard")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-surface-hover transition-colors duration-200 w-full text-left"
        >
          <Users className="w-4 h-4 shrink-0" />
          Member View
        </button>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-body font-semibold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-foreground font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] font-body text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-sidebar-foreground hover:text-destructive hover:bg-surface-hover transition-colors duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = ({ className }: { className?: string }) => {
  return (
    <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border z-40 ${className}`}>
      <AdminSidebarContent />
    </aside>
  );
};

export default AdminSidebar;
