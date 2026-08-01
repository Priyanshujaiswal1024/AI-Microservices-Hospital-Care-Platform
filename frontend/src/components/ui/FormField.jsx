import React from 'react';

export default function FormField({ label, error, children, required = false, hint }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
        </label>
      )}
      {children}
      {error && <span className="text-xs font-medium text-rose-500 animate-fade-in">{error}</span>}
    </div>
  );
}
