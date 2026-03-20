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
  isUsed: boolean;
  createdAt: string;
  usedAt: string | null;
  createdById: string;
  usedById: string | null;
  usedBy?: {
    firstName: string;
  };
}

const InviteManagement = () => {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: invites, isLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: async () => {
      const res = await api.get("/invites");
      return res.data as Invite[];
    },
  });

  const { mutate: generateInvite, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      await api.post("/invites", {});
    },
    onSuccess: () => {
      toast.success("New invite code generated");
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    },
    onError: () => toast.error("Failed to generate code"),
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
  const available = validInvites.filter((i) => !i.isUsed).length;
  const usedCount = validInvites.filter((i) => i.isUsed).length;

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
                      {inv.isUsed ? (
                        <span className="text-xs font-body text-muted-foreground">Used by {inv.usedBy?.firstName || "Unknown"}</span>
                      ) : (
                        <span className="text-xs font-body text-primary font-medium">Available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">
                      {format(new Date(inv.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!inv.isUsed && (
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
                  {inv.isUsed ? (
                    <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded">Used</span>
                  ) : (
                    <span className="text-[10px] font-body text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">Available</span>
                  )}
                </div>
                <div className="text-xs font-body text-muted-foreground">
                  {inv.isUsed ? `Used by ${inv.usedBy?.firstName || "Unknown"}` : `Created On ${format(new Date(inv.createdAt), "MMM d, yyyy")}`}
                </div>
                {!inv.isUsed && (
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
    </div>
  );
};

export default InviteManagement;
