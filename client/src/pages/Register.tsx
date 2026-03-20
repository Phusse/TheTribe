import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RegisterSchema } from "@thetribe/shared";
import { z } from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", inviteCode: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean form defaults and validate via Zod
      const payload = {
        ...form,
        inviteCode: form.inviteCode.trim() === "" ? undefined : form.inviteCode.trim()
      };
      RegisterSchema.parse(payload);

      // Register the account
      const res = await api.post("/auth/register", payload);
      const { user, accessToken, refreshToken } = res.data;

      // Automatically log them in since the backend issues tokens on success
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      // Take them to the pledge screen, but dashboard is fine since user context updates will propagate
      navigate("/pledge");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to register account");
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={vaultTransition}
        className="w-full max-w-sm flex flex-col gap-8"
      >
        <div className="text-center">
          <h1 className="font-display text-foreground text-3xl text-balance">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-2 font-body">Your journey begins here.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text" placeholder="First name" required value={form.firstName} onChange={update("firstName")} disabled={loading}
              className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
            <input
              type="text" placeholder="Last name" required value={form.lastName} onChange={update("lastName")} disabled={loading}
              className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
          </div>
          <input
            type="email" placeholder="Email" required value={form.email} onChange={update("email")} disabled={loading}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <input
            type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={update("password")} disabled={loading}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <input
            type="text" placeholder="Invite Code (optional)" value={form.inviteCode} onChange={update("inviteCode")} disabled={loading}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors disabled:opacity-50 uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold hover:brightness-110 transition-all duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Continue"}
          </button>
        </form>

        <p className="text-muted-foreground/40 text-xs text-center font-body">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary hover:underline" disabled={loading}>Sign in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
