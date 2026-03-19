import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Copy, Check, X } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const mockInvites = [
  { id: "1", code: "TRIBE-A7X2K", used: false, createdBy: "Marcus Johnson", createdAt: "Mar 18, 2026" },
  { id: "2", code: "TRIBE-M3N9P", used: true, usedBy: "Ryan Patel", createdBy: "Marcus Johnson", createdAt: "Mar 15, 2026", usedAt: "Mar 16, 2026" },
  { id: "3", code: "TRIBE-Q5W8J", used: false, createdBy: "David Chen", createdAt: "Mar 12, 2026" },
  { id: "4", code: "TRIBE-K2L8M", used: true, usedBy: "Nathan Brooks", createdBy: "David Chen", createdAt: "Mar 8, 2026", usedAt: "Mar 10, 2026" },
];

const InviteManagement = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const available = mockInvites.filter((i) => !i.used).length;
  const used = mockInvites.filter((i) => i.used).length;

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Invite Codes</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {available} available · {used} used
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Total Codes</p>
          <p className="font-display text-foreground text-xl mt-1">{mockInvites.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Available</p>
          <p className="font-display text-primary text-xl mt-1">{available}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Used</p>
          <p className="font-display text-foreground text-xl mt-1">{used}</p>
        </div>
      </div>

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
                        <button onClick={() => copyCode(inv.code)} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
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
                <button onClick={() => copyCode(inv.code)} className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground flex items-center justify-center gap-1">
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
  );
};

export default InviteManagement;
