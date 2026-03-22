import { motion } from "framer-motion";

const vaultTransition = { duration: 0.5, ease: [0.2, 0, 0, 1] as const };

const Maintenance = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={vaultTransition}
                className="relative flex flex-col items-center gap-6 max-w-sm"
            >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <svg
                        className="w-7 h-7 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.96-4.994a3.75 3.75 0 0 0-5.03 5.03"
                        />
                    </svg>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-foreground text-3xl">Under Maintenance</h1>
                    <p className="text-muted-foreground text-sm font-body leading-relaxed">
                        The Tribe is temporarily offline while we make improvements. Please check back shortly.
                    </p>
                </div>

                {/* Divider */}
                <div className="w-12 h-px bg-primary/20" />

                {/* Status note */}
                <p className="text-muted-foreground/50 text-xs font-body">
                    If you're an administrator,{" "}
                    <a href="/login" className="text-primary hover:underline">
                        sign in here
                    </a>
                    .
                </p>
            </motion.div>
        </div>
    );
};

export default Maintenance;
