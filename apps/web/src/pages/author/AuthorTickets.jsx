import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  MessageSquare,
  Clock,
  ArrowRight
} from 'lucide-react';

export function AuthorTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { socket } = useSocket();

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.getAuthorTickets(params);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newTicket) => {
      setTickets((prev) => [newTicket, ...prev]);
    };

    const handleUpdated = (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
      );
    };

    const handleMessage = (msg) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === msg.ticket_id ? { ...t, updated_at: msg.created_at } : t))
      );
    };

    socket.on('ticket:created', handleCreated);
    socket.on('ticket:updated', handleUpdated);
    socket.on('ticket:message', handleMessage);

    return () => {
      socket.off('ticket:created', handleCreated);
      socket.off('ticket:updated', handleUpdated);
      socket.off('ticket:message', handleMessage);
    };
  }, [socket]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-3 py-0.5 rounded-full uppercase tracking-wider">
            Communication History
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1.5 tracking-tight">
            My Support Queries
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Track real-time inquiries, production updates, and official BookLeaf Editorial responses.
          </p>
        </div>
        <Link to="/author/tickets/new">
          <Button variant="primary" icon={PlusCircle}>
            Raise New Ticket
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by ticket #, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-stone-50/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No support tickets found"
          description="You do not have any tickets matching the selected filters."
          actionLabel="Submit Query"
          onAction={() => window.location.href = '/author/tickets/new'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/author/tickets/${t.id}`}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors block"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    {t.ticket_number}
                  </span>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <CategoryBadge category={t.category} />
                  {t.book_title && (
                    <span className="text-xs text-stone-500 font-serif italic truncate font-medium">
                      • {t.book_title}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {t.subject}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-400 shrink-0 font-mono">
                <div className="flex items-center gap-1 text-stone-500 font-medium">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.message_count || 0}</span>
                </div>
                <div>
                  Updated {new Date(t.updated_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
