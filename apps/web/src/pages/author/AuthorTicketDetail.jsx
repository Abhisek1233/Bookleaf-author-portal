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
  Award
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

  const isResolved = ticket.status === 'Resolved';
  const isClosed = ticket.status === 'Closed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/author/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Inquiries
        </Link>
        <span className="text-xs font-mono font-bold text-neutral-400">
          Ref: {ticket.ticket_number}
        </span>
      </div>

      {/* Ticket Details Header Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-xs text-neutral-400 space-y-1 sm:text-right shrink-0">
            <div>Submitted {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div>Last Activity {new Date(ticket.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Linked Book Strip */}
        {ticket.book_title ? (
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 text-indigo-950 p-3.5 rounded-2xl text-xs">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />
              <div>
                <span className="font-bold">Catalog Title: </span>
                {ticket.book_title}
                {ticket.book_isbn && <span className="font-mono text-indigo-700 ml-2">({ticket.book_isbn})</span>}
              </div>
            </div>
            {ticket.book_status && (
              <span className="text-[11px] font-semibold bg-white text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {ticket.book_status}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-500 italic bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            Account Level Inquiry
          </div>
        )}

        {/* Original Description */}
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Original Author Query
          </span>
          <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {ticket.attachment_name && (
          <div className="text-xs text-neutral-600 flex items-center gap-2 pt-1 font-mono">
            <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
            <span>Attachment: {ticket.attachment_name}</span>
          </div>
        )}
      </div>

      {/* Resolution Banner */}
      {isResolved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">This query has been marked as Resolved.</span> If you require further clarification, simply reply below and this ticket will reopen automatically.
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-serif text-neutral-900">
          Support Conversation Thread ({messages.length} replies)
        </h3>

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-xs text-neutral-500 space-y-2">
            <Clock className="w-6 h-6 text-neutral-300 mx-auto" />
            <p className="font-medium text-neutral-800">Awaiting Specialist Response</p>
            <p className="max-w-md mx-auto text-neutral-500">
              Our editorial operations team has received your ticket and is preparing a response grounded in BookLeaf policies. New replies will appear live.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isAdmin
                      ? 'bg-gradient-to-br from-indigo-50/80 to-white border-indigo-200/90 sm:mr-8 shadow-xs'
                      : 'bg-white border-neutral-200/90 sm:ml-8 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                          isAdmin
                            ? 'bg-indigo-950 text-white'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-indigo-300" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">
                            {isAdmin ? 'BookLeaf Editorial Operations' : msg.sender_name}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] bg-indigo-900 text-white px-2 py-0.2 rounded-full font-bold uppercase tracking-wider">
                              Verified Staff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block">
                          {isAdmin ? 'Official Resolution' : 'Author'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-neutral-400">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed pl-10">
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
        <form onSubmit={handleSendReply} className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 space-y-3">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Reply to BookLeaf Support
          </label>
          <textarea
            rows={4}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response or additional context here..."
            className="w-full text-sm border border-neutral-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
          />
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-neutral-400">
              ⚡ Real-time updates active. No manual page refresh needed.
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
        <div className="bg-neutral-100 rounded-2xl p-5 text-center text-xs text-neutral-600 border border-neutral-200">
          This ticket is Closed. If you need assistance with another matter, please raise a new query.
        </div>
      )}
    </div>
  );
}
