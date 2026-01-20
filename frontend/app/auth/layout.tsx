import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />

            <div className="w-full max-w-sm z-10">
                {children}
            </div>

            <footer className="absolute bottom-6 text-xs text-tribe-light/20">
                &copy; {new Date().getFullYear()} TheTribe.
            </footer>
        </div>
    );
}
