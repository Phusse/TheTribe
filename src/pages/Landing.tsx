import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  BookOpen,
  Video,
  Users,
  MessageSquare,
  Shield,
  Star,
  ChevronDown,
  CheckCircle2,
  Send,
  Zap,
  Target,
  Crown,
} from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";

const vaultTransition = { duration: 0.5, ease: [0.2, 0, 0, 1] as const };

const FadeInSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...vaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const pillars = [
  {
    icon: BookOpen,
    title: "Structured Training",
    desc: "Expert-crafted modules on leadership, finance, discipline, and emotional mastery — not generic content, but battle-tested frameworks.",
  },
  {
    icon: Video,
    title: "Live Mentorship",
    desc: "Weekly live sessions with men who've built what you're building. Real talk, real strategy, real accountability.",
  },
  {
    icon: Users,
    title: "Brotherhood Network",
    desc: "Connect with driven men across industries. Your network determines your net worth — curate it intentionally.",
  },
  {
    icon: MessageSquare,
    title: "Private Conversations",
    desc: "Direct messaging and group rooms for deep discussion. No noise, no algorithms — just signal.",
  },
];

const values = [
  { icon: Shield, text: "Vetted members only — no spectators" },
  { icon: Target, text: "Actionable growth, not motivational fluff" },
  { icon: Zap, text: "Accountability that drives real change" },
  { icon: Crown, text: "Legacy-minded men building legacies" },
];

const testimonials = [
  {
    quote: "The Tribe gave me the structure and brotherhood I was missing. Within 3 months, I doubled my income and found mentors who actually care.",
    name: "David C.",
    role: "Entrepreneur",
  },
  {
    quote: "This isn't another community — it's a forge. The men here push you to become who you're supposed to be.",
    name: "James W.",
    role: "Finance Executive",
  },
  {
    quote: "The live sessions alone are worth it. Raw, unfiltered wisdom from men walking the walk. No hype, just truth.",
    name: "Marcus T.",
    role: "Tech Founder",
  },
];

const Landing = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [invitePhase, setInvitePhase] = useState<"enter" | "verifying" | "success" | "error">("enter");
  const [appForm, setAppForm] = useState({ name: "", email: "", occupation: "", reason: "" });
  const [appSubmitted, setAppSubmitted] = useState(false);
  const navigate = useNavigate();
  const applyRef = useRef<HTMLDivElement>(null);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setInvitePhase("verifying");
    setTimeout(() => {
      if (inviteCode.trim().length >= 4) {
        setInvitePhase("success");
        setTimeout(() => navigate("/register"), 800);
      } else {
        setInvitePhase("error");
        setTimeout(() => setInvitePhase("enter"), 2000);
      }
    }, 1500);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitted(true);
  };

  const scrollToApply = () => {
    applyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(46_65%_52%_/_0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(240_10%_12%_/_0.5)_0%,_transparent_50%)]" />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={vaultTransition}
          className="relative z-20 flex items-center justify-between px-6 lg:px-16 py-5"
        >
          <div className="flex items-center gap-3">
            <img src={tribeLogo} alt="The Tribe" className="w-10 h-10 object-contain" />
            <span className="font-display text-foreground text-sm lg:text-base">The Tribe</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={scrollToApply}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold hover:brightness-110 transition-all"
            >
              Apply
            </button>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <motion.img
              src={tribeLogo}
              alt="The Tribe"
              className="w-28 h-28 lg:w-36 lg:h-36 object-contain"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...vaultTransition, delay: 0.2 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: 0.3 }}
            >
              <h1 className="font-display text-foreground text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-balance">
                Where Driven Men<br />
                <span className="text-primary">Become Dangerous</span>
              </h1>
              <p className="text-muted-foreground font-body text-base lg:text-lg mt-6 max-w-2xl mx-auto leading-relaxed text-pretty">
                An invite-only brotherhood of men committed to mastery. Structured mentorship,
                elite training, and a network that elevates every area of your life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={scrollToApply}
                className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all flex items-center gap-2"
              >
                Apply For Access
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-muted-foreground/50">
                <Lock className="w-3.5 h-3.5" />
                <span className="font-body text-xs uppercase tracking-[0.15em]">Invite Only</span>
              </div>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...vaultTransition, delay: 0.7 }}
              className="flex items-center gap-6 mt-4"
            >
              <div className="flex -space-x-2">
                {["DC", "JW", "AR", "MT", "RP"].map((initials) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-[9px] font-body font-semibold text-muted-foreground">{initials}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground/60 font-body text-xs">
                <span className="text-foreground font-medium">200+ men</span> already inside
              </p>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-muted-foreground/30 text-[10px] font-body uppercase tracking-widest">Discover</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground/30 animate-bounce" />
        </motion.div>
      </section>

      {/* ═══════════ WHY THE TRIBE ═══════════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-16 lg:mb-20">
            <p className="section-label mb-4">Why The Tribe</p>
            <h2 className="font-display text-foreground text-3xl lg:text-4xl text-balance">
              This Is Not Another <span className="text-primary">Community</span>
            </h2>
            <p className="text-muted-foreground font-body text-base mt-4 max-w-xl mx-auto text-pretty">
              Most groups give you motivation. We give you a system — mentors, structure, and
              a brotherhood that holds you to the standard you set for yourself.
            </p>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <FadeInSection key={p.title} delay={i * 0.1}>
                <div className="surface-card p-6 lg:p-8 h-full flex flex-col gap-4 hover:shadow-vault-hover hover:scale-[1.02] transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <p.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-foreground text-base">{p.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{p.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-16 border-t border-border">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <FadeInSection>
            <p className="section-label mb-4">Our Standard</p>
            <h2 className="font-display text-foreground text-3xl lg:text-4xl text-balance leading-[1.15]">
              Built For Men Who <span className="text-primary">Refuse</span> to Settle
            </h2>
            <p className="text-muted-foreground font-body text-base mt-5 leading-relaxed text-pretty">
              Every member is hand-selected. Every conversation has weight. Every module is
              designed to move you forward — not entertain you.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <div className="flex flex-col gap-5">
              {values.map((v) => (
                <div key={v.text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <v.icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <p className="text-foreground font-body text-sm font-medium">{v.text}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-16 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="section-label mb-4">From The Brotherhood</p>
            <h2 className="font-display text-foreground text-3xl lg:text-4xl">
              Words From <span className="text-primary">The Inside</span>
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1}>
                <div className="surface-card p-7 lg:p-8 h-full flex flex-col gap-5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/90 font-body text-sm leading-relaxed flex-1 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[10px] font-body font-bold text-muted-foreground">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground font-body text-sm font-semibold">{t.name}</p>
                      <p className="text-muted-foreground font-body text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ INVITE CODE + APPLICATION ═══════════ */}
      <section ref={applyRef} className="py-24 lg:py-32 px-6 lg:px-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="section-label mb-4">Join Us</p>
            <h2 className="font-display text-foreground text-3xl lg:text-4xl text-balance">
              Ready to <span className="text-primary">Earn Your Place</span>?
            </h2>
            <p className="text-muted-foreground font-body text-base mt-4 max-w-lg mx-auto text-pretty">
              Got an invite code? Enter it below. Otherwise, apply and we'll review your
              application within 48 hours.
            </p>
          </FadeInSection>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Invite Code */}
            <FadeInSection delay={0.05}>
              <div className="surface-card p-8 lg:p-10 h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <p className="section-label !mb-0">Have An Invite?</p>
                  </div>
                  <p className="text-muted-foreground/60 font-body text-sm">
                    Enter your code to skip the line.
                  </p>
                </div>

                <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4 flex-1 justify-center">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="INVITE CODE"
                    disabled={invitePhase === "verifying"}
                    className={`
                      w-full bg-background text-foreground text-center font-display text-lg tracking-[0.2em]
                      py-4 px-6 rounded-lg border outline-none transition-all duration-300
                      placeholder:text-muted-foreground/25 placeholder:font-body placeholder:text-sm placeholder:tracking-[0.15em]
                      ${invitePhase === "enter" ? "border-border focus:border-primary/50 focus:gold-glow" : ""}
                      ${invitePhase === "verifying" ? "border-primary/30 animate-gold-pulse" : ""}
                      ${invitePhase === "success" ? "border-primary gold-glow" : ""}
                      ${invitePhase === "error" ? "border-destructive shadow-[0_0_20px_hsl(0_62%_50%_/_0.2)]" : ""}
                    `}
                  />

                  <AnimatePresence mode="wait">
                    {invitePhase === "enter" && (
                      <motion.button
                        key="submit"
                        type="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={vaultTransition}
                        className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      >
                        Verify Code
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                    {invitePhase === "verifying" && (
                      <motion.p key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground text-sm font-body text-center py-3.5">
                        Verifying access...
                      </motion.p>
                    )}
                    {invitePhase === "success" && (
                      <motion.p key="s" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-primary text-sm font-body font-medium text-center py-3.5">
                        Access granted — welcome, brother.
                      </motion.p>
                    )}
                    {invitePhase === "error" && (
                      <motion.p key="e" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-sm font-body text-center py-3.5">
                        Invalid or expired code
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>

                <p className="text-muted-foreground/30 font-body text-xs text-center mt-4">
                  Already a member?{" "}
                  <button onClick={() => navigate("/login")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              </div>
            </FadeInSection>

            {/* Application Form */}
            <FadeInSection delay={0.15}>
              <div className="surface-card p-8 lg:p-10 h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-primary" />
                    <p className="section-label !mb-0">Apply To Join</p>
                  </div>
                  <p className="text-muted-foreground/60 font-body text-sm">
                    No invite? Tell us who you are.
                  </p>
                </div>

                {!appSubmitted ? (
                  <form onSubmit={handleApply} className="flex flex-col gap-3.5 flex-1">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={appForm.name}
                      onChange={(e) => setAppForm((f) => ({ ...f, name: e.target.value }))}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/25 outline-none focus:border-primary/40 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={appForm.email}
                      onChange={(e) => setAppForm((f) => ({ ...f, email: e.target.value }))}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/25 outline-none focus:border-primary/40 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Occupation / Industry"
                      required
                      value={appForm.occupation}
                      onChange={(e) => setAppForm((f) => ({ ...f, occupation: e.target.value }))}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/25 outline-none focus:border-primary/40 transition-colors"
                    />
                    <textarea
                      placeholder="Why do you want to join The Tribe?"
                      required
                      rows={3}
                      value={appForm.reason}
                      onChange={(e) => setAppForm((f) => ({ ...f, reason: e.target.value }))}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/25 outline-none focus:border-primary/40 transition-colors resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-lg bg-primary/10 text-primary font-body text-sm font-semibold uppercase tracking-[0.1em] hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      Submit Application
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-body text-sm font-semibold">Application Received</p>
                      <p className="text-muted-foreground font-body text-xs mt-1 max-w-xs">
                        We'll review your application and reach out within 48 hours. Prepare yourself.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border py-10 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={tribeLogo} alt="The Tribe" className="w-7 h-7 object-contain" />
            <span className="font-display text-foreground text-sm">The Tribe</span>
          </div>
          <p className="text-muted-foreground/40 font-body text-xs">
            © {new Date().getFullYear()} The Tribe. All rights reserved. Invite only. No exceptions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
