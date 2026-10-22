import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Button } from '../../components/common/Button.jsx';
import {
  LifeBuoy,
  BookOpen,
  Paperclip,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

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

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) {
      newErrors.subject = 'Subject line is required';
    } else if (subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a detailed description of your query';
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
        alert('File size exceeds 5MB limit for author attachments.');
        return;
      }
      setAttachmentName(file.name);
    }
  };

  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200/80 p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {createdTicket.ticket_number}
          </span>
          <h2 className="text-2xl font-bold font-serif text-neutral-900 mt-3">
            Support Query Submitted
          </h2>
          <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">
            Your ticket has been received and routed to the BookLeaf Editorial Operations queue. Our team typically replies within 24–48 hours.
          </p>
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 text-xs text-left border border-neutral-100 space-y-1.5">
          <p><strong className="text-neutral-700">Subject:</strong> {createdTicket.subject}</p>
          <p><strong className="text-neutral-700">Category:</strong> {createdTicket.category}</p>
          <p><strong className="text-neutral-700">Priority Score:</strong> {createdTicket.priority}</p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/author/tickets/${createdTicket.id}`)}
            icon={ArrowRight}
          >
            View Ticket & Conversation
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
      <div>
        <h1 className="text-2xl font-bold font-serif text-neutral-900">Submit a Support Query</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Reach our dedicated publishing, royalties, ISBN, and quality operations team.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Book Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Which book is this query regarding?
            </label>
            <div className="relative">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full text-sm border border-neutral-300 rounded-lg p-2.5 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">General / Account Level Query (No specific book)</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (ISBN: {b.isbn} • {b.status})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Selecting a book provides our operations specialists with instant access to your catalog metadata and royalty balance.
            </p>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quarterly royalty payout inquiry for Q3"
              className={`w-full text-sm border rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 ${
                errors.subject ? 'border-rose-400 focus:ring-rose-500' : 'border-neutral-300 focus:ring-indigo-700'
              }`}
            />
            {errors.subject && (
              <p className="text-xs text-rose-600 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Detailed Query *
              </label>
              <span className="text-[11px] text-neutral-400">
                {description.length} / 4000 characters
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide full details, including any dates, order numbers, or specific questions so our team can resolve your query efficiently."
              className={`w-full text-sm border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 ${
                errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-neutral-300 focus:ring-indigo-700'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Optional Attachment (UI Only) */}
          <div className="border border-dashed border-neutral-300 rounded-xl p-4 bg-neutral-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <Paperclip className="w-4 h-4 text-neutral-500" />
                <span className="font-medium">Photographic Verification / Attachment</span>
                <span className="text-[10px] text-neutral-400">(Optional • PDF, PNG, JPG up to 5MB)</span>
              </div>
              <label className="cursor-pointer bg-white border border-neutral-300 hover:bg-neutral-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 transition-colors shadow-2xs">
                Browse File
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulatedAttachment}
                  className="hidden"
                />
              </label>
            </div>
            {attachmentName ? (
              <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center justify-between">
                <span>Attached: {attachmentName}</span>
                <button
                  type="button"
                  onClick={() => setAttachmentName('')}
                  className="text-neutral-400 hover:text-neutral-600 font-bold"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 mt-1">
                Helpful for print quality defect reports (blurry text, binding flaws) or ISBN barcode screenshots.
              </p>
            )}
          </div>

          {/* AI Notice */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">AI-Assisted Operational Triage: </span>
              Your query will be automatically classified into our 6 publishing operational categories and scored for priority using Google Gemini to ensure rapid escalation.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              isLoading={isSubmitting}
              icon={LifeBuoy}
            >
              Submit Support Query
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
