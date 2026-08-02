import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  let colorClasses = '';
  let labelText = normalized;

  switch (normalized) {
    case 'confirmed':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-200';
      labelText = 'confirmed';
      break;
    case 'processing':
      colorClasses = 'bg-indigo-100 text-indigo-800 border-indigo-200';
      labelText = 'processing';
      break;
    case 'shipped':
    case 'in transit':
    case 'in_transit':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-200';
      labelText = 'in transit';
      break;
    case 'out for delivery':
    case 'out_for_delivery':
      colorClasses = 'bg-orange-100 text-orange-800 border-orange-200';
      labelText = 'out for delivery';
      break;
    case 'delivered':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-250';
      labelText = 'delivered';
      break;
    case 'cancelled':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-250';
      labelText = 'cancelled';
      break;
    case 'returned':
      colorClasses = 'bg-purple-100 text-purple-800 border-purple-200';
      labelText = 'returned';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center justify-center w-36 h-8 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${colorClasses}`}>
      {labelText}
    </span>
  );
}
