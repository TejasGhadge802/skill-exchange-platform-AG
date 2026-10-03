import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    primary: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const statusMap = {
    draft: 'default',
    pending_approval: 'warning',
    approved: 'success',
    provider_selected: 'info',
    payment_pending: 'warning',
    in_progress: 'purple',
    completed: 'success',
    cancelled: 'danger',
    rejected: 'danger',
    enrolled: 'success',
    pending: 'warning',
    shortlisted: 'info',
    accepted: 'success',
  };

  const selectedVariant = statusMap[variant] || variantStyles[variant] ? (statusMap[variant] || variant) : 'default';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        variantStyles[selectedVariant] || variantStyles.default
      } ${className}`}
    >
      {children || variant.replace(/_/g, ' ')}
    </span>
  );
};

export default Badge;

