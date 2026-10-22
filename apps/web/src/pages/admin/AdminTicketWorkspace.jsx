import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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
  Clock
} from 'lucide-react';

export function AdminTicketWorkspace() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

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

  // AI Draft state
  const [aiDraft, setAiDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftModel, setDraftModel] = useState('');

  const messagesEndRef = useRef(null);

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

  // Scroll to bottom on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketData?.messages]);

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
      alert('Override saved successfully');
    } catch (err) {
      alert('Failed to override: ' + err.message);
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
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Assign to Self
  const handleAssignToMe = async () => {
    try {
      setIsAssigning(true);
      const res = await api.assignTicket(ticketId, user.id);
      setTicketData((prev) => ({
        ...prev,
        ticket: { ...prev.ticket, ...res.data, assigned_admin_name: user.name }
      }));
    } catch (err) {
      alert('Failed to assign ticket: ' + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Add Internal Note
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
    } catch (err) {
      alert('Failed to save internal note: ' + err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Generate / Regenerate AI Draft
  const handleGenerateDraft = async (force = false) => {
    try {
      setIsDrafting(true);
      const res = await api.generateAiDraft(ticketId, force);
      setAiDraft(res.data.draft_text);
      setDraftModel(res.data.model_used || 'Gemini');
    } catch (err) {
      alert('AI draft generation failed: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  // Send Public Reply to Author
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setIsSendingReply(true);
      const res = await api.sendAdminReply(ticketId, {
        message: replyMessage.trim()
      });
      setTicketData((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data.message],
        ticket: res.data.ticket
      }));
      setReplyMessage('');
      alert('Official response sent to author!');
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
        <p className="font-semibold">Unable to load ticket workspace</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/admin/tickets" className="inline-block mt-4 text-xs font-semibold text-rose-900 underline">
          ← Return to Support Queue
        </Link>
      </div>
    );
  }

  const { ticket, author, book, messages, internal_notes } = ticketData;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Support Queue
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Assign to Self */}
          <Button
            size="sm"
            variant="secondary"
            isLoading={isAssigning}
            onClick={handleAssignToMe}
            icon={User}
          >
            {ticket.assigned_to_id === user.id ? 'Assigned to You' : 'Assign to Me'}
          </Button>

          {/* Quick Status Dropdown */}
          <select
            value={status}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs font-semibold border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-700"
          >
            <option value="Open">Status: Open</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Resolved">Status: Resolved</option>
            <option value="Closed">Status: Closed</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Triage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Query Context, Author Context, Conversation, Reply */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header & Author Context */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
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

              <div className="text-xs text-neutral-400 text-right shrink-0">
                <div>Opened {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                <div>{new Date(ticket.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            {/* Author Profile Snapshot */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-neutral-400 block font-semibold uppercase text-[10px]">Author</span>
                <span className="font-bold text-neutral-900">{author.name}</span>
                <span className="text-neutral-500 block truncate">{author.email}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-semibold uppercase text-[10px]">Location & Joined</span>
                <span className="font-medium text-neutral-800">{author.city}</span>
                <span className="text-neutral-500 block">Member since {new Date(author.joined_date).getFullYear()}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-semibold uppercase text-[10px]">Catalog & Royalties</span>
                <span className="font-medium text-neutral-800">{author.total_books} Book{author.total_books !== 1 ? 's' : ''} Published</span>
                <span className="text-amber-700 font-bold block">
                  Pending: <Currency value={author.total_royalty_pending} />
                </span>
              </div>
            </div>

            {/* Linked Book Context */}
            {book ? (
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    Linked Title: "{book.title}" ({book.genre})
                  </div>
                  <span className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    ISBN: {book.isbn}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-neutral-500 block">Copies Sold:</span>
                    <span className="font-bold text-neutral-800">{book.total_copies_sold.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Royalty Earned:</span>
                    <span className="font-bold text-indigo-900"><Currency value={book.total_royalty_earned} /></span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Royalty Pending:</span>
                    <span className="font-bold text-amber-800"><Currency value={book.royalty_pending} /></span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Print Partner:</span>
                    <span className="font-bold text-neutral-800">{book.print_partner || 'In-House Delhi'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 italic bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                General Query (Not linked to a specific book)
              </div>
            )}

            {/* Original Query Body */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Original Author Query</h3>
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80 text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Public Discussion Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-serif text-neutral-900">
              Author Discussion Timeline ({messages.length})
            </h3>

            {messages.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-neutral-200 text-xs text-neutral-500">
                No public responses sent yet. Generate an AI draft below or compose a manual reply.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => {
                  const isAdmin = m.sender_role === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-2xl border ${
                        isAdmin
                          ? 'bg-indigo-50/50 border-indigo-200 sm:mr-6'
                          : 'bg-white border-neutral-200 sm:ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isAdmin ? 'bg-indigo-900 text-white' : 'bg-neutral-300 text-neutral-800'
                            }`}
                          >
                            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-bold text-neutral-900">
                            {isAdmin ? `BookLeaf Staff (${m.sender_name})` : m.sender_name}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(m.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed pl-8">
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Official Reply Composer */}
          <form onSubmit={handleSendReply} className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Send Official Response to Author
              </label>
              <span className="text-[11px] text-neutral-400">
                Appears immediately in author's dashboard via real-time gateway
              </span>
            </div>

            <textarea
              rows={6}
              required
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write the official response or use 'Copy AI Draft' from the right panel..."
              className="w-full text-sm border border-neutral-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
            />

            <div className="flex justify-end items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSendingReply}
                icon={Send}
              >
                Send Reply to Author
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): AI Triage, Overrides, AI Response Drafting, Private Notes */}
        <div className="space-y-6">
          {/* AI Assessment & Classification Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Triage & Classification
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Confidence: {ticket.ai_confidence ? `${(ticket.ai_confidence * 100).toFixed(0)}%` : '90%'}
              </span>
            </div>

            {/* AI Suggested Values */}
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-2 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">AI Classified Category</span>
                <span className="font-bold text-neutral-900">{ticket.ai_category || ticket.category}</span>
                {ticket.ai_category_reason && (
                  <p className="text-[11px] text-neutral-500 mt-0.5">{ticket.ai_category_reason}</p>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-200/60">
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">AI Priority Score</span>
                <span className="font-bold text-neutral-900">{ticket.ai_priority || ticket.priority}</span>
                {ticket.ai_priority_reason && (
                  <p className="text-[11px] text-neutral-500 mt-0.5">{ticket.ai_priority_reason}</p>
                )}
              </div>
            </div>

            {/* Admin Override Form */}
            <form onSubmit={handleApplyOverride} className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">Admin Override</span>
                {(ticket.is_category_overridden || ticket.is_priority_overridden) && (
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    Active Override
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] text-neutral-500 block mb-1">Override Category</label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white text-neutral-800"
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
                <label className="text-[11px] text-neutral-500 block mb-1">Override Priority</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white text-neutral-800"
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

          {/* AI Response Drafting Assistant Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Response Drafting
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

            <p className="text-[11px] text-neutral-500">
              Grounded strictly in BookLeaf policies (80/20 split, quarterly 45-day payout, reprint guarantee, stock re-sync) and verified author catalog records.
            </p>

            {aiDraft ? (
              <div className="space-y-3">
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 text-xs text-neutral-800 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                  {aiDraft}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Model: {draftModel}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setReplyMessage(aiDraft);
                      alert('Draft copied into response composer! You can edit it before sending.');
                    }}
                    icon={Copy}
                  >
                    Use Draft in Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                <p className="text-xs text-neutral-500 mb-3">No draft generated yet for this ticket.</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleGenerateDraft(false)}
                  isLoading={isDrafting}
                  icon={Sparkles}
                >
                  Generate AI Draft
                </Button>
              </div>
            )}
          </div>

          {/* Private Internal Notes Card (STRICTLY OPS ONLY) */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Internal Ops Notes
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold ml-auto">
                Private
              </span>
            </div>

            <p className="text-[11px] text-neutral-500">
              Notes are stored securely and never visible to authors or published via author endpoints.
            </p>

            {/* Note List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {internal_notes.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No internal notes added yet.</p>
              ) : (
                internal_notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-amber-900 font-semibold mb-1">
                      <span>{n.admin_name}</span>
                      <span className="text-neutral-400">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-neutral-800 whitespace-pre-wrap">{n.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-neutral-100">
              <textarea
                rows={2}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add private note (e.g. verified bank account with finance)..."
                className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full"
                isLoading={isSubmittingNote}
              >
                Add Internal Note
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
