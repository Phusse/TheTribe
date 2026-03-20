import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { LoginSchema } from "@thetribe/shared";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate locally first via Zod
      LoginSchema.parse(form);

      const res = await api.post("/auth/login", form);
      const { user, accessToken, refreshToken } = res.data;

      // Save tokens in local storage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Re-hydrate context state
      setUser(user);

      // Redirect based on role
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
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
            type="email" placeholder="Email" required value={form.email} onChange={update("email")} disabled={loading}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <input
            type="password" placeholder="Password" required value={form.password} onChange={update("password")} disabled={loading}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-muted-foreground/40 text-xs text-center font-body">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-primary hover:underline">Register</button>
        </p>

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
