import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
    const baseStyle = "w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base";

    const variants = {
        primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0",
        outline: "border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md",
        ghost: "text-slate-600 hover:text-blue-600 hover:bg-white/50",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <span className="animate-spin">⌛</span> : children}
        </button>
    );
};