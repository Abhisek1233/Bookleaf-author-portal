import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Query Templates (Click to Auto-Fill):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMON_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3.5 text-left rounded-2xl bg-white border border-stone-200/90 hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">
                  {tmpl.label}
                </span>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
                  {tmpl.category}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                {tmpl.subject}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Ticket Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Book Selector (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Associated Book (Optional)
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">General Author Account / Non-Book Specific</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} {b.isbn ? `(ISBN: ${b.isbn})` : '(In Production)'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Select a book if your inquiry relates to royalties, ISBN, distribution, or print quality.
            </p>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Inquiring regarding Q3 royalty distribution schedule"
              className={`w-full text-sm border rounded-xl p-3 bg-white focus:outline-none focus:ring-2 ${
                errors.subject ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-700'
              }`}
            />
            {errors.subject && <p className="text-xs text-rose-600 mt-1">{errors.subject}</p>}
          </div>

          {/* Detailed Query Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Detailed Inquiry *
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {description.length} / 4000
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details, order IDs, dates, or ISBN references to help our team resolve your query swiftly..."
              className={`w-full text-sm border rounded-xl p-3.5 bg-white focus:outline-none focus:ring-2 ${
                errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-700'
              }`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Live AI Classification Indicator */}
          {description.length > 10 && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-indigo-950 font-medium">
                  Auto-Triage Preview: <strong>{prediction.cat}</strong>
                </span>
              </div>
              <span className="text-[11px] text-indigo-800 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold">
                Est. Resolution: {prediction.sla}
              </span>
            </div>
          )}

          {/* Photographic Attachment UI */}
          <div className="border border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-700">
                <Paperclip className="w-4 h-4 text-stone-500" />
                <div>
                  <span className="font-semibold block">Attach Photo / Screenshot</span>
                  <span className="text-[10px] text-stone-400">PDF, JPG, PNG up to 5MB (Useful for print defect verification)</span>
                </div>
              </div>
              <label className="cursor-pointer bg-white border border-stone-300 hover:bg-stone-50 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs">
                Select File
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulatedAttachment}
                  className="hidden"
                />
              </label>
            </div>
            {attachmentName && (
              <div className="mt-3 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  {attachmentName}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachmentName('')}
                  className="text-stone-500 hover:text-stone-800 font-bold cursor-pointer"
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
