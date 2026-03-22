import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { ForgotPasswordSchema } from "@thetribe/shared";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            ForgotPasswordSchema.parse({ email });
            await api.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("Recovery email sent!");
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0].message);
            } else {
                toast.error(err.message || "Failed to process request");
            }
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="font-display text-foreground text-2xl">Recover Account</h1>
                    <p className="text-muted-foreground text-sm mt-2 font-body">
                        {sent ? "Check your inbox for the reset link." : "Enter your email to receive a password reset link."}
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="auth-input disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all duration-200 mt-2 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all duration-200 mt-2"
                    >
                        Return to Login
                    </button>
                )}

                <button
                    onClick={() => navigate("/login")}
                    className="text-muted-foreground/50 text-xs font-body flex items-center justify-center gap-1.5 hover:text-muted-foreground transition-colors mt-4"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to login
                </button>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
