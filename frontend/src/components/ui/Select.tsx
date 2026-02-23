import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Выберите...',
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-4 py-3 border-2 rounded-xl text-left flex items-center justify-between transition-all ${
                    disabled
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isOpen
                        ? 'border-purple-500 bg-white shadow-lg'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                }`}
            >
                <span className={selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? 'transform rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-purple-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all ${
                                option.value === value
                                    ? 'bg-purple-50 text-purple-700 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span>{option.label}</span>
                            {option.value === value && (
                                <Check className="w-5 h-5 text-purple-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
