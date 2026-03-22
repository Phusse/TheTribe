import { motion } from "framer-motion";
import { UserPlus, Check, X, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
}

interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  partner: Partner;
}

const Connections = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await api.get("/connections");
      return res.data as Connection[];
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      await api.patch(`/connections/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const { mutate: deleteConnection } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: () => toast.error("Failed to remove connection"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !connections) {
    return <div className="text-destructive p-4">Failed to load connections.</div>;
  }

  // Pending are those requested by OTHERS to US
  const pendingRequests = connections.filter((c) => c.status === "pending" && c.receiverId === user?.id);
  const connected = connections.filter((c) => c.status === "accepted");

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-3xl">Connections</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Your professional network within the tribe.</p>
      </motion.div>

      {/* Pending */}
      {pendingRequests.length > 0 && (
        <div>
          <p className="section-label mb-4">Pending Requests</p>
          <div className="flex flex-col gap-3">
            {pendingRequests.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...vaultTransition, delay: 0.05 * i }}
                className="surface-card p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-body font-medium">{p.partner.firstName} {p.partner.lastName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => updateStatus({ id: p.id, status: "accepted" })}
                    className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateStatus({ id: p.id, status: "rejected" })}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Connected */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <p className="section-label">Your Connections</p>
          <span className="text-xs font-body text-muted-foreground tabular-nums">({connected.length})</span>
        </div>
        {connected.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body italic">You have no connections yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connected.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...vaultTransition, delay: 0.03 * i }}
                className="surface-card p-5 flex items-center gap-4 hover:shadow-vault-hover hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {c.partner.profilePhotoUrl ? (
                    <img src={c.partner.profilePhotoUrl} alt="Initials" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-body font-medium text-muted-foreground">
                      {c.partner.firstName[0]}{c.partner.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-body font-medium">{c.partner.firstName} {c.partner.lastName}</p>
                  <p className="text-muted-foreground text-xs font-body">Member</p>
                </div>
                <button 
                  onClick={() => deleteConnection(c.id)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Remove Connection"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
