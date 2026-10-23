import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge.jsx';
import { Currency } from '../../components/common/Currency.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  BookOpen,
  Lock,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
  Clock,
  ExternalLink,
  Flame,
  CheckCheck
} from 'lucide-react';

export function AdminTicketWorkspace() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();

  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Triage state
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  // Status & Assignment
  const [status, setStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Private Note state
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Response state
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [autoResolveOnReply, setAutoResolveOnReply] = useState(true);

  // AI Draft state
  const [aiDraft, setAiDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftModel, setDraftModel] = useState('');

  const messagesEndRef = useRef(null);
  const replyTextareaRef = useRef(null);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminTicket(ticketId);
      const data = res.data;
      setTicketData(data);
      setOverrideCategory(data.ticket.category);
      setOverridePriority(data.ticket.priority);
      setStatus(data.ticket.status);
      if (data.ai_draft?.draft_text) {
        setAiDraft(data.ai_draft.draft_text);
        setDraftModel(data.ai_draft.model_used || 'Gemini');
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [ticketId]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !ticketId) return;

    socket.emit('ticket:join', ticketId);

    const handleMessage = (msg) => {
      setTicketData((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          messages: [...prev.messages, msg]
        };
      });
    };

    const handleNote = ({ ticket_id, note }) => {
      if (ticket_id === ticketId) {
        setTicketData((prev) => {
          if (!prev) return prev;
          if (prev.internal_notes.some((n) => n.id === note.id)) return prev;
          return {
            ...prev,
            internal_notes: [...prev.internal_notes, note]
          };
        });
      }
    };

    const handleUpdated = (updated) => {
      setTicketData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ticket: { ...prev.ticket, ...updated }
        };
      });
    };

    socket.on('ticket:message', handleMessage);
    socket.on('ticket:note', handleNote);
    socket.on('ticket:updated', handleUpdated);

    return () => {
      socket.emit('ticket:leave', ticketId);
      socket.off('ticket:message', handleMessage);
      socket.off('ticket:note', handleNote);
      socket.off('ticket:updated', handleUpdated);
    };
  }, [socket, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketData?.messages]);

  // Keyboard Shortcuts for Rapid Triage
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter: Send Reply
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (replyMessage.trim() && !isSendingReply) {
          handleSendReply(e);
        } else {
          toast.info('Please write a message before sending', 'Empty Response');
          replyTextareaRef.current?.focus();
        }
      }
      // Alt+A: Assign to me
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAssignToMe();
      }
      // Alt+D: Insert AI draft
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (aiDraft) {
          setReplyMessage(aiDraft);
          toast.success('AI Draft inserted into response composer', 'Draft Inserted');
          replyTextareaRef.current?.focus();
        } else {
          handleGenerateDraft(false);
        }
      }
      // Alt+R: Focus response composer
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        replyTextareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replyMessage, isSendingReply, aiDraft, user, ticketId, autoResolveOnReply, status]);

  // Handle Category / Priority Override
  const handleApplyOverride = async (e) => {
    e.preventDefault();
    try {
      setIsOverriding(true);
      const res = await api.overrideTicket(ticketId, {
        category: overrideCategory,
        priority: overridePriority,
        override_reason: overrideReason
      });
      setTicketData((prev) => ({
        ...prev,
        ticket: { ...prev.ticket, ...res.data }
      }));
      toast.success('Triage classification updated successfully!', 'Triage Saved');
    } catch (err) {
      toast.error('Failed to update triage: ' + err.message, 'Override Failed');
    } finally {
      setIsOverriding(false);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.updateTicketStatus(ticketId, newStatus);
      setStatus(newStatus);
      setTicketData((prev) => ({
        ...prev,
        ticket: { ...prev.ticket, ...res.data }
      }));
      toast.success(`Ticket marked as ${newStatus}`, 'Status Updated');
    } catch (err) {
      toast.error('Failed to update status: ' + err.message, 'Update Failed');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Self-Assignment
  const handleAssignToMe = async () => {
    try {
      setIsAssigning(true);
      const res = await api.assignTicket(ticketId, user.id);
      setTicketData((prev) => ({
        ...prev,
        ticket: { ...prev.ticket, ...res.data }
      }));
      toast.success('Ticket successfully assigned to you', 'Assigned');
    } catch (err) {
      toast.error('Failed to assign ticket: ' + err.message, 'Assignment Failed');
    } finally {
      setIsAssigning(false);
    }
  };

  // Generate Grounded AI Draft
  const handleGenerateDraft = async (force = false) => {
    try {
      setIsDrafting(true);
      const res = await api.generateAiDraft(ticketId, force);
      setAiDraft(res.data.draft_text);
      setDraftModel(res.data.model_used);
      toast.success('Grounded draft generated with ' + (res.data.model_used || 'Gemini'), 'AI Copilot');
    } catch (err) {
      toast.error('AI draft generation failed: ' + err.message, 'AI Generation Failed');
    } finally {
      setIsDrafting(false);
    }
  };

  // Add Internal Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setIsSubmittingNote(true);
      const res = await api.addInternalNote(ticketId, noteContent.trim());
      setTicketData((prev) => ({
        ...prev,
        internal_notes: [...prev.internal_notes, res.data]
      }));
      setNoteContent('');
      toast.success('Private internal note saved to ticket ledger', 'Note Saved');
    } catch (err) {
      toast.error('Failed to add note: ' + err.message, 'Note Failed');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Send Public Response
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setIsSendingReply(true);
      const res = await api.replyAdminTicket(ticketId, replyMessage.trim());

      setTicketData((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data]
      }));
      setReplyMessage('');
      toast.success('Official response dispatched to author', 'Reply Sent');

      if (autoResolveOnReply && status !== 'Resolved') {
        await handleStatusChange('Resolved');
      }
    } catch (err) {
      toast.error('Failed to send reply: ' + err.message, 'Reply Failed');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load ticket workspace</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/admin/tickets" className="inline-block mt-4 text-xs font-semibold text-rose-900 underline">
          ← Return to Support Queue
        </Link>
      </div>
    );
  }

  const { ticket, author, book, messages, internal_notes, ai_draft } = ticketData;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tickets"
            className="p-2 rounded-xl text-stone-500 hover:text-slate-900 hover:bg-stone-100 transition-colors"
            title="Back to Support Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-base font-serif font-bold text-slate-900 mt-1 line-clamp-1">
              {ticket.subject}
            </h2>
          </div>
        </div>

        {/* Quick Lifecycle Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={ticket.assigned_to_id === user.id ? 'primary' : 'secondary'}
            isLoading={isAssigning}
            onClick={handleAssignToMe}
            icon={User}
          >
            {ticket.assigned_to_id === user.id ? 'Assigned to You' : 'Assign to Me'}
          </Button>

          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              onClick={() => handleStatusChange('Open')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                status === 'Open' ? 'bg-amber-500 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => handleStatusChange('In Progress')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                status === 'In Progress' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('Resolved')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                status === 'Resolved' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => handleStatusChange('Closed')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                status === 'Closed' ? 'bg-slate-700 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Inquiry Context, Author Dossier, Discussion, Reply Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author Dossier & Inquiry Card */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-5">
            {/* Author Background Strip */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Author Profile</span>
                <span className="font-bold text-slate-900 text-sm">{author.name}</span>
                <span className="text-stone-500 block truncate font-mono">{author.email}</span>
                <span className="text-stone-400 text-[11px] block mt-0.5 font-mono">{author.phone} • {author.city}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Catalog Experience</span>
                <span className="font-medium text-slate-800 text-sm font-mono">{author.total_books} Published Titles</span>
                <span className="text-stone-500 block">Member since {new Date(author.joined_date).getFullYear()}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Accrued Royalties</span>
                <span className="font-bold text-sm text-amber-700 block font-mono">
                  Pending: <Currency value={author.total_royalty_pending} />
                </span>
                <span className="text-[11px] text-stone-500">
                  {author.total_royalty_pending >= 1000 ? '✓ Exceeds ₹1k threshold' : 'Below payout threshold'}
                </span>
              </div>
            </div>

            {/* Linked Book Strip */}
            {book ? (
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-indigo-950 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    <span className="font-serif text-sm">"{book.title}"</span> ({book.genre})
                  </div>
                  <span className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold">
                    ISBN: {book.isbn}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-stone-500 block">Copies Sold:</span>
                    <span className="font-bold text-slate-900 font-mono">{book.total_copies_sold.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Royalty Earned:</span>
                    <span className="font-bold text-indigo-950 font-mono"><Currency value={book.total_royalty_earned} /></span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Royalty Pending:</span>
                    <span className="font-bold text-amber-800 font-mono"><Currency value={book.royalty_pending} /></span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Print Hub:</span>
                    <span className="font-bold text-slate-900">{book.print_partner || 'In-House Delhi'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                General Query (Account Level)
              </div>
            )}

            {/* Full Query Description */}
            <div>
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">
                Author Inquiry Text
              </span>
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Conversation Timeline */}
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900">
              Public Discussion Stream ({messages.length} replies)
            </h3>

            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-200 text-sm text-stone-500">
                No replies sent to the author yet. Use the AI response draft from the right panel to compose an official response.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((m) => {
                  const isAdmin = m.sender_role === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        isAdmin
                          ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/40 border-indigo-200 sm:mr-6 shadow-xs'
                          : 'bg-white border-stone-200 sm:ml-6 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              isAdmin ? 'bg-indigo-950 text-white font-serif' : 'bg-stone-200 text-stone-900'
                            }`}
                          >
                            {isAdmin ? <ShieldCheck className="w-4 h-4 text-indigo-300" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block leading-tight">
                              {isAdmin ? `BookLeaf Staff (${m.sender_name})` : m.sender_name}
                            </span>
                            <span className="text-xs text-stone-500 block">
                              {isAdmin ? 'Official Staff Reply' : 'Author Message'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-stone-500 font-mono">
                          {new Date(m.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-base text-slate-900 whitespace-pre-wrap leading-relaxed pl-10">
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Official Response Composer */}
          <form onSubmit={handleSendReply} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="admin-reply-composer" className="block text-sm font-semibold text-slate-800">
                Compose official response to author
              </label>
              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={autoResolveOnReply}
                    onChange={(e) => setAutoResolveOnReply(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-700 focus:ring-indigo-600"
                  />
                  <span>Mark as Resolved upon sending</span>
                </label>
              </div>
            </div>

            <textarea
              id="admin-reply-composer"
              ref={replyTextareaRef}
              rows={7}
              required
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your official resolution or insert AI Draft from the right panel... (Press Ctrl+Enter to dispatch)"
              className="w-full text-base sm:text-sm border border-stone-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white text-slate-900 shadow-2xs leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-stone-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <kbd>Ctrl+Enter</kbd> Send
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <kbd>Alt+D</kbd> AI Draft
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <kbd>Alt+A</kbd> Assign
                </span>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="min-h-[44px]"
                isLoading={isSendingReply}
                icon={Send}
              >
                Send Response to Author
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): AI Copilot, Overrides, Response Draft, Internal Scratchpad */}
        <div className="space-y-6">
          {/* AI Copilot & Classification Card */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Triage Copilot
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Confidence: {ticket.ai_confidence ? `${(ticket.ai_confidence * 100).toFixed(0)}%` : '95%'}
              </span>
            </div>

            {/* AI Suggested Breakdown */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Suggested Category</span>
                <span className="font-bold text-slate-900 text-sm">{ticket.ai_category || ticket.category}</span>
                {ticket.ai_category_reason && (
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{ticket.ai_category_reason}</p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Priority Assessment</span>
                <span className="font-bold text-slate-900 text-sm">{ticket.ai_priority || ticket.priority}</span>
                {ticket.ai_priority_reason && (
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{ticket.ai_priority_reason}</p>
                )}
              </div>
            </div>

            {/* Admin Override Controls */}
            <form onSubmit={handleApplyOverride} className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Administrator Override</span>
                {(ticket.is_category_overridden || ticket.is_priority_overridden) && (
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Active Override
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Override Category</label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white text-slate-800 font-medium"
                >
                  <option value="Royalty & Payments">Royalty & Payments</option>
                  <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                  <option value="Printing & Quality">Printing & Quality</option>
                  <option value="Distribution & Availability">Distribution & Availability</option>
                  <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Override Priority</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white text-slate-800 font-medium"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full"
                isLoading={isOverriding}
                icon={Edit3}
              >
                Save Category & Priority
              </Button>
            </form>
          </div>

          {/* AI Response Drafting Card */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI-suggested draft — review before sending
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleGenerateDraft(true)}
                isLoading={isDrafting}
                icon={RefreshCw}
              >
                {aiDraft ? 'Regenerate' : 'Generate'}
              </Button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Grounded strictly in BookLeaf policies (80/20 royalty formula, 45-day quarterly payout, free reprints) and verified catalog data.
            </p>

            {aiDraft ? (
              <div className="space-y-3">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-sm text-slate-900 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans custom-scrollbar">
                  {aiDraft}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-stone-500 font-mono">
                    Model: {draftModel}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    className="min-h-[40px]"
                    onClick={() => {
                      setReplyMessage(aiDraft);
                      toast.success('AI Draft inserted into response composer! You can edit it before sending.', 'Draft Copied');
                      replyTextareaRef.current?.focus();
                    }}
                    icon={Copy}
                  >
                    Insert Draft into Reply (Alt+D)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-stone-300 rounded-2xl bg-stone-50/50 space-y-2.5">
                <p className="text-sm text-stone-600">Draft response ready to generate based on policy context.</p>
                <Button
                  size="sm"
                  variant="primary"
                  className="min-h-[40px]"
                  onClick={() => handleGenerateDraft(false)}
                  isLoading={isDrafting}
                  icon={Sparkles}
                >
                  Generate AI Draft
                </Button>
              </div>
            )}
          </div>

          {/* Private Ops Internal Notes (Confidential) */}
          <div className="bg-amber-50/50 rounded-3xl border border-amber-300 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Internal notes
                </span>
              </div>
              <span className="text-xs text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                Private — staff only
              </span>
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">
              Notes are strictly internal. Never visible to authors or transmitted across public author channels.
            </p>

            {/* Existing Notes */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {internal_notes.length === 0 ? (
                <p className="text-xs text-amber-800/70 italic">No internal notes logged yet.</p>
              ) : (
                internal_notes.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-amber-950 font-bold mb-1">
                      <span>{n.admin_name}</span>
                      <span className="text-stone-500 font-normal font-mono text-[11px]">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{n.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-amber-200">
              <label htmlFor="internal-note-textarea" className="sr-only">Internal staff note</label>
              <textarea
                id="internal-note-textarea"
                rows={2}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log internal note (e.g. verified tracking with Delhi hub)..."
                className="w-full text-sm border border-amber-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-700 bg-white text-slate-900 shadow-2xs"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full bg-white hover:bg-amber-100/60 text-amber-950 border-amber-300 min-h-[40px]"
                isLoading={isSubmittingNote}
              >
                Save Private Note
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
