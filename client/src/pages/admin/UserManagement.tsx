import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCog, Ban, ChevronDown, Search, Loader2, MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface AdminUserView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "MEMBER" | "ADMIN" | "SUPERADMIN";
  isActive: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  SUPERADMIN: "bg-destructive/10 text-destructive",
  ADMIN: "bg-primary/10 text-primary",
  MEMBER: "bg-muted text-muted-foreground",
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [messagingUser, setMessagingUser] = useState<AdminUserView | null>(null);
  const [messageText, setMessageText] = useState("");
  const { user: selfUser, isSuperAdmin } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data as AdminUserView[];
    },
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleDropdown(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.patch(`/admin/users/${id}/status`, { isActive });
    },
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: sendAdminMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: async ({ receiverId, text }: { receiverId: string; text: string }) => {
      await api.post(`/messages/${receiverId}`, { text });
    },
    onSuccess: () => {
      toast.success("Message sent!");
      setMessagingUser(null);
      setMessageText("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const validUsers = users || [];
  const filtered = validUsers.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Send Message Modal */}
      <AnimatePresence>
        {messagingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setMessagingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-card p-6 w-full max-w-md rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-foreground text-lg">Message {messagingUser.firstName}</h2>
                <button onClick={() => setMessagingUser(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="auth-textarea"
                placeholder={`Write a message to ${messagingUser.firstName}...`}
              />
              <button
                onClick={() => sendAdminMessage({ receiverId: messagingUser.id, text: messageText })}
                disabled={isSendingMessage || !messageText.trim()}
                className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">User Management</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {validUsers.length} total users · {validUsers.filter((u) => u.isActive).length} active
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

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: validUsers.length },
              { label: "Active", value: validUsers.filter((u) => u.isActive).length },
              { label: "Suspended", value: validUsers.filter((u) => !u.isActive).length },
              { label: "Admins", value: validUsers.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN").length },
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
                  {isSuperAdmin && <th className="text-left px-6 py-3 section-label font-normal">Actions</th>}
                  <th className="text-left px-6 py-3 section-label font-normal">Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-body text-foreground font-medium">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm font-body text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        {isSuperAdmin && selfUser?.id !== u.id ? (
                          <button
                            onClick={() => setRoleDropdown(roleDropdown === u.id ? null : u.id)}
                            className={`text-xs font-body font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${roleColors[u.role]}`}
                          >
                            {u.role === "SUPERADMIN" ? "SuperAdmin" : u.role === "ADMIN" ? "Admin" : "Member"}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-md inline-block ${roleColors[u.role]}`}>
                            {u.role === "SUPERADMIN" ? "SuperAdmin" : u.role === "ADMIN" ? "Admin" : "Member"}
                          </span>
                        )}
                        {roleDropdown === u.id && (
                          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-vault z-20 py-1 min-w-[140px]">
                            {(["MEMBER", "ADMIN", "SUPERADMIN"] as const).map((r) => (
                              <button
                                key={r}
                                onClick={() => changeRole({ id: u.id, role: r })}
                                className="w-full text-left px-3 py-2 text-xs font-body text-foreground hover:bg-surface-hover transition-colors"
                              >
                                {r === "SUPERADMIN" ? "SuperAdmin" : r === "ADMIN" ? "Admin" : "Member"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-body font-medium ${u.isActive ? "text-primary" : "text-destructive"}`}>
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {selfUser?.id !== u.id && (
                            <button
                              onClick={() => toggleStatus({ id: u.id, isActive: !u.isActive })}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${u.isActive ? "hover:bg-destructive/10 text-muted-foreground hover:text-destructive" : "hover:bg-primary/10 text-destructive hover:text-primary"
                                }`}
                              title={u.isActive ? "Suspend" : "Reactivate"}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {selfUser?.id !== u.id && (
                        <button
                          onClick={() => setMessagingUser(u)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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
                        {u.firstName[0]}{u.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-body font-medium text-foreground">{u.firstName} {u.lastName}</p>
                      <p className="text-xs font-body text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded ${roleColors[u.role]}`}>
                    {u.role === "SUPERADMIN" ? "SuperAdmin" : u.role === "ADMIN" ? "Admin" : "Member"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
                  <span className={u.isActive ? "text-primary" : "text-destructive"}>{u.isActive ? "Active" : "Suspended"}</span>
                  <span>Joined {format(new Date(u.createdAt), "MMM d, yyyy")}</span>
                </div>
                {isSuperAdmin && selfUser?.id !== u.id && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => changeRole({ id: u.id, role: u.role === "MEMBER" ? "ADMIN" : "MEMBER" })}
                      className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
                    >
                      <UserCog className="w-3 h-3" /> Toggle Admin
                    </button>
                    <button
                      onClick={() => toggleStatus({ id: u.id, isActive: !u.isActive })}
                      className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
                    >
                      <Ban className="w-3 h-3" /> {u.isActive ? "Suspend" : "Activate"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
