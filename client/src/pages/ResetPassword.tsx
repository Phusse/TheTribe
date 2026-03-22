import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import tribeLogo from "@/assets/tribe-logo.png";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { ResetPasswordSchema } from "@thetribe/shared";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            ResetPasswordSchema.parse({ token, password });
            await api.post("/auth/reset-password", { email, token, password });
            toast.success("Password reset successfully! You can now log in.");
            navigate("/login");
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0].message);
            } else {
                toast.error(err.message || "Failed to reset password. The link may have expired.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <div className="text-center">
                    <h1 className="text-xl text-foreground font-display mb-2">Invalid Reset Link</h1>
                    <p className="text-sm text-muted-foreground font-body mb-6">This password reset link is malformed or invalid.</p>
                    <button onClick={() => navigate("/forgot-password")} className="text-primary hover:underline text-sm font-body">
                        Request a new link
                    </button>
                </div>
            </div>
        );
    }

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
                    <h1 className="font-display text-foreground text-2xl">New Password</h1>
                    <p className="text-muted-foreground text-sm mt-2 font-body">
                        Enter a new password for <br /><span className="text-primary">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="auth-input disabled:opacity-50"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="auth-input disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-[0.1em] hover:brightness-110 transition-all duration-200 mt-2 disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <button
                    onClick={() => navigate("/login")}
                    className="text-muted-foreground/50 text-xs font-body flex items-center justify-center gap-1.5 hover:text-muted-foreground transition-colors mt-4"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Cancel and return to login
                </button>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
