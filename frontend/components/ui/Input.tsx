import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = "",
    ...props
}) => {
    return (
        <div className="w-full space-y-1">
            {label && (
                <label className="block text-xs font-medium text-tribe-light/70">
                    {label}
                </label>
            )}
            <input
                className={`
          flex h-9 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30 
          focus:border-tribe-gold focus:outline-none 
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};
