import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft,
  Send,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Paperclip,
  CheckCircle2,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';

export function AuthorTicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAuthorTicket(ticketId);
      setTicket(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  // Socket.IO real-time sync
  useEffect(() => {
    if (!socket || !ticketId) return;

    socket.emit('ticket:join', ticketId);

    const handleMessage = (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    const handleUpdated = (updatedTicket) => {
      setTicket((prev) => (prev ? { ...prev, ...updatedTicket } : prev));
    };

    socket.on('ticket:message', handleMessage);
    socket.on('ticket:updated', handleUpdated);

    return () => {
      socket.emit('ticket:leave', ticketId);
      socket.off('ticket:message', handleMessage);
      socket.off('ticket:updated', handleUpdated);
    };
  }, [socket, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await api.replyAuthorTicket(ticketId, replyText.trim());
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setReplyText('');
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load ticket details</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/author/tickets" className="inline-block mt-4 text-xs font-semibold text-rose-900 underline">
          ← Return to Support Tickets
        </Link>
      </div>
    );
  }

  const isClosed = ticket.status === 'Closed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/author/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Inquiries
        </Link>
        <span className="text-xs font-mono font-bold text-stone-400">
          Ref: {ticket.ticket_number}
        </span>
      </div>

      {/* Ticket Details Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-left sm:text-right shrink-0 space-y-1">
            <span className="text-[11px] text-stone-400 block font-mono">
              Opened: {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[11px] text-stone-400 block font-mono">
              Last Updated: {new Date(ticket.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Associated Book Banner if Linked */}
        {ticket.book_title && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>
                Linked Publication: <strong className="font-serif">{ticket.book_title}</strong>
              </span>
            </div>
            <Link
              to="/author/books"
              className="text-xs font-bold text-indigo-700 hover:underline"
            >
              View Book Dossier →
            </Link>
          </div>
        )}

        {/* Initial Query Description */}
        <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Original Author Statement:</span>
            <span className="font-mono text-[11px] text-stone-400">Initial Request</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Communication Thread ({messages.length} replies)
        </h3>

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-xs text-stone-500 space-y-2">
            <Clock className="w-6 h-6 text-stone-300 mx-auto" />
            <p className="font-medium text-slate-800">Awaiting Specialist Response</p>
            <p className="max-w-md mx-auto text-stone-500">
              Our editorial operations team has received your ticket and is preparing a response grounded in BookLeaf policies. New replies will appear live.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isAdmin
                      ? 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 border-indigo-200/90 sm:mr-8 shadow-xs'
                      : 'bg-white border-stone-200/90 sm:ml-8 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                          isAdmin
                            ? 'bg-indigo-950 text-white font-serif'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-indigo-300" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {isAdmin ? 'BookLeaf Editorial Operations' : msg.sender_name}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] bg-indigo-900 text-white px-2 py-0.2 rounded-full font-bold uppercase tracking-wider">
                              Verified Staff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 block">
                          {isAdmin ? 'Official Resolution' : 'Author'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-10">
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply Composer */}
      {!isClosed ? (
        <form onSubmit={handleSendReply} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-3">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Reply to BookLeaf Support
          </label>
          <textarea
            rows={4}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response or additional context here..."
            className="w-full text-sm border border-stone-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
          />
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-1">
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Real-time socket sync active. No manual page refresh needed.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSending}
              icon={Send}
            >
              Send Reply
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-stone-100 rounded-2xl p-5 text-center text-xs text-stone-600 border border-stone-200">
          This ticket is Closed. If you need assistance with another matter, please raise a new query.
        </div>
      )}
    </div>
  );
}
