import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Shield, Lock, Globe, ChevronRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UpdateSettingsInput } from "@thetribe/shared";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Settings = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // These will map to the backend `UserSettings` model.
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailDigest: true,
  });

  const [darkMode, setDarkMode] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<"everyone" | "connections" | "hidden">("connections");
  const [showPassword, setShowPassword] = useState(false);

  // Note: user.settings holds the existing state if the backend includes it
  useEffect(() => {
    if (user && (user as any).settings) {
      const s = (user as any).settings;
      setNotifications({ pushNotifications: s.pushNotifications, emailDigest: s.emailDigest });
      setDarkMode(s.darkMode);
      setShowOnlineStatus(s.showOnlineStatus ?? true);
      setTwoFactorEnabled(s.twoFactorEnabled ?? false);
      setProfileVisibility(s.profileVisibility ?? "connections");
    }
  }, [user]);

  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (vars: UpdateSettingsInput) => {
      const res = await api.patch("/users/me/settings", vars);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }); // Example cache bust
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const ToggleSwitch = ({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void, disabled?: boolean }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-primary" : "bg-muted"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform duration-200 ${enabled ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
      />
    </button>
  );

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications((p) => ({ ...p, [key]: newValue }));
    updateSettings({ [key]: newValue });
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    updateSettings({ darkMode: newValue });
    // Global dark mode toggle logic goes here...
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl relative">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <h1 className="font-display text-foreground text-2xl lg:text-3xl">Settings</h1>
        <p className="text-muted-foreground text-sm font-body mt-1">Manage your preferences and privacy.</p>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.05 }}
        className="surface-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border">
          <p className="section-label">Account</p>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-foreground font-medium">Email</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-body text-foreground font-medium">Password</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">
                  {showPassword ? "••••••••••" : "Click to view status"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              className="text-primary text-xs font-body font-medium hover:underline"
            >
              Toggle
            </button>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-body text-foreground font-medium">Two-Factor Auth</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">Extra layer of security for your account.</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={twoFactorEnabled}
              onToggle={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                updateSettings({ twoFactorEnabled: !twoFactorEnabled });
              }}
              disabled={isPending}
            />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.1 }}
        className="surface-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <p className="section-label">Notifications</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { key: "pushNotifications" as const, label: "Push Notifications", desc: "Reminders across mobile devices" },
            { key: "emailDigest" as const, label: "Email Digest", desc: "Weekly summary of events" },
          ].map((item) => (
            <div key={item.key} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-body text-foreground font-medium">{item.label}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch
                enabled={notifications[item.key]}
                onToggle={() => handleNotificationToggle(item.key)}
                disabled={isPending}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.15 }}
        className="surface-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Moon className="w-4 h-4 text-muted-foreground" />
          <p className="section-label">Appearance</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-body text-foreground font-medium">Dark Mode</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">Use dark theme across the app</p>
          </div>
          <ToggleSwitch enabled={darkMode} onToggle={handleDarkModeToggle} disabled={isPending} />
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.2 }}
        className="surface-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <p className="section-label">Privacy</p>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-4">
            <p className="text-sm font-body text-foreground font-medium mb-3">Profile Visibility</p>
            <div className="flex flex-wrap gap-2">
              {(["everyone", "connections", "hidden"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setProfileVisibility(opt);
                    updateSettings({ profileVisibility: opt });
                  }}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors disabled:opacity-50 ${profileVisibility === opt
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {opt === "everyone" ? (
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" />Everyone</span>
                  ) : opt === "connections" ? (
                    <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" />Connections</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><EyeOff className="w-3 h-3" />Hidden</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-foreground font-medium">Online Status</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">Show others when you are actively using the app.</p>
            </div>
            <ToggleSwitch
              enabled={showOnlineStatus}
              onToggle={() => {
                setShowOnlineStatus(!showOnlineStatus);
                updateSettings({ showOnlineStatus: !showOnlineStatus });
              }}
              disabled={isPending}
            />
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.25 }}
        className="surface-card overflow-hidden mt-4"
      >
        <div className="px-5 py-4">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm font-body font-medium hover:bg-destructive/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
