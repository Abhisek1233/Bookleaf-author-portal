import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Currency } from '../../components/common/Currency.jsx';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowRight,
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function AuthorDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await api.getAuthorDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-1/3 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load author dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { author, metrics, recent_tickets } = data;
  const thresholdPct = Math.min(100, Math.round((metrics.royalty_pending / 1000) * 100));

  return (
    <div className="space-y-7">
      {/* Editorial Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-3 py-0.5 rounded-full uppercase tracking-wider">
            Verified Author Record • ID: {author.id}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 mt-2.5 tracking-tight">
            Welcome back, {author.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1 font-medium max-w-xl">
            Track multi-channel retail distribution, quarterly royalty earnings, and BookLeaf support communication.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link to="/author/tickets/new">
            <Button variant="primary" icon={PlusCircle}>
              Submit Query
            </Button>
          </Link>
          <Link to="/author/books">
            <Button variant="secondary" icon={BookOpen}>
              My Books
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Published Titles</span>
            <BookOpen className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.total_books}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {metrics.books_in_production > 0 ? `${metrics.books_in_production} in production` : 'All titles live in catalog'}
          </p>
        </div>

        {/* Copies Sold */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Copies Sold</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.total_copies_sold.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">Amazon, Flipkart & Direct</p>
        </div>

        {/* Total Royalty Earned */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Cumulative Royalties</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-700 tracking-tight font-mono">
            <Currency value={metrics.total_royalty_earned} />
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">80% Net profit share</p>
        </div>

        {/* Royalty Pending */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-700 tracking-tight font-mono">
            <Currency value={metrics.royalty_pending} />
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {metrics.royalty_pending >= 1000 ? 'Eligible for quarterly payout' : 'Rolls over (< ₹1,000 threshold)'}
          </p>
        </div>
      </div>

      {/* Payout Threshold Progress Meter */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quarterly Payout Eligibility (₹1,000 Minimum Payout Threshold)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Accumulated earnings are disbursed via direct bank transfer within 45 days of each quarter ending.
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-stone-100 text-slate-800 shrink-0">
            Current Balance: <Currency value={metrics.royalty_pending} /> / ₹1,000
          </span>
        </div>

        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metrics.royalty_pending >= 1000 ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${thresholdPct}%` }}
          />
        </div>

        {/* Expandable Quarterly Disbursement Calendar */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>{showSchedule ? 'Hide Payout Calendar' : 'View 2026 Quarterly Payout Calendar'}</span>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
              {showSchedule ? '▲' : '▼'}
            </span>
          </button>
          <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
            Direct Bank Transfer (NEFT / IMPS)
          </span>
        </div>

        {showSchedule && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { q: 'Q1 Payout', cycle: 'Jan 1 – Mar 31', date: 'May 15', status: 'Closed' },
              { q: 'Q2 Payout', cycle: 'Apr 1 – Jun 30', date: 'Aug 15', status: 'Processing' },
              { q: 'Q3 Payout', cycle: 'Jul 1 – Sep 30', date: 'Nov 15', status: 'Next Cycle', active: true },
              { q: 'Q4 Payout', cycle: 'Oct 1 – Dec 31', date: 'Feb 15', status: 'Upcoming' }
            ].map((cycle) => (
              <div
                key={cycle.q}
                className={`p-3.5 rounded-2xl border text-xs ${
                  cycle.active
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium'
                    : 'bg-stone-50/80 border-stone-200 text-stone-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{cycle.q}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      cycle.active
                        ? 'bg-indigo-700 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cycle.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">{cycle.cycle}</div>
                <div className="font-bold text-slate-900 mt-1 font-mono">Disbursed by: {cycle.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Support Tickets Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">Recent Support Inquiries</h2>
            <p className="text-xs text-stone-500">Live communication history with BookLeaf Editorial Operations</p>
          </div>
          <Link
            to="/author/tickets"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets opened"
            description="Have a question about your royalties, ISBN, or print quality? Submit a ticket and our team will respond promptly."
            actionLabel="Submit Query"
            onAction={() => window.location.href = '/author/tickets/new'}
          />
        ) : (
          <div className="divide-y divide-stone-100">
            {recent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/author/tickets/${t.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors block"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-stone-500">{t.ticket_number}</span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {t.book_title && (
                      <span className="text-xs text-stone-500 font-serif italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{t.subject}</h4>
                </div>

                <div className="text-xs text-stone-400 shrink-0 text-left sm:text-right font-mono">
                  Updated {new Date(t.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
