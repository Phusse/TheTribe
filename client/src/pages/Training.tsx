import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, CheckCircle, ChevronDown, Lock, BookOpen } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Lesson {
  title: string;
  duration: string;
  completed: boolean;
  locked?: boolean;
}

interface Module {
  id: number;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  progress: number;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 1, title: "The Art of Masculine Leadership", category: "Leadership", duration: "42 min", completed: true, progress: 100,
    lessons: [
      { title: "Introduction to Leadership Principles", duration: "8 min", completed: true },
      { title: "Servant Leadership in Action", duration: "12 min", completed: true },
      { title: "Leading Through Adversity", duration: "10 min", completed: true },
      { title: "Building Your Leadership Identity", duration: "12 min", completed: true },
    ],
  },
  {
    id: 2, title: "Building Unshakeable Confidence", category: "Mindset", duration: "38 min", completed: true, progress: 100,
    lessons: [
      { title: "The Science of Self-Belief", duration: "10 min", completed: true },
      { title: "Overcoming Imposter Syndrome", duration: "9 min", completed: true },
      { title: "Body Language & Presence", duration: "11 min", completed: true },
      { title: "Daily Confidence Rituals", duration: "8 min", completed: true },
    ],
  },
  {
    id: 3, title: "Financial Mastery: Foundations", category: "Finance", duration: "55 min", completed: false, progress: 40,
    lessons: [
      { title: "Mindset of Wealth", duration: "12 min", completed: true },
      { title: "Budgeting & Cash Flow", duration: "14 min", completed: true },
      { title: "Introduction to Investing", duration: "15 min", completed: false },
      { title: "Building Multiple Income Streams", duration: "14 min", completed: false, locked: true },
    ],
  },
  {
    id: 4, title: "Mastering Emotional Intelligence", category: "Mindset", duration: "47 min", completed: false, progress: 0,
    lessons: [
      { title: "Understanding Your Emotions", duration: "12 min", completed: false },
      { title: "Empathy as a Strength", duration: "11 min", completed: false, locked: true },
      { title: "Managing Conflict with EQ", duration: "13 min", completed: false, locked: true },
      { title: "EQ in Relationships", duration: "11 min", completed: false, locked: true },
    ],
  },
  {
    id: 5, title: "Strategic Networking", category: "Business", duration: "31 min", completed: false, progress: 0,
    lessons: [
      { title: "Building Genuine Relationships", duration: "10 min", completed: false },
      { title: "The Follow-Up Formula", duration: "8 min", completed: false, locked: true },
      { title: "Leveraging Your Network", duration: "13 min", completed: false, locked: true },
    ],
  },
  {
    id: 6, title: "Physical Discipline & Peak Performance", category: "Health", duration: "36 min", completed: false, progress: 0,
    lessons: [
      { title: "Morning Routine Blueprint", duration: "9 min", completed: false },
      { title: "Training for Mental Toughness", duration: "12 min", completed: false, locked: true },
      { title: "Nutrition Fundamentals", duration: "15 min", completed: false, locked: true },
    ],
  },
];

const completedCount = modules.filter((m) => m.completed).length;
const overallProgress = Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length);

const Training = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl lg:text-3xl">Training Modules</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Structured knowledge for deliberate growth.</p>
      </motion.div>

      {/* Overall Progress */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="section-label">Overall Progress</p>
            <p className="text-foreground text-xl font-display mt-1">{overallProgress}%</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-body text-sm font-medium tabular-nums">{completedCount} / {modules.length}</p>
            <p className="text-muted-foreground text-xs font-body">modules completed</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Module List */}
      <div className="flex flex-col gap-3">
        {modules.map((mod, i) => {
          const isExpanded = expanded === mod.id;

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: 0.04 * i }}
              className="surface-card overflow-hidden"
            >
              {/* Module header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : mod.id)}
                className="w-full p-4 lg:p-5 flex items-center gap-4 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {mod.completed ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : mod.progress > 0 ? (
                    <>
                      <Play className="w-4 h-4 text-primary" />
                      <svg className="absolute inset-0" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                        <circle
                          cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
                          strokeDasharray={`${(mod.progress / 100) * 113} 113`}
                          strokeLinecap="round"
                          transform="rotate(-90 20 20)"
                        />
                      </svg>
                    </>
                  ) : (
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-body text-primary/80 font-semibold uppercase tracking-wider">{mod.category}</span>
                  </div>
                  <h3 className="font-display text-foreground text-sm lg:text-base truncate">{mod.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px] font-body tabular-nums">{mod.duration}</span>
                    </div>
                    {!mod.completed && mod.progress > 0 && (
                      <span className="text-[11px] font-body text-primary tabular-nums">{mod.progress}%</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Lessons dropdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-4 lg:px-5 py-3 flex flex-col gap-1">
                      {mod.lessons.map((lesson, li) => (
                        <button
                          key={li}
                          disabled={lesson.locked}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            lesson.locked
                              ? "opacity-40 cursor-not-allowed"
                              : lesson.completed
                              ? "hover:bg-muted/30"
                              : "hover:bg-primary/5 cursor-pointer"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                            {lesson.locked ? (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : lesson.completed ? (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-body truncate ${lesson.completed ? "text-muted-foreground" : "text-foreground"}`}>
                              {lesson.title}
                            </p>
                          </div>
                          <span className="text-[11px] font-body text-muted-foreground/50 tabular-nums shrink-0">{lesson.duration}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Training;
