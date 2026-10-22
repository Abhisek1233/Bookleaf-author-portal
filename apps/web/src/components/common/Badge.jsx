import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    'Open': 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    'In Progress': 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-indigo-500/20',
    'Resolved': 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20',
    'Closed': 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20'
  };

  const dots = {
    'Open': 'bg-amber-500',
    'In Progress': 'bg-indigo-600',
    'Resolved': 'bg-emerald-600',
    'Closed': 'bg-slate-500'
  };

  const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const dot = dots[status] || 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    'Critical': 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
    'High': 'bg-orange-50 text-orange-800 border-orange-200 font-medium',
    'Medium': 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
    'Low': 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const style = styles[priority] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${style}`}>
      {priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
      {category}
    </span>
  );
}
