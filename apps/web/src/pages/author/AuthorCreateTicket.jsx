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
  Zap
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
    description: 'Hello BookLeaf Team,\n\nI received my batch of author copies today, but unfortunately several copies have noticeable print defects (misaligned page trimming and blurry chapter headings). Under BookLeaf’s free reprint policy, I would like to request a replacement reprint. I can provide photographs upon request.\n\nWarm regards!'
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
    if (text.includes('isbn') || text.includes('asin') || text.includes('barcode')) return { cat: 'ISBN & Metadata Issues', priority: 'High', sla: '< 48h' };
    if (text.includes('royalt') || text.includes('payout') || text.includes('payment') || text.includes('money')) return { cat: 'Royalty & Payments', priority: 'High', sla: '< 48h' };
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
      newErrors.description = 'Please provide details of your query';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await api.createAuthorTicket({
        book_id: selectedBookId || null,
        subject: subject.trim(),
        description: description.trim(),
        attachment_name: attachmentName || null
      });

      setCreatedTicket(res.data);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit support query' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedAttachment = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setAttachmentName(file.name);
    }
  };

  if (createdTicket) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {createdTicket.ticket_number}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-3">
            Ticket Received & Queued
          </h2>
          <p className="text-sm text-neutral-600 mt-1.5 max-w-md mx-auto">
            Your query has been routed to our Delhi Editorial Operations team. AI classification and priority scoring are active.
          </p>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-4 text-xs text-left border border-neutral-200 space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
            <span className="text-neutral-500 font-semibold uppercase text-[10px]">Classification</span>
            <span className="font-bold text-indigo-950">{createdTicket.category}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
            <span className="text-neutral-500 font-semibold uppercase text-[10px]">Triage Priority</span>
            <span className="font-bold text-neutral-900">{createdTicket.priority}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-semibold uppercase text-[10px] block mb-0.5">Subject</span>
            <span className="font-medium text-neutral-900">{createdTicket.subject}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => navigate(`/author/tickets/${createdTicket.id}`)}
            icon={ArrowRight}
          >
            Open Ticket Timeline
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
            Submit Another Query
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
          Author Support Desk
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-1">
          Submit a Publishing Query
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Connect directly with BookLeaf Publishing specialists for royalties, printing, ISBN, and distribution.
        </p>
      </div>

      {/* Quick Template Chips */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2.5">
        <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Common Query Templates (1-Click Pre-fill)
        </span>
        <div className="flex flex-wrap gap-2">
          {COMMON_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="text-xs bg-neutral-50 hover:bg-indigo-50 text-neutral-700 hover:text-indigo-950 border border-neutral-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
            >
              {tmpl.label} +
            </button>
          ))}
        </div>
      </div>

      {/* Main Ticket Form Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Book Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Select Book / General Account Level *
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full text-xs sm:text-sm border border-neutral-300 rounded-xl p-3 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 font-medium"
            >
              <option value="">General / Account Level Query (No Specific Title)</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (ISBN: {b.isbn} • {b.status})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Inquiring regarding Q3 royalty distribution schedule"
              className={`w-full text-sm border rounded-xl p-3 bg-white focus:outline-none focus:ring-2 ${
                errors.subject ? 'border-rose-400 focus:ring-rose-500' : 'border-neutral-300 focus:ring-indigo-700'
              }`}
            />
            {errors.subject && <p className="text-xs text-rose-600 mt-1">{errors.subject}</p>}
          </div>

          {/* Detailed Query Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Detailed Inquiry *
              </label>
              <span className="text-[11px] text-neutral-400 font-mono">
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
                errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-neutral-300 focus:ring-indigo-700'
              }`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Live AI Classification Indicator */}
          {description.length > 10 && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-indigo-950 font-medium">
                  Auto-Triage Preview: <strong>{prediction.cat}</strong>
                </span>
              </div>
              <span className="text-[11px] text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 font-semibold">
                Est. Resolution: {prediction.sla}
              </span>
            </div>
          )}

          {/* Photographic Attachment (UI Only) */}
          <div className="border border-dashed border-neutral-300 rounded-2xl p-4 bg-neutral-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <Paperclip className="w-4 h-4 text-neutral-500" />
                <div>
                  <span className="font-semibold block">Attach Photo / Screenshot</span>
                  <span className="text-[10px] text-neutral-400">PDF, JPG, PNG up to 5MB (Useful for print defect verification)</span>
                </div>
              </div>
              <label className="cursor-pointer bg-white border border-neutral-300 hover:bg-neutral-50 px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-800 transition-colors shadow-2xs">
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
                <span>✓ {attachmentName}</span>
                <button
                  type="button"
                  onClick={() => setAttachmentName('')}
                  className="text-neutral-500 hover:text-neutral-800 font-bold"
                >
                  ✕
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
