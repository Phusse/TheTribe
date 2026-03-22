import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, ArrowLeft, Loader2, Smile } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const vaultTransition = { duration: 0.3, ease: [0.2, 0, 0, 1] as const };

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  isActive: boolean;
}

interface Conversation {
  partner: Partner;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

// Helper to extract initials
const getInitials = (first: string, last: string) => `${first[0] || ""}${last[0] || ""}`.toUpperCase();

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const { data: conversations, isLoading: loadingConvos } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/messages/conversations");
      return res.data as Conversation[];
    },
    refetchInterval: 5000, // naive polling fallback for realtime until socket is built
  });

  // 2. Fetch Chat History if a partner is selected
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedPartnerId],
    queryFn: async () => {
      if (!selectedPartnerId) return [];
      const res = await api.get(`/messages/${selectedPartnerId}/history`);
      return res.data as Message[];
    },
    enabled: !!selectedPartnerId,
    refetchInterval: 3000, // naive polling fallback
  });

  // 3. Send Message Mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedPartnerId) return;
      await api.post(`/messages/${selectedPartnerId}`, { text });
    },
    onSuccess: () => {
      setNewMsg("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedPartnerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  const activeConvo = conversations?.find((c) => c.partner.id === selectedPartnerId);
  const filteredConversations = conversations?.filter((c) =>
    `${c.partner.firstName} ${c.partner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPartnerId, messages?.length]);

  const handleSend = () => {
    if (!newMsg.trim() || !selectedPartnerId) return;
    sendMessage(newMsg.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 md:left-[280px] bottom-[60px] md:bottom-0 flex flex-col bg-background z-[40]">
      <div className="flex flex-1 min-h-0">
        {/* Conversation List */}
        <div
          className={`w-full sm:w-80 shrink-0 flex flex-col border-r border-border bg-card ${
            selectedPartnerId ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="px-4 pt-5 pb-2">
            <h1 className="font-display text-foreground text-xl mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 rounded-full pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/30 outline-none border border-transparent focus:border-border transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loadingConvos ? (
              <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No conversations found. Have someone connect with you first!</div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.partner.id}
                  onClick={() => setSelectedPartnerId(c.partner.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-border/40 ${
                    selectedPartnerId === c.partner.id ? "bg-muted/60" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {c.partner.profilePhotoUrl ? (
                         <img src={c.partner.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-body font-semibold text-muted-foreground">
                          {getInitials(c.partner.firstName, c.partner.lastName)}
                        </span>
                      )}
                    </div>
                    {c.partner.isActive && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[hsl(142_71%_45%)] border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-body truncate ${c.unreadCount > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                        {c.partner.firstName} {c.partner.lastName}
                      </span>
                      <span className={`text-[11px] font-body tabular-nums shrink-0 ml-2 ${c.unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
                        {format(new Date(c.lastMessageAt), "h:mm a")}
                      </span>
                    </div>
                    <p className={`text-xs font-body truncate mt-0.5 ${c.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground/60"}`}>
                      {c.lastMessage || "Started a conversation"}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold flex items-center justify-center shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <AnimatePresence mode="wait">
          {activeConvo ? (
            <motion.div
              key={activeConvo.partner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={vaultTransition}
              className={`flex-1 flex flex-col min-h-0 bg-background ${selectedPartnerId ? "flex" : "hidden sm:flex"}`}
            >
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card shrink-0">
                <button
                  onClick={() => setSelectedPartnerId(null)}
                  className="sm:hidden w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {activeConvo.partner.profilePhotoUrl ? (
                      <img src={activeConvo.partner.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-body font-semibold text-muted-foreground">
                        {getInitials(activeConvo.partner.firstName, activeConvo.partner.lastName)}
                      </span>
                    )}
                  </div>
                  {activeConvo.partner.isActive && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[hsl(142_71%_45%)] border-2 border-card" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-body font-semibold text-foreground">
                    {activeConvo.partner.firstName} {activeConvo.partner.lastName}
                  </span>
                  <p className="text-[11px] font-body text-muted-foreground/50">
                    {activeConvo.partner.isActive ? "online" : "offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-0.5">
                {loadingMessages ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground italic">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.senderId === user?.id;
                    const showAvatar = !isMe && (i === 0 || messages[i - 1].senderId !== m.senderId);
                    const isLast = i === messages.length - 1 || messages[i + 1]?.senderId !== m.senderId;

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} ${isLast ? "mb-2.5" : "mb-0.5"}`}
                      >
                        {!isMe && (
                          <div className="w-7 mr-2 shrink-0">
                            {showAvatar && (
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-1 overflow-hidden">
                                {activeConvo.partner.profilePhotoUrl ? (
                                  <img src={activeConvo.partner.profilePhotoUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-body font-semibold text-muted-foreground">
                                    {getInitials(activeConvo.partner.firstName, activeConvo.partner.lastName)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-3.5 py-2 text-[14px] font-body leading-relaxed ${
                            isMe
                              ? `bg-primary/15 text-foreground ${isLast ? "rounded-2xl rounded-br-sm" : "rounded-2xl"}`
                              : `bg-card text-foreground ${isLast ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"}`
                          }`}
                        >
                          <p>{m.text}</p>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                            <span className="text-[10px] text-muted-foreground/40 tabular-nums">
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

              {/* Input bar */}
              <div className="px-3 py-2.5 border-t border-border bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors shrink-0">
                    <Smile className="w-5 h-5 text-muted-foreground/50" />
                  </button>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    placeholder="Message..."
                    className="flex-1 bg-muted/40 rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/30 outline-none border border-transparent focus:border-border/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !newMsg.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      newMsg.trim() && !isSending
                        ? "bg-primary hover:brightness-110"
                        : "bg-muted/50"
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 text-muted-foreground/40 animate-spin" />
                    ) : (
                      <Send className={`w-4 h-4 ${newMsg.trim() ? "text-primary-foreground" : "text-muted-foreground/40"}`} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 hidden sm:flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Send className="w-6 h-6 text-muted-foreground/20" />
              </div>
              <p className="text-muted-foreground/40 text-sm font-body">Select a conversation</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;
