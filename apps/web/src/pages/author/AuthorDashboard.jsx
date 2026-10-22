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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Author Account • ID: {author.id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            Welcome back, {author.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Track multi-channel retail distribution, quarterly royalty earnings, and BookLeaf support communication.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Published Titles</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.total_books}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {metrics.books_in_production > 0 ? `${metrics.books_in_production} in production` : 'All titles live'}
          </p>
        </div>

        {/* Copies Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Copies Sold</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics.total_copies_sold.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Amazon, Flipkart & Store</p>
        </div>

        {/* Royalties Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Royalties Earned</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-700 tracking-tight">
            <Currency value={metrics.total_royalty_earned} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">80% Net profit share</p>
        </div>

        {/* Royalty Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-700 tracking-tight">
            <Currency value={metrics.royalty_pending} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {metrics.royalty_pending >= 1000 ? 'Eligible for quarterly payout' : 'Rolls over (< ₹1,000 threshold)'}
          </p>
        </div>
      </div>

      {/* Payout Threshold Progress Meter */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quarterly Payout Eligibility (₹1,000 Minimum Payout Threshold)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accumulated earnings are disbursed via direct bank transfer within 45 days of each quarter ending.
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-800 shrink-0">
            Current Balance: <Currency value={metrics.royalty_pending} /> / ₹1,000
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metrics.royalty_pending >= 1000 ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${thresholdPct}%` }}
          />
        </div>
      </div>

      {/* Recent Support Tickets Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Support Inquiries</h2>
            <p className="text-xs text-slate-500">Live communication history with BookLeaf Editorial Operations</p>
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
          <div className="divide-y divide-slate-100">
            {recent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/author/tickets/${t.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors block"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-500">{t.ticket_number}</span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {t.book_title && (
                      <span className="text-xs text-slate-500 italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{t.subject}</h4>
                </div>

                <div className="text-xs text-slate-400 shrink-0 text-left sm:text-right">
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
