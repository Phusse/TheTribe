import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Globe, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const AdminSettings = () => {
  const { isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState({
    newMemberNotifications: true,
    sessionReminders: true,
    weeklyDigest: false,
    maintenanceMode: false,
    openRegistration: false,
    requireInviteCode: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="font-display text-foreground text-2xl">Admin Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">Platform configuration and preferences.</p>
      </motion.div>

      {/* Notifications */}
      <div className="surface-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-body font-medium text-foreground">Notifications</h2>
        </div>
        {[
          { key: "newMemberNotifications" as const, label: "New member join alerts", desc: "Get notified when someone joins via invite code." },
          { key: "sessionReminders" as const, label: "Session reminders", desc: "Reminders before scheduled live sessions." },
          { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of platform activity every Monday." },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-body text-foreground">{item.label}</p>
              <p className="text-xs font-body text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings[item.key] ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[item.key] ? "left-5" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Access Control */}
      <div className="surface-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-body font-medium text-foreground">Access Control</h2>
        </div>
        {[
          { key: "requireInviteCode" as const, label: "Require invite code", desc: "New members must have a valid invite code to register." },
          { key: "openRegistration" as const, label: "Open registration", desc: "Allow anyone to sign up without an invite code." },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-body text-foreground">{item.label}</p>
              <p className="text-xs font-body text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings[item.key] ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[item.key] ? "left-5" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* SuperAdmin only */}
      {isSuperAdmin && (
        <div className="surface-card p-5 flex flex-col gap-4 border border-destructive/20">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-body font-medium text-foreground">System</h2>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-body text-foreground">Maintenance mode</p>
              <p className="text-xs font-body text-muted-foreground">Temporarily disable the platform for all members.</p>
            </div>
            <button
              onClick={() => toggle("maintenanceMode")}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? "bg-destructive" : "bg-muted"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? "left-5" : "left-1"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
