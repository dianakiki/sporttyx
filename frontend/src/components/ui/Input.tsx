import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', disabled, ...props }) => (
    <div className="mb-6">
        <label className={`block text-sm font-semibold mb-2 ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{label}</label>
        <input
            className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all shadow-sm ${
                disabled 
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder:text-slate-400 hover:border-slate-300'
            } ${className}`}
            disabled={disabled}
            {...props}
        />
    </div>
);