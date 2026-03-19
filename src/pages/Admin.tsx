import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Ticket,
  BookOpen,
  Video,
  Copy,
  Check,
  X,
  UserCog,
  Ban,
  Trash2,
  ChevronDown,
  Plus,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "invites", label: "Invites", icon: Ticket },
  { id: "content", label: "Training", icon: BookOpen },
  { id: "sessions", label: "Sessions", icon: Video },
  { id: "stats", label: "Stats", icon: BarChart3 },
] as const;

const mockUsers = [
  { id: "1", name: "Marcus Johnson", email: "marcus@example.com", role: "superadmin" as const, status: "Active", joinedAt: "Jan 5, 2026", lastLogin: "Today" },
  { id: "2", name: "David Chen", email: "david@example.com", role: "admin" as const, status: "Active", joinedAt: "Feb 12, 2026", lastLogin: "Yesterday" },
  { id: "3", name: "James Wright", email: "james@example.com", role: "member" as const, status: "Active", joinedAt: "Feb 20, 2026", lastLogin: "3 days ago" },
  { id: "4", name: "Alex Rivera", email: "alex@example.com", role: "member" as const, status: "Suspended", joinedAt: "Mar 1, 2026", lastLogin: "2 weeks ago" },
  { id: "5", name: "Nathan Brooks", email: "nathan@example.com", role: "member" as const, status: "Active", joinedAt: "Mar 10, 2026", lastLogin: "1 day ago" },
  { id: "6", name: "Omar Hassan", email: "omar@example.com", role: "member" as const, status: "Active", joinedAt: "Mar 14, 2026", lastLogin: "5h ago" },
];

const mockInvites = [
  { id: "1", code: "TRIBE-A7X2K", used: false, createdBy: "Marcus Johnson", createdAt: "Mar 18, 2026" },
  { id: "2", code: "TRIBE-M3N9P", used: true, usedBy: "Ryan Patel", createdBy: "Marcus Johnson", createdAt: "Mar 15, 2026", usedAt: "Mar 16, 2026" },
  { id: "3", code: "TRIBE-Q5W8J", used: false, createdBy: "David Chen", createdAt: "Mar 12, 2026" },
  { id: "4", code: "TRIBE-K2L8M", used: true, usedBy: "Nathan Brooks", createdBy: "David Chen", createdAt: "Mar 8, 2026", usedAt: "Mar 10, 2026" },
];

const roleColors: Record<string, string> = {
  superadmin: "bg-destructive/10 text-destructive",
  admin: "bg-primary/10 text-primary",
  member: "bg-muted text-muted-foreground",
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState<string>("users");
  const [copied, setCopied] = useState<string | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const { isSuperAdmin } = useAuth();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          <h1 className="font-display text-foreground text-2xl lg:text-3xl">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {isSuperAdmin ? "Full platform management — SuperAdmin access." : "Manage content and invites."}
        </p>
      </motion.div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex items-center gap-1 p-1 bg-card rounded-xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-body transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-surface-hover text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>

        {/* ══════ USERS TAB ══════ */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
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

            {/* User list — card layout on mobile, table on desktop */}
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
                  {mockUsers.map((u) => (
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

            {/* Mobile card view */}
            <div className="flex flex-col gap-3 lg:hidden">
              {mockUsers.map((u) => (
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
        )}

        {/* ══════ INVITES TAB ══════ */}
        {activeTab === "invites" && (
          <div className="flex flex-col gap-4">
            <button className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate New Code
            </button>

            {/* Desktop table */}
            <div className="hidden lg:block surface-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 section-label font-normal">Code</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Status</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Created By</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Created</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInvites.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-body text-foreground font-mono tracking-wider">{inv.code}</td>
                      <td className="px-6 py-4">
                        {inv.used ? (
                          <span className="text-xs font-body text-muted-foreground">Used by {inv.usedBy}</span>
                        ) : (
                          <span className="text-xs font-body text-primary font-medium">Available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-body text-muted-foreground">{inv.createdBy}</td>
                      <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">{inv.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!inv.used && (
                            <>
                              <button
                                onClick={() => copyCode(inv.code)}
                                className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copied === inv.code ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied === inv.code ? "Copied" : "Copy"}
                              </button>
                              <button className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors">
                                <X className="w-3.5 h-3.5" />
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {mockInvites.map((inv) => (
                <div key={inv.id} className="surface-card p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body text-foreground font-mono tracking-wider">{inv.code}</span>
                    {inv.used ? (
                      <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded">Used</span>
                    ) : (
                      <span className="text-[10px] font-body text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">Available</span>
                    )}
                  </div>
                  <div className="text-xs font-body text-muted-foreground">
                    {inv.used ? `Used by ${inv.usedBy}` : `By ${inv.createdBy}`} · {inv.createdAt}
                  </div>
                  {!inv.used && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => copyCode(inv.code)}
                        className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground flex items-center justify-center gap-1"
                      >
                        {copied === inv.code ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                        {copied === inv.code ? "Copied" : "Copy"}
                      </button>
                      <button className="py-1.5 px-3 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-destructive flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ TRAINING TAB ══════ */}
        {activeTab === "content" && (
          <div className="flex flex-col gap-4">
            <button className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Module
            </button>
            <div className="surface-card p-6">
              <p className="text-muted-foreground text-sm font-body">6 training modules published. Use the Training page to view and manage them.</p>
            </div>
          </div>
        )}

        {/* ══════ SESSIONS TAB ══════ */}
        {activeTab === "sessions" && (
          <div className="flex flex-col gap-4">
            <button className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
            <div className="surface-card p-6">
              <p className="text-muted-foreground text-sm font-body">2 upcoming sessions scheduled. Use the Live Sessions page to manage them.</p>
            </div>
          </div>
        )}

        {/* ══════ STATS TAB ══════ */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Weekly Active Users", value: "67%", change: "+5%" },
              { label: "Content Completion", value: "42%", change: "+8%" },
              { label: "Avg Session Attendance", value: "34%", change: "+2%" },
              { label: "Message Response Rate", value: "78%", change: "+12%" },
              { label: "Day-30 Retention", value: "61%", change: "+3%" },
              { label: "Invite Conversion", value: "72%", change: "-1%" },
            ].map((stat) => (
              <div key={stat.label} className="surface-card p-5 flex flex-col gap-2">
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <p className="font-display text-foreground text-2xl">{stat.value}</p>
                  <span className={`text-xs font-body font-medium mb-1 ${stat.change.startsWith("+") ? "text-primary" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SuperAdmin warning */}
      {isSuperAdmin && (
        <div className="surface-card p-4 flex items-start gap-3 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-body text-foreground font-medium">SuperAdmin Access</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              You have full platform control including the ability to promote/demote admins, suspend accounts, and delete users. Use with care.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
