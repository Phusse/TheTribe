import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Crown } from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { useAuth, UserRole } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const roles: { id: UserRole; label: string; description: string; icon: typeof Users; route: string }[] = [
  { id: "member", label: "Member", description: "Access training, sessions, and community", icon: Users, route: "/dashboard" },
  { id: "admin", label: "Admin", description: "Manage content, invites, and members", icon: Shield, route: "/admin" },
  { id: "superadmin", label: "SuperAdmin", description: "Full platform control and oversight", icon: Crown, route: "/admin" },
];

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = roles.find((r) => r.id === selectedRole)!;
    setUser({
      id: "1",
      firstName: "Marcus",
      lastName: "Johnson",
      email: form.email || "marcus@example.com",
      role: selectedRole,
      isActive: true,
    });
    navigate(chosen.route);
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(46_65%_52%_/_0.03)_0%,_transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={vaultTransition}
        className="w-full max-w-sm flex flex-col gap-8 relative z-10"
      >
        <div className="text-center flex flex-col items-center">
          <img src={tribeLogo} alt="The Tribe" className="w-20 h-20 object-contain mb-4" />
          <h1 className="font-display text-foreground text-2xl">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-2 font-body">Sign in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email" required value={form.email} onChange={update("email")}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors"
          />
          <input
            type="password" placeholder="Password" required value={form.password} onChange={update("password")}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors"
          />

          {/* Role Selection */}
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Sign in as</p>
            <div className="flex flex-col gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/20"
                  }`}
                >
                  <role.icon className={`w-4 h-4 shrink-0 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body font-medium ${selectedRole === role.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {role.label}
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground">{role.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedRole === role.id ? "border-primary" : "border-muted-foreground/30"
                  }`}>
                    {selectedRole === role.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all duration-200 mt-2"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground/50 text-xs font-body flex items-center gap-1.5 mx-auto hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to landing
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
