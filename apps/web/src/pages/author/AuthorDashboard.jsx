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
  AlertCircle
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
        <Skeleton className="h-16 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load dashboard data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { author, metrics, recent_tickets } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-indigo-900 tracking-wider uppercase bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Author Account • ID: {author.id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-2">
            Welcome back, {author.name}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track your book distribution, quarterly royalty earnings, and BookLeaf support communication.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/author/tickets/new">
            <Button variant="primary" icon={PlusCircle}>
              Submit Support Query
            </Button>
          </Link>
          <Link to="/author/books">
            <Button variant="secondary" icon={BookOpen}>
              View My Books
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial & Book Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Titles</span>
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-serif">
            {metrics.total_books}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {metrics.books_in_production > 0 ? `${metrics.books_in_production} in production` : 'All titles live'}
          </p>
        </div>

        {/* Copies Sold */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Copies Sold</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-serif">
            {metrics.total_copies_sold.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Across Amazon, Flipkart & Store</p>
        </div>

        {/* Royalty Earned */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Royalties Earned</span>
            <CreditCard className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-serif">
            <Currency value={metrics.total_royalty_earned} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">80% Net profit share</p>
        </div>

        {/* Royalty Pending */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-serif">
            <Currency value={metrics.royalty_pending} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {metrics.royalty_pending >= 1000
              ? 'Eligible for quarterly disbursement (Threshold: ₹1,000)'
              : 'Rolls over (below ₹1,000 threshold)'}
          </p>
        </div>
      </div>

      {/* Payout Policy Reminder Banner */}
      {metrics.royalty_pending >= 1000 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-semibold">Quarterly Royalty Payout Notice: </span>
            Your pending balance of <Currency value={metrics.royalty_pending} /> meets the ₹1,000 threshold and will be transferred to your linked bank account within 45 days of the quarter ending.
          </div>
        </div>
      )}

      {/* Recent Support Tickets Section */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-neutral-900">Recent Support Queries</h2>
            <p className="text-xs text-neutral-500">Live communication history with BookLeaf Editorial Operations</p>
          </div>
          <Link
            to="/author/tickets"
            className="text-xs font-semibold text-indigo-900 hover:text-indigo-950 flex items-center gap-1"
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
          <div className="divide-y divide-neutral-100">
            {recent_tickets.map((t) => (
              <Link
                key={t.id}
                to={`/author/tickets/${t.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors block"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-medium text-neutral-400">{t.ticket_number}</span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {t.book_title && (
                      <span className="text-xs font-medium text-neutral-500 italic truncate">
                        • {t.book_title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 truncate">{t.subject}</h4>
                </div>

                <div className="text-xs text-neutral-400 shrink-0 text-left sm:text-right">
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
