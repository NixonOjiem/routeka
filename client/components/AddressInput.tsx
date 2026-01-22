
import React from 'react';
import { MapPin, Search, AlertCircle } from 'lucide-react';

interface AddressInputProps {
  label: string;
  iconColor?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  label,
  iconColor = 'text-brand',
  placeholder,
  value,
  onChange,
  error,
  className
}) => {
  const inputClasses = `
    w-full pl-11 pr-5 py-4 border rounded-xl outline-none transition-all 
    ${error 
      ? 'border-rose-500 bg-rose-50 focus:ring-rose-200' 
      : 'border-stone-200 bg-stone-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white'}
    text-stone-800 placeholder:text-stone-400
  `;

  return (
    <div className={`relative space-y-2 ${className}`}>
      <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1 ${error ? 'text-rose-500' : 'text-stone-500'}`}>
        <MapPin className={`w-3 h-3 ${error ? 'text-rose-500' : iconColor}`} /> {label}
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Search className="w-4 h-4 text-stone-300" />
        </div>
        
        <input 
          type="text" 
          autoComplete="off"
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      
      {error && (
        <p className="text-rose-500 text-xs ml-1 flex items-center gap-1.5 animate-fade-in-up">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};
