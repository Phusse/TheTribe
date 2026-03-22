import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Plus, Calendar, Clock, Users, Loader2, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Session {
  id: string;
  title: string;
  description: string;
  meetUrl: string;
  scheduledAt: string;
  hostId: string;
}

const AdminSessions = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", meetUrl: "", scheduledAt: "" });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api.get("/sessions");
      return res.data as Session[];
    },
  });

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: async () => {
      await api.post("/sessions", {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Session scheduled successfully");
      setIsCreating(false);
      setFormData({ title: "", description: "", meetUrl: "", scheduledAt: "" });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => toast.error("Failed to schedule session. Check inputs."),
  });

  const validSessions = sessions || [];
  const upcoming = validSessions.filter(s => new Date(s.scheduledAt) > new Date());
  const completed = validSessions.filter(s => new Date(s.scheduledAt) <= new Date());

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Live Sessions</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {upcoming.length} upcoming · {completed.length} completed
        </p>
      </motion.div>

      {!isCreating && (
        <button 
          onClick={() => setIsCreating(true)}
          className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      )}

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="surface-card p-5 flex flex-col gap-4 border border-primary/20"
          >
            <h3 className="text-sm font-display font-medium text-primary">New Live Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Session Title" 
                value={formData.title} 
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="auth-input" 
              />
              <input 
                type="text" 
                placeholder="Meeting URL" 
                value={formData.meetUrl} 
                onChange={e => setFormData(p => ({ ...p, meetUrl: e.target.value }))}
                className="auth-input" 
              />
              <input 
                type="datetime-local" 
                value={formData.scheduledAt} 
                onChange={e => setFormData(p => ({ ...p, scheduledAt: e.target.value }))}
                className="auth-input" 
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={formData.description} 
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="auth-input" 
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => createSession()}
                disabled={isPending || !formData.title || !formData.meetUrl || !formData.scheduledAt}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : validSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm p-4">No sessions scheduled.</p>
        ) : validSessions.map((session, i) => {
          const isUpcoming = new Date(session.scheduledAt) > new Date();
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: i * 0.05 }}
              className="surface-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-body font-medium text-foreground">{session.title}</h3>
                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded ${
                  isUpcoming ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {isUpcoming ? "Upcoming" : "Completed"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-body text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(session.scheduledAt), "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(session.scheduledAt), "h:mm a")}</span>
              </div>
              <p className="text-xs font-body text-muted-foreground">{session.description}</p>
              {isUpcoming && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-xs font-mono text-muted-foreground mr-auto">{session.meetUrl}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSessions;
