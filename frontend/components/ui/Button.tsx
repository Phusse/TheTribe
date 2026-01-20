import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-tribe-gold text-black hover:bg-[#bfa030] focus:ring-tribe-gold",
        secondary: "bg-tribe-gray text-white hover:bg-[#2a2a2a] focus:ring-tribe-gray",
        outline: "border border-tribe-gold text-tribe-gold hover:bg-tribe-gold/10 focus:ring-tribe-gold",
        ghost: "text-tribe-light hover:bg-white/5 focus:ring-white/20",
    };

    const sizes = {
        sm: "h-7 px-2.5 text-xs rounded",
        md: "h-9 px-4 text-sm rounded",
        lg: "h-10 px-5 text-base rounded",
    };

    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
