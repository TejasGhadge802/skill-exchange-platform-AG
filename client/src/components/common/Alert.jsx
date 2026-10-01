import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', message, title, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${current.bg} ${className}`} role="alert">
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;

