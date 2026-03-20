import { motion } from "framer-motion";
import { UserPlus, Check, X, Users } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const pending = [
  { id: 1, name: "Nathan Brooks", occupation: "Entrepreneur", location: "Austin, TX" },
  { id: 2, name: "Omar Hassan", occupation: "Software Engineer", location: "London, UK" },
];

const connected = [
  { id: 3, name: "David Chen", occupation: "Financial Advisor", location: "New York, NY" },
  { id: 4, name: "James Wright", occupation: "Executive Coach", location: "Chicago, IL" },
  { id: 5, name: "Alex Rivera", occupation: "Marketing Director", location: "Miami, FL" },
  { id: 6, name: "Michael Torres", occupation: "Physician", location: "San Francisco, CA" },
  { id: 7, name: "Ryan Patel", occupation: "Founder & CEO", location: "Seattle, WA" },
];

const Connections = () => (
  <div className="flex flex-col gap-8">
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
      <h1 className="font-display text-foreground text-3xl">Connections</h1>
      <p className="text-muted-foreground text-sm font-body mt-1">Your professional network within the tribe.</p>
    </motion.div>

    {/* Pending */}
    {pending.length > 0 && (
      <div>
        <p className="section-label mb-4">Pending Requests</p>
        <div className="flex flex-col gap-3">
          {pending.map((p, i) => (
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
                <p className="text-foreground text-sm font-body font-medium">{p.name}</p>
                <p className="text-muted-foreground text-xs font-body">{p.occupation} · {p.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connected.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: 0.03 * i }}
            className="surface-card p-5 flex items-center gap-4 hover:shadow-vault-hover hover:scale-[1.01] transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-body font-medium text-muted-foreground">
                {c.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-body font-medium">{c.name}</p>
              <p className="text-muted-foreground text-xs font-body">{c.occupation} · {c.location}</p>
            </div>
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Connections;
