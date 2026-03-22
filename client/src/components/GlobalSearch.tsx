import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Users, BookOpen, Video, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  members: { id: string; firstName: string; lastName: string; email: string; occupation?: string; profilePhotoUrl?: string; role: string }[];
  training: { id: string; title: string; category: string; duration: string; thumbnailUrl?: string }[];
  sessions: { id: string; title: string; description: string; date: string; time: string }[];
}

interface GlobalSearchProps {
  onClose: () => void;
}

const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => setResults(res.data as SearchResult))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const hasResults = results && (results.members.length > 0 || results.training.length > 0 || results.sessions.length > 0);
  const noResults = results && !hasResults && debouncedQuery.length >= 2;

  const goTo = (path: string) => { navigate(path); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {loading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground/50 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, training, sessions..."
            className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/30 border border-border rounded px-1.5 py-0.5 font-body">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
          {!query && (
            <div className="p-6 text-center text-sm text-muted-foreground/40 font-body">
              Start typing to search across the platform
            </div>
          )}

          {noResults && (
            <div className="p-6 text-center text-sm text-muted-foreground/40 font-body">
              No results for "<span className="text-foreground/60">{debouncedQuery}</span>"
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {/* Members */}
              {results.members.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <p className="text-[10px] font-body font-semibold text-muted-foreground/50 uppercase tracking-wider">Members</p>
                  </div>
                  {results.members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => goTo("/dashboard/connections")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.profilePhotoUrl
                          ? <img src={m.profilePhotoUrl} className="w-full h-full object-cover" />
                          : <span className="text-[10px] font-body font-semibold text-primary">{m.firstName[0]}{m.lastName[0]}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-body font-medium text-foreground truncate">{m.firstName} {m.lastName}</p>
                        <p className="text-xs font-body text-muted-foreground/60 truncate">{m.occupation || m.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Training */}
              {results.training.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-t border-border/40">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <p className="text-[10px] font-body font-semibold text-muted-foreground/50 uppercase tracking-wider">Training</p>
                  </div>
                  {results.training.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => goTo("/dashboard/training")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {t.thumbnailUrl
                          ? <img src={t.thumbnailUrl} className="w-full h-full object-cover rounded-lg" />
                          : <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-body font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-xs font-body text-muted-foreground/60">{t.category} · {t.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Live Sessions */}
              {results.sessions.length > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 border-t border-border/40">
                    <Video className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <p className="text-[10px] font-body font-semibold text-muted-foreground/50 uppercase tracking-wider">Live Sessions</p>
                  </div>
                  {results.sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => goTo("/dashboard/live")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-body font-medium text-foreground truncate">{s.title}</p>
                        <p className="text-xs font-body text-muted-foreground/60 truncate">{s.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GlobalSearch;
