import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Copy, Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Invite {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
  usedAt: string | null;
  createdById: string;
  usedById: string | null;
  usedBy?: {
    id: string;
    name: string;
  };
}

const InviteManagement = () => {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"invites" | "audit">("invites");

  const { data: invites, isLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: async () => {
      const res = await api.get("/invites");
      return res.data as Invite[];
    },
  });

  const { data: attempts, isLoading: isLoadingAttempts } = useQuery({
    queryKey: ["admin-invite-attempts"],
    queryFn: async () => {
      const res = await api.get("/invites/attempts");
      return res.data as { id: string; code: string; email: string; status: string; ipAddress: string | null; createdAt: string }[];
    },
    enabled: activeTab === "audit",
  });

  const { mutate: generateInvite, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      await api.post("/invites", {});
    },
    onSuccess: () => {
      toast.success("New invite code generated");
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: deleteInvite } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invites/${id}`);
    },
    onSuccess: () => {
      toast.success("Invite revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const validInvites = invites || [];
  const available = validInvites.filter((i) => !i.used).length;
  const usedCount = validInvites.filter((i) => i.used).length;

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Invite Codes</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {available} available · {usedCount} used
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Total Codes</p>
          <p className="font-display text-foreground text-xl mt-1">{validInvites.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Available</p>
          <p className="font-display text-primary text-xl mt-1">{available}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Used</p>
          <p className="font-display text-foreground text-xl mt-1">{usedCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-border mt-2">
        <button
          onClick={() => setActiveTab("invites")}
          className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "invites" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Active Invites
          {activeTab === "invites" && <motion.div layoutId="invite-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "audit" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Audit Log
          {activeTab === "audit" && <motion.div layoutId="invite-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {activeTab === "invites" ? (
        <>
          <button
            onClick={() => generateInvite()}
            disabled={isGenerating}
            className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate New Code
          </button>

          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : validInvites.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body px-2">No invites have been generated.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block surface-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 section-label font-normal">Code</th>
                      <th className="text-left px-6 py-3 section-label font-normal">Status</th>
                      <th className="text-left px-6 py-3 section-label font-normal">Created On</th>
                      <th className="text-left px-6 py-3 section-label font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validInvites.map((inv) => (
                      <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-body text-foreground font-mono tracking-wider">{inv.code}</td>
                        <td className="px-6 py-4">
                          {inv.used ? (
                            <span className="text-xs font-body text-muted-foreground">Used by {inv.usedBy?.name || "Unknown"}</span>
                          ) : (
                            <span className="text-xs font-body text-primary font-medium">Available</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">
                          {format(new Date(inv.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {!inv.used && (
                              <>
                                <button onClick={() => copyCode(inv.code)} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                                  {copied === inv.code ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copied === inv.code ? "Copied" : "Copy"}
                                </button>
                                <button onClick={() => deleteInvite(inv.id)} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors ml-3">
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
                {validInvites.map((inv) => (
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
                      {inv.used ? `Used by ${inv.usedBy?.name || "Unknown"}` : `Created On ${format(new Date(inv.createdAt), "MMM d, yyyy")}`}
                    </div>
                    {!inv.used && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <button onClick={() => copyCode(inv.code)} className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground flex items-center justify-center gap-1">
                          {copied === inv.code ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                          {copied === inv.code ? "Copied" : "Copy"}
                        </button>
                        <button onClick={() => deleteInvite(inv.id)} className="py-1.5 px-3 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-destructive flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {isLoadingAttempts ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !attempts || attempts.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body px-2">No attempts have been logged yet.</p>
          ) : (
            <div className="surface-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 section-label font-normal">Submitted Code</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Email</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Status</th>
                    <th className="text-left px-6 py-3 section-label font-normal">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-body text-foreground font-mono tracking-wider">{attempt.code}</td>
                      <td className="px-6 py-4 text-sm font-body text-foreground">{attempt.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded font-medium ${attempt.status === "SUCCESS" ? "text-primary bg-primary/10" :
                          attempt.status === "ALREADY_USED" ? "text-amber-500 bg-amber-500/10" :
                            "text-destructive bg-destructive/10"
                          }`}>
                          {attempt.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-body text-muted-foreground tabular-nums">
                        {format(new Date(attempt.createdAt), "MMM d, yyyy h:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InviteManagement;
