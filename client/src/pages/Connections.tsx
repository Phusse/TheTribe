import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Users, Loader2, MessageSquare, UserMinus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface DiscoverUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  occupation: string | null;
  location: string | null;
}

const Connections = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disconnectingPartner, setDisconnectingPartner] = useState<{ id: string; name: string } | null>(null);

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await api.get("/connections");
      return res.data as Connection[];
    },
  });

  const { data: discoverable, isLoading: isDiscoverLoading } = useQuery({
    queryKey: ["discover-users"],
    queryFn: async () => {
      const res = await api.get("/users/discover");
      return res.data as DiscoverUser[];
    },
  });

  const { mutate: sendRequest, isPending: isRequesting } = useMutation({
    mutationFn: async (receiverId: string) => {
      await api.post("/connections/request", { receiverId });
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["discover-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      await api.patch(`/connections/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-stats"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: deleteConnection } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/connections/${id}`);
    },
    onSuccess: () => {
      setDisconnectingPartner(null);
      toast.success("Connection removed");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-stats"] });
    },
    onError: (e: any) => toast.error(e.message),
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
      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {disconnectingPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDisconnectingPartner(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-card p-6 w-full max-w-sm rounded-xl flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
                <UserMinus className="w-6 h-6" />
              </div>
              <h2 className="font-display text-foreground text-lg mb-2">Disconnect?</h2>
              <p className="text-sm font-body text-muted-foreground mb-6">
                Are you sure you want to remove <span className="font-semibold text-foreground">{disconnectingPartner.name}</span> from your connections?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDisconnectingPartner(null)}
                  className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-body font-medium hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConnection(disconnectingPartner.id)}
                  className="flex-1 py-2 rounded-lg bg-destructive text-white text-sm font-body font-medium hover:brightness-110 transition-all"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate("/dashboard/messages", { state: { newChatUser: c.partner } })}
                    className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDisconnectingPartner({ id: c.id, name: `${c.partner.firstName} ${c.partner.lastName}` })}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Disconnect"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Discover */}
      <div>
        <p className="section-label mb-4">Discover Members</p>
        {isDiscoverLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : !discoverable || discoverable.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body italic">You're connected with everyone!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverable.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...vaultTransition, delay: 0.05 * i }}
                className="surface-card p-5 flex flex-col gap-4 text-center items-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {u.profilePhotoUrl ? (
                    <img src={u.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-body font-medium text-muted-foreground">
                      {u.firstName[0]}{u.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-foreground text-base font-body font-medium">{u.firstName} {u.lastName}</h3>
                  <p className="text-muted-foreground text-xs font-body mt-0.5 max-w-[140px] truncate">
                    {u.occupation || "Member"}
                  </p>
                </div>
                <button
                  onClick={() => sendRequest(u.id)}
                  disabled={isRequesting}
                  className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-auto disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect
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
