import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, Ban, Trash2, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const mockUsers = [
  { id: "1", name: "Marcus Johnson", email: "marcus@example.com", role: "superadmin" as const, status: "Active", joinedAt: "Jan 5, 2026", lastLogin: "Today" },
  { id: "2", name: "David Chen", email: "david@example.com", role: "admin" as const, status: "Active", joinedAt: "Feb 12, 2026", lastLogin: "Yesterday" },
  { id: "3", name: "James Wright", email: "james@example.com", role: "member" as const, status: "Active", joinedAt: "Feb 20, 2026", lastLogin: "3 days ago" },
  { id: "4", name: "Alex Rivera", email: "alex@example.com", role: "member" as const, status: "Suspended", joinedAt: "Mar 1, 2026", lastLogin: "2 weeks ago" },
  { id: "5", name: "Nathan Brooks", email: "nathan@example.com", role: "member" as const, status: "Active", joinedAt: "Mar 10, 2026", lastLogin: "1 day ago" },
  { id: "6", name: "Omar Hassan", email: "omar@example.com", role: "member" as const, status: "Active", joinedAt: "Mar 14, 2026", lastLogin: "5h ago" },
];

const roleColors: Record<string, string> = {
  superadmin: "bg-destructive/10 text-destructive",
  admin: "bg-primary/10 text-primary",
  member: "bg-muted text-muted-foreground",
};

const UserManagement = () => {
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { isSuperAdmin } = useAuth();

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">User Management</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {mockUsers.length} total users · {mockUsers.filter((u) => u.status === "Active").length} active
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm font-body text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: mockUsers.length },
          { label: "Active", value: mockUsers.filter((u) => u.status === "Active").length },
          { label: "Suspended", value: mockUsers.filter((u) => u.status === "Suspended").length },
          { label: "Admins", value: mockUsers.filter((u) => u.role === "admin" || u.role === "superadmin").length },
        ].map((s) => (
          <div key={s.label} className="surface-card p-4">
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="font-display text-foreground text-xl mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block surface-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 section-label font-normal">Name</th>
              <th className="text-left px-6 py-3 section-label font-normal">Email</th>
              <th className="text-left px-6 py-3 section-label font-normal">Role</th>
              <th className="text-left px-6 py-3 section-label font-normal">Status</th>
              <th className="text-left px-6 py-3 section-label font-normal">Joined</th>
              <th className="text-left px-6 py-3 section-label font-normal">Last Login</th>
              {isSuperAdmin && <th className="text-left px-6 py-3 section-label font-normal">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="px-6 py-4 text-sm font-body text-foreground font-medium">{u.name}</td>
                <td className="px-6 py-4 text-sm font-body text-muted-foreground">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="relative">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => setRoleDropdown(roleDropdown === u.id ? null : u.id)}
                        className={`text-xs font-body font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${roleColors[u.role]}`}
                      >
                        {u.role === "superadmin" ? "SuperAdmin" : u.role === "admin" ? "Admin" : "Member"}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-md ${roleColors[u.role]}`}>
                        {u.role === "superadmin" ? "SuperAdmin" : u.role === "admin" ? "Admin" : "Member"}
                      </span>
                    )}
                    {roleDropdown === u.id && (
                      <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-vault z-20 py-1 min-w-[140px]">
                        {(["member", "admin", "superadmin"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setRoleDropdown(null)}
                            className="w-full text-left px-3 py-2 text-xs font-body text-foreground hover:bg-surface-hover transition-colors"
                          >
                            {r === "superadmin" ? "SuperAdmin" : r === "admin" ? "Admin" : "Member"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-body font-medium ${u.status === "Active" ? "text-primary" : "text-destructive"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">{u.joinedAt}</td>
                <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">{u.lastLogin}</td>
                {isSuperAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-md hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Change role">
                        <UserCog className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-md hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors" title={u.status === "Active" ? "Suspend" : "Reactivate"}>
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-md hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors" title="Delete user">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {filtered.map((u) => (
          <div key={u.id} className="surface-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs font-body font-semibold text-muted-foreground">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-foreground">{u.name}</p>
                  <p className="text-xs font-body text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded ${roleColors[u.role]}`}>
                {u.role === "superadmin" ? "SuperAdmin" : u.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
              <span className={u.status === "Active" ? "text-primary" : "text-destructive"}>{u.status}</span>
              <span>Joined {u.joinedAt}</span>
            </div>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1">
                  <UserCog className="w-3 h-3" /> Role
                </button>
                <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1">
                  <Ban className="w-3 h-3" /> {u.status === "Active" ? "Suspend" : "Activate"}
                </button>
                <button className="py-1.5 px-3 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
