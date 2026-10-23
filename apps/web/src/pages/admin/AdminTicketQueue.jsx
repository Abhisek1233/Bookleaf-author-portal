import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import {
  Inbox,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  RefreshCw,
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

export function AdminTicketQueue() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('urgent_first');

  const { socket } = useSocket();

  const fetchTickets = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10, sort };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const res = await api.getAdminTickets(params);
      setTickets(res.data.tickets || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, total_pages: 1 });
    } catch (err) {
      console.error('Failed to load tickets queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [status, priority, category, sort]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => fetchTickets(pagination.page);
    const handleUpdated = (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
    };

    socket.on('ticket:created', handleCreated);
    socket.on('ticket:updated', handleUpdated);

    return () => {
      socket.off('ticket:created', handleCreated);
      socket.off('ticket:updated', handleUpdated);
    };
  }, [socket, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets(1);
  };

  const handlePillFilter = (filterType, value) => {
    if (filterType === 'priority') {
      setPriority(priority === value ? '' : value);
    } else if (filterType === 'status') {
      setStatus(status === value ? '' : value);
    } else if (filterType === 'category') {
      setCategory(category === value ? '' : value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-0.5 rounded-full">
            Operations Support Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1.5 tracking-tight">
            Author Support Queue
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Real-time triage queue with AI priority scoring, SLA timers, and grounded responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchTickets(pagination.page)}
            icon={RefreshCw}
          >
            Sync Queue
          </Button>
        </div>
      </div>

      {/* Quick Triage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <button
          onClick={() => { setPriority(''); setStatus(''); setCategory(''); }}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            !priority && !status && !category
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Tickets ({pagination.total})
        </button>
        <button
          onClick={() => handlePillFilter('priority', 'Critical')}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[40px] ${
            priority === 'Critical'
              ? 'bg-rose-700 text-white border-rose-700 shadow-2xs font-bold'
              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Critical Urgency
        </button>
        <button
          onClick={() => handlePillFilter('status', 'Open')}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[40px] ${
            status === 'Open'
              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
              : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Open / Untriaged
        </button>
        <button
          onClick={() => handlePillFilter('category', 'Royalty & Payments')}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            category === 'Royalty & Payments'
              ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Royalty Queries
        </button>
        <button
          onClick={() => handlePillFilter('category', 'ISBN & Metadata Issues')}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            category === 'ISBN & Metadata Issues'
              ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          ISBN Mismatches
        </button>
        <button
          onClick={() => handlePillFilter('category', 'Printing & Quality')}
          className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            category === 'Printing & Quality'
              ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Print Quality Reports
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search author, ticket #, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search author support queue"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-stone-50/50 min-h-[44px]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-sm">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter queue by status"
            className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium min-h-[44px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Filter queue by priority"
            className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium min-h-[44px] cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter queue by department"
            className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium min-h-[44px] cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="Royalty & Payments">Royalty & Payments</option>
            <option value="Book Status & Production Updates">Book Status & Production</option>
            <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
            <option value="Distribution & Availability">Distribution & Availability</option>
            <option value="Printing & Quality">Printing & Quality</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort queue orders"
            className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium min-h-[44px] cursor-pointer"
          >
            <option value="urgent_first">Sort: Urgency Score (High First)</option>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Queue is empty"
          description="No inquiries match your current queue filters."
          actionLabel="Reset Queue Filters"
          onAction={() => {
            setSearch('');
            setStatus('');
            setPriority('');
            setCategory('');
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Mobile Stacked Card View (< md) */}
          <div className="block md:hidden divide-y divide-stone-100">
            {tickets.map((t) => {
              const isCritical = t.priority === 'Critical';
              const isHigh = t.priority === 'High';
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  className={`p-4 space-y-3 hover:bg-stone-50/90 transition-colors cursor-pointer ${
                    isCritical ? 'bg-rose-50/30' : isHigh ? 'bg-orange-50/15' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      {t.ticket_number}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{t.author_name}</span>
                      {t.book_title && (
                        <span className="text-xs text-stone-500 font-serif italic truncate max-w-[150px]">
                          {t.book_title}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2 leading-snug" title={t.subject}>
                      {t.subject}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={t.category} />
                      <span className="flex items-center gap-1 font-sans text-stone-600">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                        {t.message_count || 0}
                      </span>
                    </div>
                    <span className="font-sans text-stone-500">
                      {new Date(t.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="pt-1">
                    <Link to={`/admin/tickets/${t.id}`} className="block">
                      <Button size="sm" variant="secondary" className="w-full justify-center min-h-[44px]">
                        Triage Ticket <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar-h max-h-[650px]">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-stone-50/95 text-stone-600 font-semibold border-b border-stone-200 uppercase tracking-wider text-xs sticky top-0 z-10 backdrop-blur">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[110px]">Ticket Ref</th>
                  <th className="px-5 py-3.5 min-w-[160px]">Author & Title</th>
                  <th className="px-5 py-3.5 min-w-[240px]">Subject</th>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[170px]">Category</th>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[130px]">Priority</th>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[120px]">Status</th>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[150px]">Assignee</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap min-w-[100px]">Messages</th>
                  <th className="px-5 py-3.5 text-center sticky right-0 bg-stone-50/95 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-20 whitespace-nowrap">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tickets.map((t) => {
                  const isCritical = t.priority === 'Critical';
                  const isHigh = t.priority === 'High';
                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/admin/tickets/${t.id}`)}
                      className={`hover:bg-stone-50/90 transition-colors min-h-[48px] cursor-pointer group ${
                        isCritical ? 'bg-rose-50/40' : isHigh ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap text-xs">
                        {t.ticket_number}
                      </td>
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="font-bold text-slate-900">{t.author_name}</div>
                        <div className="text-xs text-stone-500 font-serif italic truncate max-w-xs mt-0.5">
                          {t.book_title || 'General Account'}
                        </div>
                      </td>
                      <td className="px-5 py-4 min-w-[240px] max-w-md">
                        <div
                          className="font-medium text-slate-900 line-clamp-2 leading-snug hover:text-indigo-700 transition-colors"
                          title={t.subject}
                        >
                          {t.subject}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap min-w-[170px]">
                        <CategoryBadge category={t.category} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap min-w-[130px]">
                        <PriorityBadge priority={t.priority} />
                        {t.is_priority_overridden && (
                          <span className="text-xs text-indigo-800 block mt-1 font-semibold uppercase tracking-wider">Overridden</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap min-w-[120px]">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap min-w-[150px]">
                        {t.assigned_admin_name ? (
                          <div className="flex items-center gap-2" title={`Assigned to: ${t.assigned_admin_name}`}>
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-700">
                              {t.assigned_admin_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900 text-xs truncate">
                              {t.assigned_admin_name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-stone-500 whitespace-nowrap min-w-[100px]">
                        <div className="flex items-center justify-end gap-2 text-stone-600">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                            {t.message_count || 0}
                          </span>
                          {t.note_count > 0 && (
                            <span className="flex items-center gap-1 text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200 text-xs">
                              <FileText className="w-3.5 h-3.5" />
                              {t.note_count}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-1 font-sans">
                          {new Date(t.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center sticky right-0 bg-white group-hover:bg-stone-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] z-10 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/admin/tickets/${t.id}`}>
                          <Button size="sm" variant="secondary" className="group min-h-[38px]">
                            Triage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing {tickets.length} of {pagination.total} inquiries (Page {pagination.page} of {pagination.total_pages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchTickets(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => fetchTickets(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
