import React from 'react';

export default function StatusPill({ status }) {
  const statusStyles = {
    // Appointment / Queue Statuses
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WAITING: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_CONSULTATION: 'bg-teal-50 text-teal-700 border-teal-200 animate-pulse',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Payment Statuses
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',

    // Stock Statuses
    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200 font-bold animate-pulse',
    OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  };

  const style = statusStyles[status?.toUpperCase()] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
