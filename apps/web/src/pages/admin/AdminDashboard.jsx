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

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await api.getAdminDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load operational metrics');
      } finally {
        setIsLoading(false);
      }
    }
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
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load admin metrics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { metrics, priority_distribution, category_distribution, oldest_urgent_tickets } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            BookLeaf Editorial Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            Operations & Triage Command
          </h1>
          <p className="text-sm text-slate-500 font-medium">
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
          <div className="flex items-center justify-between text-slate-500 mb-2">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Open Inquiries</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.open_tickets}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Awaiting staff triage or assignment</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">In Progress</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.in_progress_tickets}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Under active team investigation</p>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono tracking-tight">
            {metrics.resolved_tickets}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Successfully completed queries</p>
        </div>
      </div>

      {/* Priority and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Priority Distribution
          </h2>
          <div className="space-y-3.5">
            {[
              { label: 'Critical', count: priority_distribution.Critical, color: 'bg-rose-600', text: 'text-rose-700' },
              { label: 'High', count: priority_distribution.High, color: 'bg-orange-500', text: 'text-orange-700' },
              { label: 'Medium', count: priority_distribution.Medium, color: 'bg-amber-400', text: 'text-amber-700' },
              { label: 'Low', count: priority_distribution.Low, color: 'bg-slate-400', text: 'text-slate-600' }
            ].map((p) => {
              const pct = metrics.total_tickets > 0 ? (p.count / metrics.total_tickets) * 100 : 0;
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={`font-semibold ${p.text}`}>{p.label}</span>
                    <span className="font-bold text-slate-800 font-mono">{p.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Department Inquiries (AI Auto-Classified)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(category_distribution).map(([cat, count]) => (
              <div key={cat} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate pr-2">{cat}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white text-indigo-950 border border-slate-200 shrink-0 shadow-2xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oldest Urgent Unresolved Tickets */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Oldest Urgent Unresolved Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
          <div className="p-8 text-center text-xs text-slate-500">
            No urgent unresolved tickets currently in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {oldest_urgent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/admin/tickets/${t.id}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors block"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-slate-700">Author: {t.author_name}</span>
                    {t.book_title && (
                      <span className="text-xs text-slate-500 italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{t.subject}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                  <span className="text-rose-700 font-semibold">
                    Waiting since {new Date(t.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
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
