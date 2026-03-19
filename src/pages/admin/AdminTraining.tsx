import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const modules = [
  { id: "1", title: "Leadership Foundations", lessons: 8, status: "Published", enrolled: 94 },
  { id: "2", title: "Financial Discipline", lessons: 6, status: "Published", enrolled: 78 },
  { id: "3", title: "Physical Excellence", lessons: 10, status: "Published", enrolled: 112 },
  { id: "4", title: "Emotional Mastery", lessons: 7, status: "Published", enrolled: 65 },
  { id: "5", title: "Brotherhood & Networking", lessons: 5, status: "Draft", enrolled: 0 },
  { id: "6", title: "Legacy Building", lessons: 4, status: "Draft", enrolled: 0 },
];

const AdminTraining = () => {
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Training Content</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          {modules.length} modules · {modules.filter((m) => m.status === "Published").length} published
        </p>
      </motion.div>

      <button className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Module
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...vaultTransition, delay: i * 0.05 }}
            className="surface-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-body font-medium text-foreground">{mod.title}</h3>
              <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded ${
                mod.status === "Published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {mod.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
              <span>{mod.lessons} lessons</span>
              <span>{mod.enrolled} enrolled</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors">
                Edit
              </button>
              <button className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                {mod.status === "Published" ? "Unpublish" : "Publish"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminTraining;
