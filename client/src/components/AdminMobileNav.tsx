import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/invites", label: "Invites", icon: Ticket },
  { path: "/admin/stats", label: "Stats", icon: BarChart3 },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminMobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                active ? "text-primary" : "text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminMobileNav;
