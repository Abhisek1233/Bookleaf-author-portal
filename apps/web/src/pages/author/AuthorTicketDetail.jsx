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
  CheckCircle2
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

  // Real-time Socket.IO room subscription
  useEffect(() => {
    if (!socket || !ticketId) return;

    socket.emit('ticket:join', ticketId);

    const handleMessage = (newMsg) => {
      setMessages((prev) => {
        // Deduplicate
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
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load ticket</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/author/tickets" className="inline-block mt-4 text-xs font-semibold text-rose-900 underline">
          ← Return to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/author/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Support Tickets
        </Link>
        <span className="text-xs text-neutral-400 font-mono">ID: {ticket.ticket_number}</span>
      </div>

      {/* Ticket Header & Metadata Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-xs text-neutral-500 space-y-1 sm:text-right shrink-0">
            <div>Opened {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div>Last Activity {new Date(ticket.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Linked Book Context Banner */}
        {ticket.book_title ? (
          <div className="flex items-center gap-2.5 text-xs bg-indigo-50/70 border border-indigo-100 text-indigo-950 p-3 rounded-xl">
            <BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />
            <div>
              <span className="font-semibold">Linked Book: </span>
              {ticket.book_title}
              {ticket.book_isbn && <span className="font-mono text-indigo-800 ml-1.5">({ticket.book_isbn})</span>}
              {ticket.book_status && <span className="text-indigo-600 ml-1.5">• {ticket.book_status}</span>}
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500 italic bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
            Account Level / General Query
          </div>
        )}

        {/* Original Description */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Original Inquiry</h3>
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {ticket.attachment_name && (
          <div className="text-xs text-neutral-600 flex items-center gap-1.5 pt-1">
            <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
            <span>Attachment: {ticket.attachment_name}</span>
          </div>
        )}
      </div>

      {/* Conversation Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-serif text-neutral-900">
          Official Support Timeline ({messages.length} replies)
        </h3>

        {messages.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-neutral-200 text-xs text-neutral-500">
            Our editorial operations team has received your ticket and is preparing a response. You will see replies appear here automatically.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAdmin
                      ? 'bg-indigo-50/50 border-indigo-100 sm:mr-8'
                      : 'bg-white border-neutral-200/80 sm:ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isAdmin
                            ? 'bg-indigo-900 text-white'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900">
                          {isAdmin ? 'BookLeaf Editorial Support' : msg.sender_name}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] bg-indigo-900 text-white px-1.5 py-0.2 rounded font-semibold ml-2">
                            Official
                          </span>
                        )}
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

                  <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed pl-9">
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Author Reply Composer */}
      {ticket.status !== 'Closed' ? (
        <form onSubmit={handleSendReply} className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-3">
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Reply to BookLeaf Operations
          </label>
          <textarea
            rows={3}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response or additional details here..."
            className="w-full text-sm border border-neutral-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
          />
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-neutral-400">
              Updates occur in real time without refreshing the page.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSending}
              icon={Send}
            >
              Send Reply
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-neutral-100 rounded-xl p-4 text-center text-xs text-neutral-600 border border-neutral-200">
          This ticket is marked as Closed. If you need further assistance, please open a new support query.
        </div>
      )}
    </div>
  );
}
