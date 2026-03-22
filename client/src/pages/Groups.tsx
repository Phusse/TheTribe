import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, Users, ArrowLeft, Send, Loader2, UserPlus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
  lastActivity: string;
  isJoined: boolean;
}

interface GroupMessage {
  id: string;
  text: string;
  userId: string;
  groupId: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface MiniProfile {
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

const getInitials = (first: string, last: string) =>
  `${first[0] || ""}${last[0] || ""}`.toUpperCase();

const Groups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [miniProfile, setMiniProfile] = useState<MiniProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await api.get("/groups");
      return res.data as Group[];
    },
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["group-messages", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const res = await api.get(`/groups/${selectedGroup.id}/messages`);
      return res.data as GroupMessage[];
    },
    enabled: !!selectedGroup?.isJoined,
    refetchInterval: 3000,
  });

  const { mutate: joinGroup, isPending: joining } = useMutation({
    mutationFn: async (groupId: string) => api.post(`/groups/${groupId}/join`),
    onSuccess: (_, groupId) => {
      toast.success("Joined group!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      if (selectedGroup?.id === groupId) {
        setSelectedGroup((prev) => prev ? { ...prev, isJoined: true } : prev);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: leaveGroup, isPending: leaving } = useMutation({
    mutationFn: async (groupId: string) => api.post(`/groups/${groupId}/leave`),
    onSuccess: () => {
      toast.success("Left group");
      setSelectedGroup(null);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedGroup) return;
      await api.post(`/groups/${selectedGroup.id}/messages`, { text });
    },
    onSuccess: () => {
      setNewMsg("");
      queryClient.invalidateQueries({ queryKey: ["group-messages", selectedGroup?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { mutate: sendRequest, isPending: requesting } = useMutation({
    mutationFn: async (receiverId: string) => api.post("/connections/request", { receiverId }),
    onSuccess: () => {
      toast.success("Connection request sent!");
      setMiniProfile(null);
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["discover-users"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-stats"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    sendMessage(newMsg.trim());
  };

  // ── Group Chat View ───────────────────────────────────────────────────────
  if (selectedGroup) {
    return (
      <div className="fixed inset-0 md:left-[280px] bottom-[60px] md:bottom-0 flex flex-col bg-background z-[40]">

        {/* Member Mini-Profile Popup */}
        <AnimatePresence>
          {miniProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setMiniProfile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="surface-card p-6 w-full max-w-xs rounded-2xl text-center"
              >
                <button
                  onClick={() => setMiniProfile(null)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {miniProfile.avatar ? (
                    <img src={miniProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-body font-medium text-muted-foreground">
                      {getInitials(miniProfile.firstName, miniProfile.lastName)}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-foreground text-lg">
                  {miniProfile.firstName} {miniProfile.lastName}
                </h3>
                <p className="text-xs font-body text-muted-foreground mt-1 mb-4">Member of The Tribe</p>
                {miniProfile.userId !== user?.id && (
                  <button
                    onClick={() => sendRequest(miniProfile.userId)}
                    disabled={requesting}
                    className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {requesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Send Connection Request
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card shrink-0">
          <button
            onClick={() => setSelectedGroup(null)}
            className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessagesSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-body font-semibold text-foreground">{selectedGroup.name}</p>
            <p className="text-[11px] font-body text-muted-foreground/50">{selectedGroup.memberCount} members</p>
          </div>
          <button
            onClick={() => leaveGroup(selectedGroup.id)}
            disabled={leaving}
            className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            Leave
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-3">
          {loadingMessages ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground italic">
              No messages yet — be the first to say something!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.userId === user?.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <button
                      onClick={() =>
                        setMiniProfile({
                          userId: m.userId,
                          firstName: m.sender.firstName,
                          lastName: m.sender.lastName,
                          avatar: m.sender.avatar,
                        })
                      }
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
                      title={`${m.sender.firstName} ${m.sender.lastName}`}
                    >
                      {m.sender.avatar ? (
                        <img src={m.sender.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-body font-semibold text-muted-foreground">
                          {getInitials(m.sender.firstName, m.sender.lastName)}
                        </span>
                      )}
                    </button>
                  )}
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    {!isMe && (
                      <button
                        onClick={() =>
                          setMiniProfile({
                            userId: m.userId,
                            firstName: m.sender.firstName,
                            lastName: m.sender.lastName,
                            avatar: m.sender.avatar,
                          })
                        }
                        className="text-[10px] font-body text-muted-foreground/60 px-1 hover:text-primary transition-colors text-left"
                      >
                        {m.sender.firstName} {m.sender.lastName}
                      </button>
                    )}
                    <div
                      className={`px-3.5 py-2 text-[14px] font-body leading-relaxed rounded-2xl ${isMe
                        ? "bg-primary/15 text-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm"
                        }`}
                    >
                      <p>{m.text}</p>
                      <span className={`text-[10px] text-muted-foreground/40 tabular-nums block mt-0.5 ${isMe ? "text-right" : ""}`}>
                        {format(new Date(m.createdAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-2.5 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
              placeholder={`Message ${selectedGroup.name}...`}
              className="flex-1 bg-muted/40 rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/30 outline-none border border-transparent focus:border-border/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMsg.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${newMsg.trim() && !sending ? "bg-primary hover:brightness-110" : "bg-muted/50"
                }`}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-muted-foreground/40 animate-spin" />
              ) : (
                <Send className={`w-4 h-4 ${newMsg.trim() ? "text-primary-foreground" : "text-muted-foreground/40"}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Group List View ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl lg:text-3xl">Groups</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Admin-created rooms for focused discussion.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !groups || groups.length === 0 ? (
        <p className="text-muted-foreground text-sm font-body">No groups available yet. Check back later!</p>
      ) : (
        <div className="flex flex-col gap-3 lg:gap-4">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: 0.05 * i }}
              className="surface-card p-4 lg:p-5 flex items-center gap-4"
            >
              <div
                onClick={() => g.isJoined && setSelectedGroup(g)}
                className={`flex-1 flex items-center gap-4 min-w-0 ${g.isJoined ? "cursor-pointer" : ""}`}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <MessagesSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground text-sm font-body font-medium">{g.name}</h3>
                  <p className="text-muted-foreground text-xs font-body mt-0.5 truncate hidden sm:block">{g.description}</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-body tabular-nums">{g.memberCount}</span>
                  </div>
                  <span className="text-xs font-body tabular-nums hidden sm:block">
                    {formatDistanceToNow(new Date(g.lastActivity), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {g.isJoined ? (
                <button
                  onClick={() => setSelectedGroup(g)}
                  className="shrink-0 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Open
                </button>
              ) : (
                <button
                  onClick={() => joinGroup(g.id)}
                  disabled={joining}
                  className="shrink-0 px-4 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-body font-medium hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {joining ? <Loader2 className="w-3 h-3 animate-spin" /> : "Join"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
