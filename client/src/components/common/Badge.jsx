import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
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

