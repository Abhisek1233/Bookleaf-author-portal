import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Currency } from '../../components/common/Currency.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  BookOpen,
  Search,
  Filter,
  X,
  ExternalLink,
  Layers,
  Calendar,
  DollarSign,
  Printer,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const PRODUCTION_STAGES = [
  { id: 1, name: 'Manuscript Received', desc: 'Author submitted draft file' },
  { id: 2, name: 'Editing', desc: 'Proofing & structure check' },
  { id: 3, name: 'Cover Design', desc: 'Typography & jacket artwork' },
  { id: 4, name: 'Typesetting', desc: 'Interior layout & pagination' },
  { id: 5, name: 'Proofreading', desc: 'Final author proof approval' },
  { id: 6, name: 'ISBN Assignment', desc: 'Imprint barcode registration' },
  { id: 7, name: 'Printing', desc: 'Fulfillment run at Delhi facility' },
  { id: 8, name: 'Distribution Setup', desc: 'Amazon/Flipkart catalog feed' },
  { id: 9, name: 'Published & Live', desc: 'Available for live reader orders' }
];

export function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAuthorBooks(params);
      setBooks(res.data || []);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const getStageIndex = (bookStatus) => {
    if (!bookStatus) return 1;
    if (bookStatus.includes('Published')) return 9;
    if (bookStatus.includes('Distribution')) return 8;
    if (bookStatus.includes('Printing')) return 7;
    if (bookStatus.includes('ISBN')) return 6;
    if (bookStatus.includes('Proofreading')) return 5;
    if (bookStatus.includes('Typesetting')) return 4;
    if (bookStatus.includes('Cover Design')) return 3;
    if (bookStatus.includes('Editing')) return 2;
    return 1;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-3 py-0.5 rounded-full uppercase tracking-wider">
            Author Publishing Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1.5 tracking-tight">
            My Published Titles
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Monitor print partner fulfillment, retail platforms, and 80/20 net profit royalty disbursements.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-stone-200 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-700 text-white shadow-xs' : 'text-stone-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-indigo-700 text-white shadow-xs' : 'text-stone-500 hover:text-slate-800'
              }`}
              title="Data Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by title, ISBN, genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search titles by title, ISBN, or genre"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-stone-50/50 min-h-[44px]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-500" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by publishing status"
            className="text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium min-h-[44px] cursor-pointer"
          >
            <option value="">All Publishing Statuses</option>
            <option value="Published">Published & Live</option>
            <option value="Distribution">Distribution Setup</option>
            <option value="Printing">Printing & Production</option>
            <option value="ISBN">ISBN Assignment</option>
            <option value="Editing">Editing & Typesetting</option>
          </select>
        </div>
      </div>

      {/* Books Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books found"
          description="We couldn't find any titles matching your filter criteria."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setStatusFilter(''); }}
        />
      ) : viewMode === 'grid' ? (
        /* Card Grid View with 3D Book Spine Aesthetic */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((b) => {
            const isLive = b.status?.includes('Published');
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBook(b)}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
              >
                {/* Book Spine Visual Header */}
                <div className="p-6 bg-gradient-to-br from-stone-50 via-white to-stone-100/60 border-b border-stone-100 flex gap-4 items-start relative">
                  {/* Decorative Book Spine */}
                  <div className="w-12 h-16 rounded-r-md bg-indigo-950 text-indigo-200 font-serif font-black flex items-center justify-center text-xs shadow-md shrink-0 border-l-4 border-indigo-500 book-spine-effect">
                    BL
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isLive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {b.status || 'In Production'}
                      </span>
                      {b.genre && (
                        <span className="text-xs text-stone-600 font-semibold bg-stone-100 px-2 py-0.5 rounded-full">
                          {b.genre}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-indigo-800 transition-colors line-clamp-2 leading-snug">
                      {b.title}
                    </h3>
                    <span className="text-xs text-stone-500 font-mono block mt-1">
                      {b.publication_date ? `Pub Date: ${new Date(b.publication_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Status: Manuscript in Production'}
                    </span>
                  </div>
                </div>

                {/* Body Meta */}
                <div className="p-5 space-y-3.5">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Retail MRP</span>
                      <span className="font-bold text-slate-900 font-mono text-sm"><Currency value={b.mrp} /></span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Copies Sold</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{b.total_copies_sold.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Net / Copy</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm"><Currency value={b.author_royalty_per_copy} /></span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Total Earned</span>
                      <span className="font-bold text-slate-900 font-mono text-sm"><Currency value={b.total_royalty_earned} /></span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Royalty Paid</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm"><Currency value={b.royalty_paid} /></span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-semibold block">Pending Payout</span>
                      <span className="font-bold text-amber-700 font-mono text-sm"><Currency value={b.royalty_pending} /></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <span className="font-mono truncate max-w-[170px]">ISBN: {b.isbn || 'Pending Assignment'}</span>
                    <span className="text-indigo-700 font-bold group-hover:underline flex items-center gap-0.5">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar-h max-h-[600px]">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-stone-50/95 text-stone-600 font-semibold border-b border-stone-200 uppercase tracking-wider text-xs sticky top-0 z-10 backdrop-blur">
                <tr>
                  <th className="px-5 py-3.5">Title & Genre</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">ISBN</th>
                  <th className="px-3 py-3.5">Pub Date</th>
                  <th className="px-3 py-3.5 text-right">MRP</th>
                  <th className="px-3 py-3.5 text-right">Sold</th>
                  <th className="px-3 py-3.5 text-right">Earned</th>
                  <th className="px-3 py-3.5 text-right">Paid</th>
                  <th className="px-3 py-3.5 text-right">Pending</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {books.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBook(b)}
                    className="hover:bg-stone-50/90 transition-colors cursor-pointer min-h-[48px]"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 font-serif">
                      <div>{b.title}</div>
                      <div className="text-xs text-stone-500 font-sans font-normal mt-0.5">{b.genre}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 font-mono text-stone-600 text-xs">{b.isbn || 'Pending'}</td>
                    <td className="px-3 py-4 font-mono text-stone-600 text-xs">
                      {b.publication_date ? new Date(b.publication_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-3 py-4 text-right font-mono font-medium text-slate-900"><Currency value={b.mrp} /></td>
                    <td className="px-3 py-4 text-right font-mono font-medium text-slate-900">{b.total_copies_sold.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-4 text-right font-mono font-bold text-indigo-700"><Currency value={b.total_royalty_earned} /></td>
                    <td className="px-3 py-4 text-right font-mono font-semibold text-emerald-700"><Currency value={b.royalty_paid} /></td>
                    <td className="px-3 py-4 text-right font-mono font-bold text-amber-700"><Currency value={b.royalty_pending} /></td>
                    <td className="px-5 py-4 text-center">
                      <Button size="sm" variant="secondary" className="min-h-[36px]">
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Inspection Modal (Fixed Layout, Dedicated Internal Scroll, No Right-Edge Scrollbar Line) */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-white shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Book Dossier • {selectedBook.genre || 'General'}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-1.5 leading-snug">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  ISBN: {selectedBook.isbn || 'Pending registration'} • Published: {selectedBook.publication_date ? new Date(selectedBook.publication_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Manuscript in Production'}
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                aria-label="Close book details modal"
                className="p-2.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 cursor-pointer shrink-0 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body (Dedicated internal scroll with comfortable padding) */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              {/* Publishing Stage Progress (All 9 Stages, non-truncated) */}
              <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    BookLeaf 9-Stage Publishing Lifecycle
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-800 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                    Stage {getStageIndex(selectedBook.status)} of 9
                  </span>
                </div>

                <div className="space-y-2">
                  {PRODUCTION_STAGES.map((st) => {
                    const currentIdx = getStageIndex(selectedBook.status);
                    const isDone = st.id < currentIdx;
                    const isCurrent = st.id === currentIdx;

                    return (
                      <div
                        key={st.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                          isCurrent
                            ? 'bg-indigo-50 border border-indigo-200 font-bold text-indigo-950'
                            : isDone
                            ? 'text-slate-800 bg-white/70 border border-stone-100'
                            : 'text-stone-400'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-indigo-700 text-white shadow-xs'
                              : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {isDone ? '✓' : st.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">{st.name}</span>
                          <span className="text-[10px] font-normal text-stone-500 block truncate">{st.desc}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                            Current Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 80/20 Net Royalty Breakdown Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  BookLeaf 80/20 Royalty Profit Policy
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Net Profit = MRP minus In-House Printing Cost, Channel Platform Fees (Amazon/Flipkart), and Courier Shipping. Author receives <strong>80% of net profit</strong> per book.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Retail MRP</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono"><Currency value={selectedBook.mrp} /></span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Net / Copy</span>
                    <span className="font-bold text-indigo-700 text-sm mt-0.5 block font-mono"><Currency value={selectedBook.author_royalty_per_copy} /></span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Copies Sold</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">{selectedBook.total_copies_sold.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Total Earned</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono"><Currency value={selectedBook.total_royalty_earned} /></span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Royalty Paid</span>
                    <span className="font-bold text-emerald-700 text-sm mt-0.5 block font-mono"><Currency value={selectedBook.royalty_paid} /></span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                    <span className="text-[11px] text-stone-500 uppercase font-semibold block">Pending Payout</span>
                    <span className="font-bold text-amber-700 text-sm mt-0.5 block font-mono"><Currency value={selectedBook.royalty_pending} /></span>
                  </div>
                </div>
              </div>

              {/* Retail Distribution & Print Partner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-800 block mb-2">Print & Fulfillment Partner</span>
                  <p className="text-slate-600 font-medium">{selectedBook.print_partner || 'In-House Delhi Facility'}</p>
                  <p className="text-[11px] text-stone-400 mt-1">Standard print turnaround: 5–7 business days.</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-800 block mb-2">Retail Platforms</span>
                  {selectedBook.available_on && selectedBook.available_on.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBook.available_on.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-stone-200 text-[11px] font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-stone-400 italic">Listing propagation pending.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
              <Link to="/author/tickets/new">
                <Button variant="primary" size="sm" icon={HelpCircle}>
                  Ask Support About This Book
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
