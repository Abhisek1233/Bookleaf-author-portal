import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  LifeBuoy,
  BookOpen,
  Paperclip,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  FileText,
  Clock,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

const COMMON_TEMPLATES = [
  {
    label: 'Royalty & Payout Schedule',
    subject: 'Quarterly Royalty Payout Status Inquiry',
    category: 'Royalty & Payments',
    description: 'Hello BookLeaf Team,\n\nI would like to inquire about my accrued royalty disbursement for the previous quarter. My dashboard shows accumulated pending royalties exceeding the ₹1,000 threshold. Could you please confirm the expected bank transfer date and verify that my account details are active?\n\nThank you!'
  },
  {
    label: 'Amazon ISBN Mismatch',
    subject: 'Discrepancy in ISBN on Amazon Listing',
    category: 'ISBN & Metadata Issues',
    description: 'Hello Support,\n\nI noticed that the listing for my book on Amazon India displays an ISBN that does not match the official ISBN printed on my physical author copies. Readers are reaching out about catalog confusion. Please escalate this to your production catalog team for a metadata re-sync.\n\nThank you!'
  },
  {
    label: 'Print Quality Defect Report',
    subject: 'Defective Print / Binding Issue in Author Copies',
    category: 'Printing & Quality',
    description: 'Hello BookLeaf Team,\n\nI received my batch of author copies today, but unfortunately several copies have noticeable print defects (misaligned page trimming and blurry chapter headings). Under BookLeaf\'s free reprint policy, I would like to request a replacement reprint. I can provide photographs upon request.\n\nWarm regards!'
  },
  {
    label: 'Amazon "Currently Unavailable" Sync',
    subject: 'Book Showing as Currently Unavailable on Amazon',
    category: 'Distribution & Availability',
    description: 'Hello Team,\n\nMy published title is showing as "Currently Unavailable" on Amazon India even though it is active in my dashboard. I understand this might be an automated inventory stock sync delay. Could the distribution operations team please trigger a 24-48 hour stock re-sync with Amazon?\n\nThank you!'
  }
];

export function AuthorCreateTicket() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    async function loadAuthorBooks() {
      try {
        const res = await api.getAuthorBooks();
        setBooks(res.data || []);
      } catch (err) {
        console.error('Failed to load author books:', err);
      }
    }
    loadAuthorBooks();
  }, []);

  // Live Heuristic / AI Category Prediction
  const getPredictedCategory = () => {
    const text = `${subject} ${description}`.toLowerCase();
    if (text.includes('isbn') || text.includes('asin') || text.includes('barcode')) return { cat: 'ISBN & Metadata Issues', priority: 'High', sla: '< 48 Hours' };
    if (text.includes('royalt') || text.includes('payout') || text.includes('payment') || text.includes('money')) return { cat: 'Royalty & Payments', priority: 'High', sla: '< 48 Hours' };
    if (text.includes('print') || text.includes('quality') || text.includes('blurry') || text.includes('defective')) return { cat: 'Printing & Quality', priority: 'High', sla: '5–7 Business Days' };
    if (text.includes('amazon') || text.includes('unavailable') || text.includes('stock')) return { cat: 'Distribution & Availability', priority: 'Medium', sla: '24–48 Hours' };
    if (text.includes('typesetting') || text.includes('cover') || text.includes('production') || text.includes('proof')) return { cat: 'Book Status & Production Updates', priority: 'Medium', sla: '< 48 Hours' };
    return { cat: 'General Inquiry', priority: 'Standard', sla: '< 24 Hours' };
  };

  const prediction = getPredictedCategory();

  const handleApplyTemplate = (tmpl) => {
    setSubject(tmpl.subject);
    setDescription(tmpl.description);
  };

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) {
      newErrors.subject = 'Subject line is required';
    } else if (subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe your inquiry in detail';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide more detail (at least 15 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        book_id: selectedBookId || null
      };

      const res = await api.createTicket(payload);
      setCreatedTicket(res.data);
      toast.success('Your ticket reference is ' + res.data.ticket_number, 'Inquiry Submitted');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit inquiry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedAttachment = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  // Success Confirmation Screen
  if (createdTicket) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
              Ticket Logged Successfully
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 pt-1">
              Inquiry Dispatched to Operations
            </h2>
            <p className="text-xs text-stone-500 font-mono">
              Ticket Reference: {createdTicket.ticket_number}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Assigned Department:</span>
              <span className="font-bold text-slate-900">{createdTicket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Priority Score:</span>
              <span className="font-bold text-indigo-700">{createdTicket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">SLA Resolution Target:</span>
              <span className="font-bold text-emerald-700">Within {prediction.sla}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Our editorial operations specialists have received your ticket. You will receive real-time updates and notification when staff replies.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate(`/author/tickets/${createdTicket.id}`)}
              icon={ArrowRight}
            >
              Open Ticket Stream
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCreatedTicket(null);
                setSubject('');
                setDescription('');
                setSelectedBookId('');
                setAttachmentName('');
              }}
            >
              Submit Another Inquiry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-3 py-0.5 rounded-full uppercase tracking-wider">
          Editorial Support Desk
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1.5 tracking-tight">
          Submit Support Inquiry
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Reach BookLeaf Publishing operations regarding royalties, ISBN catalog listings, and print quality.
        </p>
      </div>

      {/* 1-Click Quick Query Templates */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Zap className="w-4 h-4 text-indigo-700" />
          <span>Quick query templates (click to auto-fill):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMON_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-4 text-left rounded-2xl bg-white border border-stone-200/90 hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group min-h-[44px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                  {tmpl.label}
                </span>
                <span className="text-xs text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-md font-semibold border border-indigo-200 shrink-0">
                  {tmpl.category}
                </span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-1 mt-1.5 leading-relaxed">
                {tmpl.subject}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Ticket Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errors.form && (
            <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Book Selector (Optional) */}
          <div>
            <label htmlFor="ticket-book" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Associated book (optional)
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <select
                id="ticket-book"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full pl-10 pr-3 min-h-[44px] text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700 text-slate-900 shadow-2xs"
              >
                <option value="">General author account / non-book specific</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} {b.isbn ? `(ISBN: ${b.isbn})` : '(In Production)'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Select a book if your inquiry relates to royalties, ISBN, distribution, or print quality.
            </p>
          </div>

          {/* Subject Line */}
          <div>
            <label htmlFor="ticket-subject" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Subject line <span className="text-rose-600">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Inquiring regarding Q3 royalty distribution schedule"
              className={`w-full min-h-[44px] text-sm border rounded-xl px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 shadow-2xs ${
                errors.subject ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-700'
              }`}
            />
            {errors.subject && (
              <p id="ticket-subject-error" role="alert" className="text-xs text-rose-600 mt-1 font-medium">
                {errors.subject}
              </p>
            )}
          </div>

          {/* Detailed Query Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="ticket-description" className="block text-sm font-semibold text-slate-800">
                Detailed inquiry <span className="text-rose-600">*</span>
              </label>
              <span
                id="ticket-desc-count"
                className={`text-xs font-mono transition-colors ${
                  description.length > 3800 ? 'text-rose-600 font-bold' : description.length > 3200 ? 'text-amber-700 font-semibold' : 'text-stone-500'
                }`}
              >
                {description.length} / 4000
              </span>
            </div>
            <textarea
              id="ticket-description"
              required
              rows={6}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "ticket-desc-error ticket-desc-count" : "ticket-desc-count"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details, order IDs, dates, or ISBN references to help our team resolve your query swiftly..."
              className={`w-full text-base sm:text-sm border rounded-xl p-3.5 bg-white text-slate-900 focus:outline-none focus:ring-2 shadow-2xs ${
                errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-700'
              }`}
            />
            {errors.description && (
              <p id="ticket-desc-error" role="alert" className="text-xs text-rose-600 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Live AI Classification Indicator */}
          {description.length > 10 && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-indigo-950 font-medium">
                  Auto-triage preview: <strong>{prediction.cat}</strong>
                </span>
              </div>
              <span className="text-xs text-indigo-900 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold w-fit">
                Est. Resolution: {prediction.sla}
              </span>
            </div>
          )}

          {/* Photographic Attachment UI */}
          <div className="border border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm text-stone-700">
                <Paperclip className="w-4 h-4 text-stone-500 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Attach photo / screenshot</span>
                  <span className="text-xs text-stone-500">PDF, JPG, PNG up to 5MB (Useful for print defect verification)</span>
                </div>
              </div>
              <label
                htmlFor="ticket-attachment"
                className="cursor-pointer bg-white border border-stone-300 hover:bg-stone-50 px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 transition-colors shadow-2xs min-h-[40px] inline-flex items-center justify-center shrink-0"
              >
                Select File
                <input
                  id="ticket-attachment"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulatedAttachment}
                  className="sr-only"
                />
              </label>
            </div>
            {attachmentName && (
              <div className="mt-3 text-xs text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5 truncate">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{attachmentName}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachmentName('')}
                  aria-label="Remove attached file"
                  className="text-stone-600 hover:text-stone-900 font-bold cursor-pointer p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/author/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={LifeBuoy}
            >
              Submit Ticket to Operations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
