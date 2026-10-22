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
        <Skeleton className="h-14 w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
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
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
            BookLeaf Operational Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-1">
            Operations & Triage Overview
          </h1>
          <p className="text-sm text-neutral-500">
            Real-time queue analytics, urgent author inquiries, and AI classification workload.
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
        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-600" />
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" /> Urgent Unresolved
            </span>
          </div>
          <div className="text-3xl font-bold text-rose-700 font-serif">
            {metrics.urgent_unresolved_tickets}
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">Critical or High priority needing action</p>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Inquiries</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 font-serif">
            {metrics.open_tickets}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Awaiting staff triage or assignment</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-neutral-900 font-serif">
            {metrics.in_progress_tickets}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Under active team investigation</p>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Tickets</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-800 font-serif">
            {metrics.resolved_tickets}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Successfully handled queries</p>
        </div>
      </div>

      {/* Priority and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
          <h2 className="text-sm font-bold font-serif text-neutral-900 uppercase tracking-wider mb-4">
            Priority Distribution
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: priority_distribution.Critical, color: 'bg-rose-600', text: 'text-rose-700' },
              { label: 'High', count: priority_distribution.High, color: 'bg-orange-500', text: 'text-orange-700' },
              { label: 'Medium', count: priority_distribution.Medium, color: 'bg-amber-400', text: 'text-amber-700' },
              { label: 'Low', count: priority_distribution.Low, color: 'bg-slate-400', text: 'text-slate-600' }
            ].map((p) => {
              const pct = metrics.total_tickets > 0 ? (p.count / metrics.total_tickets) * 100 : 0;
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className={p.text}>{p.label}</span>
                    <span className="font-bold text-neutral-800">{p.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
          <h2 className="text-sm font-bold font-serif text-neutral-900 uppercase tracking-wider mb-4">
            Inquiry Categories (AI Auto-Classified)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(category_distribution).map(([cat, count]) => (
              <div key={cat} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700 truncate pr-2">{cat}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white text-indigo-950 border border-neutral-200 shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oldest Urgent Unresolved Tickets Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Oldest Urgent Unresolved Inquiries
            </h2>
            <p className="text-xs text-neutral-500">
              Surfaced by operational triage urgency score (Critical/High and oldest created)
            </p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            View Complete Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {oldest_urgent_tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No urgent unresolved tickets currently in queue. All high-priority author queries are addressed.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {oldest_urgent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/admin/tickets/${t.id}`}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors block"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-neutral-600">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-medium text-neutral-600">Author: {t.author_name}</span>
                    {t.book_title && (
                      <span className="text-xs text-neutral-500 italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 truncate">{t.subject}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-400 shrink-0">
                  <span className="text-rose-700 font-medium">
                    Waiting since {new Date(t.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
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
