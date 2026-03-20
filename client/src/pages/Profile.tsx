import { motion } from "framer-motion";
import { MapPin, Briefcase, Calendar, Globe, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null; // Protected route guarantees user, but satisfies TS

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl lg:text-3xl">Profile</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Your identity within the tribe.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.1 }}
        className="surface-card p-5 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {user.profilePhotoUrl ? (
               <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full rounded-xl object-cover" />
            ) : (
               <span className="font-display text-primary text-xl sm:text-2xl">
                 {user.firstName[0]}{user.lastName[0]}
               </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-foreground text-xl sm:text-2xl flex items-center gap-2">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground text-sm font-body mt-1 uppercase tracking-widest text-[#B59F67]">
              {user.role}
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: Briefcase, label: "Occupation", value: "Not provided" },
            { icon: MapPin, label: "Location", value: "Not provided" },
            { icon: Calendar, label: "Member Since", value: user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Unknown" },
            { icon: Globe, label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
            { icon: Phone, label: "Phone", value: "Not provided" },
            { icon: Mail, label: "Email", value: user.email },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-body text-muted-foreground">{item.label}</p>
                <p className="text-sm font-body text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Temporarily disabled until phase 6 profile edit feature is requested specifically */}
        <button className="mt-6 sm:mt-8 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary/20 transition-colors">
          Edit Profile
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
