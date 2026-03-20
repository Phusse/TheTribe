import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const StatCard = ({ label, value, icon: Icon, accent }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={vaultTransition}
    className="surface-card p-6 flex flex-col gap-4 hover:shadow-vault-hover hover:scale-[1.01] transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <p className="section-label">{label}</p>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${accent ? "bg-primary/10" : "bg-muted"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
    </div>
    <p className={`text-3xl font-display ${accent ? "text-primary" : "text-foreground"}`}>
      {value}
    </p>
  </motion.div>
);

export default StatCard;
