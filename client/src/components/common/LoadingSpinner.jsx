import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-slate-500 gap-3 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizes[size] || sizes.md}`} />
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;

