import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    'Open': 'bg-amber-50 text-amber-950 border-amber-300',
    'In Progress': 'bg-indigo-50 text-indigo-950 border-indigo-300',
    'Resolved': 'bg-emerald-50 text-emerald-950 border-emerald-300',
    'Closed': 'bg-stone-100 text-stone-800 border-stone-300'
  };

  const dots = {
    'Open': 'bg-amber-600',
    'In Progress': 'bg-indigo-700',
    'Resolved': 'bg-emerald-600',
    'Closed': 'bg-stone-500'
  };

  const style = styles[status] || 'bg-stone-100 text-stone-800 border-stone-300';
  const dot = dots[status] || 'bg-stone-500';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    'Critical': 'bg-rose-50 text-rose-950 border-rose-300 font-bold',
    'High': 'bg-orange-50 text-orange-950 border-orange-300 font-semibold',
    'Medium': 'bg-amber-50 text-amber-950 border-amber-300 font-medium',
    'Low': 'bg-stone-100 text-stone-800 border-stone-300 font-medium'
  };

  const dots = {
    'Critical': 'bg-rose-600',
    'High': 'bg-orange-600',
    'Medium': 'bg-amber-600',
    'Low': 'bg-stone-500'
  };

  const style = styles[priority] || 'bg-stone-100 text-stone-800 border-stone-300';
  const dot = dots[priority] || 'bg-stone-500';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} aria-hidden="true" />
      <span>{priority}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200">
      {category}
    </span>
  );
}
