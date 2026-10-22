import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded-full">
            Operations Support Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-1">
            Author Support Queue
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => { setPriority(''); setStatus(''); setCategory(''); }}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            !priority && !status && !category
              ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          All Tickets ({pagination.total})
        </button>
        <button
          onClick={() => handlePillFilter('priority', 'Critical')}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            priority === 'Critical'
              ? 'bg-rose-700 text-white border-rose-800 shadow-2xs'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/70'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Critical Urgency
        </button>
        <button
          onClick={() => handlePillFilter('status', 'Open')}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            status === 'Open'
              ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          Open / Untriaged
        </button>
        <button
          onClick={() => handlePillFilter('category', 'Royalty & Payments')}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            category === 'Royalty & Payments'
              ? 'bg-indigo-900 text-white border-indigo-950 shadow-2xs'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Royalty Queries
        </button>
        <button
          onClick={() => handlePillFilter('category', 'ISBN & Metadata Issues')}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            category === 'ISBN & Metadata Issues'
              ? 'bg-indigo-900 text-white border-indigo-950 shadow-2xs'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          ISBN Mismatches
        </button>
        <button
          onClick={() => handlePillFilter('category', 'Printing & Quality')}
          className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            category === 'Printing & Quality'
              ? 'bg-indigo-900 text-white border-indigo-950 shadow-2xs'
              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Print Defects
        </button>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by subject, ticket #, author, book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
            />
          </form>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-500 font-medium">Sorting Order:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs border border-neutral-300 rounded-xl px-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 font-semibold"
            >
              <option value="urgent_first">Urgency First (Critical & High Unresolved)</option>
              <option value="newest">Newest Created First</option>
              <option value="oldest">Oldest Created First</option>
              <option value="last_updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-100 text-xs">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-neutral-300 rounded-xl p-2 bg-white text-neutral-700"
          >
            <option value="">Status: All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-neutral-300 rounded-xl p-2 bg-white text-neutral-700"
          >
            <option value="">Priority: All Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-neutral-300 rounded-xl p-2 bg-white text-neutral-700"
          >
            <option value="">Department: All 6 Categories</option>
            <option value="Royalty & Payments">Royalty & Payments</option>
            <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
            <option value="Printing & Quality">Printing & Quality</option>
            <option value="Distribution & Availability">Distribution & Availability</option>
            <option value="Book Status & Production Updates">Book Status & Production Updates</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>
      </div>

      {/* Ticket Queue List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No support tickets match filters"
          description="Try clearing search query or loosening status/priority filters."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearch('');
            setStatus('');
            setPriority('');
            setCategory('');
            setSort('urgent_first');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ticket #</th>
                  <th className="px-5 py-3.5">Author & Catalog Context</th>
                  <th className="px-5 py-3.5">Inquiry Subject</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Lead</th>
                  <th className="px-5 py-3.5 text-right">Activity</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tickets.map((t) => {
                  const isCritical = t.priority === 'Critical';
                  const isHigh = t.priority === 'High';
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-neutral-50/90 transition-colors ${
                        isCritical ? 'bg-rose-50/40' : isHigh ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-neutral-800 whitespace-nowrap">
                        {t.ticket_number}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-neutral-900">{t.author_name}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                          {t.book_title || 'General Account'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-neutral-900 max-w-xs truncate">
                          {t.subject}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <CategoryBadge category={t.category} />
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={t.priority} />
                        {t.is_priority_overridden && (
                          <span className="text-[9px] text-indigo-700 block mt-0.5 font-bold uppercase tracking-wider">Overridden</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {t.assigned_admin_name ? (
                          <span className="font-medium text-neutral-800">{t.assigned_admin_name}</span>
                        ) : (
                          <span className="text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-neutral-400 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 text-neutral-600">
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3 text-neutral-400" />
                            {t.message_count || 0}
                          </span>
                          {t.note_count > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                              <FileText className="w-3 h-3" />
                              {t.note_count}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1">
                          {new Date(t.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link to={`/admin/tickets/${t.id}`}>
                          <Button size="sm" variant="secondary" className="group">
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
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
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
