import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Briefcase, Calendar, Globe, Phone, Mail, Loader2, Save, X, Camera, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Profile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    occupation: user?.occupation || "",
    location: user?.location || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    profilePhotoUrl: user?.profilePhotoUrl || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Quick validation: must be image and less than 5MB
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, profilePhotoUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.patch("/users/me", formData);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-foreground text-2xl lg:text-3xl">Profile</h1>
            <p className="text-muted-foreground text-sm font-body mt-1">Your identity within the tribe.</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary/20 transition-colors hidden sm:block"
              >
                Edit Profile
              </button>
            )}
            <a
              href="/dashboard/settings"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground md:hidden transition-colors"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...vaultTransition, delay: 0.1 }}
        className="surface-card p-5 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {!isEditing && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {user.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="font-display text-primary text-xl sm:text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              )}
            </div>
          )}
          <div className="flex-1 w-full">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 w-full"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                      {formData.profilePhotoUrl ? (
                        <img src={formData.profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-primary/60">
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold">Upload</span>
                        </div>
                      )}

                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                        <Camera className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-body text-muted-foreground max-w-[200px] text-center sm:text-left">
                        Recommended size: 400x400px. JPG, PNG or GIF (max 5MB).
                      </p>
                      {formData.profilePhotoUrl && (
                        <button
                          onClick={() => setFormData((p) => ({ ...p, profilePhotoUrl: "" }))}
                          className="text-xs flex items-center gap-1.5 text-destructive hover:underline justify-center sm:justify-start"
                        >
                          <Trash className="w-3.5 h-3.5" /> Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="auth-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                      placeholder="First Name *"
                    />
                    <input
                      type="text"
                      className="auth-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                      placeholder="Last Name *"
                    />
                    <input
                      type="text"
                      className="auth-input"
                      value={formData.occupation}
                      onChange={(e) => setFormData((p) => ({ ...p, occupation: e.target.value }))}
                      placeholder="Occupation"
                    />
                    <input
                      type="text"
                      className="auth-input"
                      value={formData.location}
                      onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Location"
                    />
                    <input
                      type="text"
                      className="auth-input sm:col-span-2"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Phone Number"
                    />
                    <textarea
                      className="auth-textarea sm:col-span-2 min-h-[80px]"
                      value={formData.bio}
                      onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateProfile()}
                      disabled={isPending || !formData.firstName || !formData.lastName}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-body text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                    <button
                      onClick={() => {
                        setFormData({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          occupation: user.occupation || "",
                          location: user.location || "",
                          phone: user.phone || "",
                          bio: user.bio || "",
                          profilePhotoUrl: user.profilePhotoUrl || "",
                        });
                        setIsEditing(false);
                      }}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-body text-sm font-medium hover:text-foreground transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-display text-foreground text-xl sm:text-2xl flex justify-center sm:justify-start items-center gap-2">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-muted-foreground text-sm font-body mt-1 uppercase tracking-widest text-[#B59F67]">
                    {user.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: Briefcase, label: "Occupation", value: user.occupation || "Not provided" },
            { icon: MapPin, label: "Location", value: user.location || "Not provided" },
            {
              icon: Calendar,
              label: "Member Since",
              value: user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Unknown"
            },
            { icon: Globe, label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
            { icon: Phone, label: "Phone", value: user.phone || "Not provided" },
            { icon: Mail, label: "Email", value: user.email },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-body text-muted-foreground">{item.label}</p>
                <p className="text-sm font-body text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {!isEditing && user.bio && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground font-body mb-2">Biography</h3>
            <p className="text-sm font-body text-foreground/90 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
          </div>
        )}

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="sm:hidden mt-6 w-full px-6 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-body font-medium hover:bg-primary/20 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
