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
  RefreshCw
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

    const handleCreated = () => {
      fetchTickets(pagination.page);
    };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-neutral-900">Support Operations Queue</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Triage, classify, and resolve author queries across BookLeaf Publishing titles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchTickets(pagination.page)}
            icon={RefreshCw}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search subject, ticket #, author, book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
            />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-500 font-medium">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 font-medium"
            >
              <option value="urgent_first">Urgency First (Critical & High Unresolved)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="last_updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-100 text-xs">
          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg p-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-700"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg p-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-700"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg p-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-700"
            >
              <option value="">All 6 Categories</option>
              <option value="Royalty & Payments">Royalty & Payments</option>
              <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
              <option value="Printing & Quality">Printing & Quality</option>
              <option value="Distribution & Availability">Distribution & Availability</option>
              <option value="Book Status & Production Updates">Book Status & Production Updates</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No tickets match filters"
          description="Try broadening your search term or clearing status and category filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatus('');
            setPriority('');
            setCategory('');
            setSort('urgent_first');
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/90 border-b border-neutral-200/80 font-semibold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Ticket #</th>
                  <th className="px-4 py-3">Author & Book</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3 text-right">Activity</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tickets.map((t) => {
                  const isCritical = t.priority === 'Critical';
                  const isHigh = t.priority === 'High';
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isCritical ? 'bg-rose-50/30' : isHigh ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-neutral-700 whitespace-nowrap">
                        {t.ticket_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-neutral-900">{t.author_name}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                          {t.book_title || 'General Account'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-neutral-900 max-w-sm truncate">
                          {t.subject}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={t.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={t.priority} />
                        {t.is_priority_overridden && (
                          <span className="text-[9px] text-indigo-700 block mt-0.5 font-bold uppercase">Overridden</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600">
                        {t.assigned_admin_name || (
                          <span className="text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-neutral-400 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span className="flex items-center gap-0.5 text-neutral-500">
                            <MessageSquare className="w-3 h-3" />
                            {t.message_count || 0}
                          </span>
                          {t.note_count > 0 && (
                            <span className="flex items-center gap-0.5 text-indigo-700 bg-indigo-50 px-1 rounded">
                              <FileText className="w-3 h-3" />
                              {t.note_count}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {new Date(t.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link to={`/admin/tickets/${t.id}`}>
                          <Button size="sm" variant="secondary">
                            Triage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Showing {tickets.length} of {pagination.total} tickets (Page {pagination.page} of {pagination.total_pages})
            </div>
            <div className="flex items-center gap-1.5">
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
