import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration — navigate to pledge
    navigate("/pledge");
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
              type="text" placeholder="First name" required value={form.firstName} onChange={update("firstName")}
              className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
            />
            <input
              type="text" placeholder="Last name" required value={form.lastName} onChange={update("lastName")}
              className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <input
            type="email" placeholder="Email" required value={form.email} onChange={update("email")}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
          />
          <input
            type="password" placeholder="Password" required value={form.password} onChange={update("password")}
            className="bg-card border border-border rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold hover:brightness-110 transition-all duration-200 mt-2"
          >
            Continue
          </button>
        </form>

        <p className="text-muted-foreground/40 text-xs text-center font-body">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
