import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const CODE_TEXT = `THE CODE OF THE TRIBE

I. RESPECT
I will treat every member with respect and dignity. I will engage in discussions with an open mind and seek to understand before seeking to be understood.

II. COMMITMENT
I commit to showing up — for myself, for my brothers, and for the collective growth of this tribe. Consistency is the currency of transformation.

III. CONFIDENTIALITY
What is shared within The Tribe stays within The Tribe. I will honor the trust placed in me by keeping all personal stories, struggles, and insights strictly confidential.

IV. ACCOUNTABILITY
I will hold myself accountable to the goals I set and welcome accountability from my brothers. Growth requires honesty, even when it is uncomfortable.

V. CONTRIBUTION
I will contribute value to this community. Whether through sharing knowledge, offering support, or simply being present — I recognize that a rising tide lifts all boats.

VI. INTEGRITY
I will act with integrity in all my dealings, both within and outside of The Tribe. My word is my bond.

VII. NO JUDGMENT
I will create a safe space free from judgment. Every man here is on his own journey, and I will support that journey without imposing my own standards or timeline.

VIII. GROWTH MINDSET
I embrace discomfort as a catalyst for growth. I will challenge my own assumptions, welcome feedback, and remain a perpetual student of life.

By entering The Tribe, I accept this code as my standard. I understand that violation of these principles may result in removal from the community.`;

const Pledge = () => {
  const navigate = useNavigate();
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
      if (isBottom) setCanAccept(true);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={vaultTransition}
        className="w-full max-w-lg flex flex-col gap-6"
      >
        <div className="text-center">
          <h1 className="font-display text-foreground text-3xl text-balance">The Code</h1>
          <p className="text-muted-foreground text-sm mt-2 font-body">Read and accept our community standards to continue.</p>
        </div>

        <div
          ref={scrollRef}
          className="bg-card border border-border rounded-xl p-6 max-h-[50vh] overflow-y-auto scroll-smooth"
        >
          <pre className="whitespace-pre-wrap font-body text-sm text-secondary-foreground leading-relaxed">
            {CODE_TEXT}
          </pre>
        </div>

        <div className="flex flex-col gap-3">
          {!canAccept && (
            <p className="text-muted-foreground/50 text-xs text-center font-body">
              Scroll to the bottom to accept
            </p>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            disabled={!canAccept}
            className={`w-full py-3 rounded-lg font-body text-sm font-semibold transition-all duration-300 ${
              canAccept
                ? "bg-primary text-primary-foreground hover:brightness-110"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            I Accept The Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Pledge;
