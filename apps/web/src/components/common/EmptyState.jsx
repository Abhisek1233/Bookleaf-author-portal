import React from 'react';
import { BookOpen, FolderOpen } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There is currently no data to display matching your criteria.',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-xs my-4 space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-500 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-serif font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-stone-600 max-w-sm leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button onClick={onAction} size="sm" variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-stone-200/70 rounded-2xl ${className}`} />
  );
}
