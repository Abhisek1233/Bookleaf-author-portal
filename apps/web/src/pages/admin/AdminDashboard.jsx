import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/EmptyState.jsx';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load operational metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/3 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-base">Unable to load admin metrics</p>
          <p className="text-sm mt-1 text-rose-700">{error}</p>
        </div>
        <Button variant="secondary" onClick={loadDashboard} className="shrink-0 min-h-[44px]">
          Try again
        </Button>
      </div>
    );
  }

  const { metrics, priority_distribution, category_distribution, oldest_urgent_tickets } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-3 py-0.5 rounded-full uppercase tracking-wider">
            BookLeaf Editorial Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1.5 tracking-tight">
            Operations & Triage Command
          </h1>
          <p className="text-sm text-stone-500 font-medium">
            Live queue workload, author inquiries, and AI classification analytics.
          </p>
        </div>

        <Link to="/admin/tickets">
          <Button variant="primary" icon={Inbox}>
            Open Support Queue ({metrics.open_tickets + metrics.in_progress_tickets} Active)
          </Button>
        </Link>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgent Unresolved */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-600" />
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" /> Urgent Unresolved
            </span>
          </div>
          <div className="text-3xl font-bold text-rose-700 font-mono tracking-tight">
            {metrics.urgent_unresolved_tickets}
          </div>
          <p className="text-xs text-rose-600/90 mt-1 font-medium">Critical / High priority tickets</p>
        </div>

        {/* Open Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Open Inquiries</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.open_tickets}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">Awaiting staff triage or assignment</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">In Progress</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-700 font-mono tracking-tight">
            {metrics.in_progress_tickets}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">Under active investigation</p>
        </div>

        {/* Resolved Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Resolved Overall</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono tracking-tight">
            {metrics.resolved_tickets}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">Successfully processed inquiries</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Urgency & Priority Distribution
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: priority_distribution.Critical, color: 'bg-rose-500', text: 'text-rose-700' },
              { label: 'High', count: priority_distribution.High, color: 'bg-orange-500', text: 'text-orange-700' },
              { label: 'Medium', count: priority_distribution.Medium, color: 'bg-amber-400', text: 'text-amber-700' },
              { label: 'Low', count: priority_distribution.Low, color: 'bg-stone-400', text: 'text-stone-600' }
            ].map((p) => {
              const pct = metrics.total_tickets > 0 ? (p.count / metrics.total_tickets) * 100 : 0;
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={`font-semibold ${p.text}`}>{p.label}</span>
                    <span className="font-bold text-slate-800 font-mono">{p.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Department Inquiries (AI Auto-Classified)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(category_distribution).map(([cat, count]) => (
              <div key={cat} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate pr-2">{cat}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white text-indigo-950 border border-stone-200 shrink-0 shadow-2xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oldest Urgent Unresolved Tickets */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Oldest Urgent Unresolved Inquiries
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Surfaced by operational triage urgency score (Critical/High and oldest created)
            </p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            All Queue Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {oldest_urgent_tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No urgent unresolved tickets currently in queue.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {oldest_urgent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/admin/tickets/${t.id}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors block"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-slate-700">Author: {t.author_name}</span>
                    {t.book_title && (
                      <span className="text-xs text-stone-500 font-serif italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug" title={t.subject}>{t.subject}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500 shrink-0">
                  <span className="text-rose-800 font-semibold font-mono">
                    Waiting since {new Date(t.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-indigo-700 font-bold bg-indigo-50 px-3.5 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 min-h-[40px]">
                    Triage →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
