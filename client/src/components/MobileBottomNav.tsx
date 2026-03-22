import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  UserCircle,
  Search,
} from "lucide-react";
import { useState } from "react";
import GlobalSearch from "./GlobalSearch";

const navItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/dashboard/training", label: "Training", icon: BookOpen },
  { path: "/dashboard/messages", label: "Chat", icon: MessageSquare },
  { path: "/dashboard/connections", label: "Network", icon: Users },
  { path: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        <button
          onClick={() => setShowSearch(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sidebar-foreground hover:text-primary"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-body font-medium">Search</span>
        </button>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                active
                  ? "text-primary"
                  : "text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </nav>
  );
};

export default MobileBottomNav;
