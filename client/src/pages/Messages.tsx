import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, ArrowLeft, CheckCheck, Smile } from "lucide-react";

const vaultTransition = { duration: 0.3, ease: [0.2, 0, 0, 1] as const };

const initialConversations = [
  { id: "1", name: "David Chen", lastMsg: "Let's connect on the finance module", time: "2m", unread: 2, avatar: "DC", online: true },
  { id: "2", name: "James Wright", lastMsg: "Great session today, brother", time: "1h", unread: 0, avatar: "JW", online: true },
  { id: "3", name: "Alex Rivera", lastMsg: "I'll send you the resources", time: "3h", unread: 1, avatar: "AR", online: false },
  { id: "4", name: "Michael Torres", lastMsg: "See you at the next live session", time: "1d", unread: 0, avatar: "MT", online: false },
  { id: "5", name: "Ryan Patel", lastMsg: "Thanks for the advice on leadership", time: "2d", unread: 0, avatar: "RP", online: false },
];

const initialMessages: Record<string, { id: number; sender: string; text: string; time: string; status?: string }[]> = {
  "1": [
    { id: 1, sender: "them", text: "Hey Marcus, really enjoyed the leadership module.", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Thanks David! The section on emotional intelligence resonated with me the most.", time: "10:32 AM", status: "read" },
    { id: 3, sender: "them", text: "Absolutely. Want to connect on the finance module next? I think we could hold each other accountable.", time: "10:35 AM" },
    { id: 4, sender: "them", text: "Let's connect on the finance module", time: "10:36 AM" },
  ],
  "2": [
    { id: 1, sender: "them", text: "That live session was incredible. Really opened my eyes.", time: "3:15 PM" },
    { id: 2, sender: "me", text: "Same here. The mentor's breakdown of discipline vs motivation hit different.", time: "3:18 PM", status: "read" },
    { id: 3, sender: "them", text: "Great session today, brother", time: "3:20 PM" },
  ],
  "3": [
    { id: 1, sender: "me", text: "Hey Alex, do you have those resources from last week's session?", time: "9:00 AM", status: "delivered" },
    { id: 2, sender: "them", text: "I'll send you the resources", time: "9:45 AM" },
  ],
};

const Messages = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState(initialMessages);
  const [conversations, setConversations] = useState(initialConversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === selected);
  const messages = selected ? allMessages[selected] || [] : [];

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, messages.length]);

  // Clear unread when opening a conversation
  useEffect(() => {
    if (selected) {
      setConversations((prev) =>
        prev.map((c) => (c.id === selected ? { ...c, unread: 0 } : c))
      );
    }
  }, [selected]);

  const handleSend = () => {
    if (!newMsg.trim() || !selected) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const msg = { id: Date.now(), sender: "me", text: newMsg.trim(), time: timeStr, status: "sent" };

    setAllMessages((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] || []), msg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected ? { ...c, lastMsg: newMsg.trim(), time: "now" } : c
      )
    );

    setNewMsg("");

    // Simulate "delivered" after 1s, then a reply after 2-3s
    setTimeout(() => {
      setAllMessages((prev) => ({
        ...prev,
        [selected]: (prev[selected] || []).map((m) =>
          m.id === msg.id ? { ...m, status: "delivered" } : m
        ),
      }));
    }, 1000);

    setTimeout(() => {
      const replies = [
        "That's a great point, brother.",
        "I completely agree with you on that.",
        "Let's discuss this more at the next session.",
        "Appreciate you sharing that. 💪",
        "For sure, I'm on the same page.",
      ];
      const reply = {
        id: Date.now() + 1,
        sender: "them",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setAllMessages((prev) => ({
        ...prev,
        [selected]: [...(prev[selected] || []), reply],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected ? { ...c, lastMsg: reply.text, time: "now" } : c
        )
      );
    }, 2000 + Math.random() * 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 md:left-[280px] bottom-[60px] md:bottom-0 flex flex-col bg-background">
      <div className="flex flex-1 min-h-0">
        {/* Conversation List */}
        <div
          className={`w-full sm:w-80 shrink-0 flex flex-col border-r border-border bg-card ${
            selected ? "hidden sm:flex" : "flex"
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
            {filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                  selected === c.id ? "bg-muted/60" : "hover:bg-muted/30"
                }`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-body font-semibold text-muted-foreground">{c.avatar}</span>
                  </div>
                  {c.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[hsl(142_71%_45%)] border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-body truncate ${c.unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>{c.name}</span>
                    <span className={`text-[11px] font-body tabular-nums shrink-0 ml-2 ${c.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
                      {c.time}
                    </span>
                  </div>
                  <p className={`text-xs font-body truncate mt-0.5 ${c.unread > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground/60"}`}>{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={vaultTransition}
              className={`flex-1 flex flex-col min-h-0 bg-background ${selected ? "flex" : "hidden sm:flex"}`}
            >
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card shrink-0">
                <button
                  onClick={() => setSelected(null)}
                  className="sm:hidden w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-body font-semibold text-muted-foreground">{active.avatar}</span>
                  </div>
                  {active.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[hsl(142_71%_45%)] border-2 border-card" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-body font-semibold text-foreground">{active.name}</span>
                  <p className="text-[11px] font-body text-muted-foreground/50">
                    {active.online ? "online" : "last seen recently"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-0.5">
                {messages.map((m, i) => {
                  const isMe = m.sender === "me";
                  const showAvatar = !isMe && (i === 0 || messages[i - 1].sender !== "them");
                  const isLast = i === messages.length - 1 || messages[i + 1]?.sender !== m.sender;

                  return (
                    <motion.div
                      key={m.id}
                      initial={m.id > 100 ? { opacity: 0, y: 8, scale: 0.95 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${isLast ? "mb-2.5" : "mb-0.5"}`}
                    >
                      {!isMe && (
                        <div className="w-7 mr-2 shrink-0">
                          {showAvatar && (
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-1">
                              <span className="text-[9px] font-body font-semibold text-muted-foreground">
                                {active.avatar}
                              </span>
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
                          <span className="text-[10px] text-muted-foreground/40 tabular-nums">{m.time}</span>
                          {isMe && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${
                                m.status === "read" ? "text-primary" : "text-muted-foreground/40"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                    placeholder="Message..."
                    className="flex-1 bg-muted/40 rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/30 outline-none border border-transparent focus:border-border/50 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      newMsg.trim()
                        ? "bg-primary hover:brightness-110"
                        : "bg-muted/50"
                    }`}
                  >
                    <Send className={`w-4 h-4 ${newMsg.trim() ? "text-primary-foreground" : "text-muted-foreground/40"}`} />
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
